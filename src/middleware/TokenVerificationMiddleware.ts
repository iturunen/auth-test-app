import axios from 'axios';
import jwt, { JsonWebTokenError, JwtHeader, TokenExpiredError } from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../service/Logger';

const OPENID_CONFIGURATION_URL = process.env.OPENID_CONFIGURATION_URL ?? '';

type OpenIDConfiguration = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  end_session_endpoint?: string;
  jwks_uri: string;
  check_session_iframe?: string;
};

interface DecodedJWT {
  header: JwtHeader;
  payload: Record<string, unknown>;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}

const fetchOpenIDConfiguration = async (): Promise<OpenIDConfiguration> => {
  try {
    const response = await axios.get<OpenIDConfiguration>(OPENID_CONFIGURATION_URL);
    return response.data;
  } catch (error) {
    throw new Error(`OpenID conf fetch failed: ${error.message}`);
  }
};

const fetchJwks = async (): Promise<any[]> => {
  const config = await fetchOpenIDConfiguration();
  const response = await axios.get(config.jwks_uri);
  return response.data.keys;
};

export const decodeJWT = (token: string): DecodedJWT => {
  const decodedToken: any = jwt.decode(token, { complete: true });
  if (
    decodedToken !== null
    && typeof decodedToken === 'object'
    && decodedToken.payload
    && typeof decodedToken.payload === 'object'
    && decodedToken.header
    && typeof decodedToken.header === 'object'
  ) {
    return decodedToken as DecodedJWT;
  }
  throw new JsonWebTokenError('malformed token detected');
};

const verifyToken = async (token: string): Promise<boolean> => {
  const decodedToken = decodeJWT(token);
  const kid = decodedToken.header.kid;
  const jwksKeys = await fetchJwks();
  if (!jwksKeys) {
    throw new JsonWebTokenError('Unexpected error fetching jwks');
  }
  const key = jwksKeys.find(k => k.kid === kid);
  if (!key) {
    throw new JsonWebTokenError('Token signed with invalid key');
  }
  const pem = jwkToPem(key);
  jwt.verify(token, pem, { algorithms: ['RS256'] });
  const now = Date.now() / 1000;
  if (decodedToken.payload.exp && decodedToken.payload.exp < now) {
    throw new TokenExpiredError('Token expired', new Date(decodedToken.payload.exp * 1000));
  }
  return true;
};

export const verifyTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if ('Bearer' !== req.headers.authorization?.split(' ')[0]) {
    Logger.error(`Error verifying token: No bearer`);
    return res.status(403).send('Malformed token detected');
  }
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    Logger.error(`Error verifying token: Token missing`);
    return res.status(401).send('Token missing');
  }
  try {
    await verifyToken(token);
    next();
  } catch (err) {
    Logger.error(`Error verifying token: ${getErrorMessage(err)}`);
    if (err instanceof JsonWebTokenError) {
      if (err instanceof TokenExpiredError) {
        return res.status(401).send('Token expired');
      }
      switch (err.message) {
        case 'malformed token detected':
          return res.status(403).send('Malformed token detected');
        case 'Token signed with invalid key':
          return res.status(401).send('Invalid token signature');
        default:
          return res.status(401).send('Invalid token');
      }
    }
   else {
      // Handle other non-JWT specific errors
      Logger.error(`Unexpected error verifying token: ${getErrorMessage(err)}`);
      return res.status(500).send('Internal server error');
    }
  }
}