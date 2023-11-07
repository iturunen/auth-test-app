import axios from 'axios';
import { verify, decode } from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
// import { Request, NextFunction } from 'express';
import { isNil } from 'ramda';
import { Middleware, Next, Request } from 'typera-express';
import * as typeraResponse from 'typera-express/response';
import { Logger } from './Logger';

const OPENID_CONFIGURATION_URL = process.env.OPENID_CONFIGURATION_URL ?? '';
const BEARER_PATTERN = /^Bearer ([A-Za-z0-9_-]+\.){2}[A-Za-z0-9_-]{1}/;
// var JWS_REGEX = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;

type OpenIDConfiguration = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  end_session_endpoint?: string;
  jwks_uri: string;
  check_session_iframe?: string;
};

type OperationSuccess = {
  success: boolean;
  reason?: string;
};

const fetchOpenIDConfiguration = async (): Promise<OpenIDConfiguration | undefined> => {
  try {
    const response = await axios.get<OpenIDConfiguration>(OPENID_CONFIGURATION_URL);
    return response.data;
  } catch (error) {
    Logger.error('Error fetching OpenID configuration');
    return undefined;
  }
};

const fetchJwks = async (): Promise<string[]> => {
  const config = await fetchOpenIDConfiguration();
  if (!config) {
    Logger.error('Error fetching jwks: OpenID configuration missing');
    return [];
  }
  const response = await axios.get(config.jwks_uri);
  return response.data.keys;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const decodedJwtIsMalformed = (decodedToken: any): boolean => {
  if (
    decodedToken !== null
    && typeof decodedToken === 'object'
    && decodedToken.payload
    && typeof decodedToken.payload === 'object'
    && decodedToken.header
    && typeof decodedToken.header === 'object'
  ) {
    return false;
  }
  return true;
};

const verifyToken = async (authHeader:string |undefined): Promise<OperationSuccess> => {
  if (!authHeader) {
    Logger.error('Error verifying token: Token missing');
    return { success: false, reason: 'No token provided' };
  }
  // if not starts with Bearer
  if (!authHeader.startsWith('Bearer ')) {
    Logger.error('Error verifying token: Token is not a proper bearer token');
    return { success: false, reason: 'Invalid auth scheme' };
  }

  const match = authHeader.match(BEARER_PATTERN);
  if (isNil(match)) {
    Logger.error('Token is not a proper bearer token');
    return { success: false, reason: 'Token is malformed' };
  }
  const encodedToken = authHeader.replace('Bearer ', '');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decodedToken: any = decode(encodedToken, { complete: true });
  if (decodedJwtIsMalformed(decodedToken)) {
    return { success: false, reason: 'Token is malformed' };
  }

  const { kid } = decodedToken.header;
  const jwksKeys = await fetchJwks();

  if (!jwksKeys) {
    return { success: false, reason: 'No jwk keys provided by auth server' };
  }

  const key = jwksKeys.find((k) => k.kid === kid);
  if (!key) {
    return { success: false, reason: 'Token signed with invalid key' };
  }

  const now = Date.now() / 1000;
  if (decodedToken.payload.exp && decodedToken.payload.exp < now) {
    return { success: false, reason: 'Token expired' };
  }
  const pem = jwkToPem(key);
  verify(encodedToken, pem, { algorithms: ['RS256'] });
  return { success: true };
};

export const typeraVerifyTokenMiddleware: Middleware.Middleware<
Request<{ headers: { authorization?: string } }>,
| typeraResponse.Unauthorized<{ message: string }>
| Next
> = async (request) => {
  const auth_header = request.req.headers.authorization;
  const result = await verifyToken(auth_header);

  if (result.success) {
    return Next();
  }
  Logger.error(`Error verifying token: ${result.reason}`);
  // You can use the response module to create an HTTP response
  return Middleware.stop(typeraResponse.unauthorized({ message: 'Unauthorized' }));
};
