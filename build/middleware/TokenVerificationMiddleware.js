"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenMiddleware = void 0;
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const jwk_to_pem_1 = __importDefault(require("jwk-to-pem"));
const Logger_1 = require("../service/Logger");
const ramda_1 = require("ramda");
const OPENID_CONFIGURATION_URL = process.env.OPENID_CONFIGURATION_URL ?? '';
const BEARER_PATTERN = /^Bearer ([A-Za-z0-9_-]+\.){2}[A-Za-z0-9_-]{1}/;
function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    return String(error);
}
const fetchOpenIDConfiguration = async () => {
    try {
        const response = await axios_1.default.get(OPENID_CONFIGURATION_URL);
        return response.data;
    }
    catch (error) {
        Logger_1.Logger.error(`Error fetching OpenID configuration`);
        //throw new Error(`OpenID conf fetch failed: ${error.message}`);
    }
};
const fetchJwks = async () => {
    const config = await fetchOpenIDConfiguration();
    if (!config) {
        Logger_1.Logger.error(`Error fetching jwks: OpenID configuration missing`);
        return [];
        //throw new Error('OpenID configuration missing');
    }
    const response = await axios_1.default.get(config.jwks_uri);
    return response.data.keys;
};
const decodeJWT = (token) => {
    const decodedToken = jsonwebtoken_1.default.decode(token, { complete: true });
    if (decodedToken !== null
        && typeof decodedToken === 'object'
        && decodedToken.payload
        && typeof decodedToken.payload === 'object'
        && decodedToken.header
        && typeof decodedToken.header === 'object') {
        return decodedToken;
    }
    throw new jsonwebtoken_1.JsonWebTokenError('Malformed token');
};
const decodedJwtIsMalformed = (decodedToken) => {
    if (decodedToken !== null
        && typeof decodedToken === 'object'
        && decodedToken.payload
        && typeof decodedToken.payload === 'object'
        && decodedToken.header
        && typeof decodedToken.header === 'object') {
        return false;
    }
    return true;
};
const verifyToken = async (auth_header) => {
    if (!auth_header) {
        Logger_1.Logger.error(`Error verifying token: Token missing`);
        return { success: false, reason: 'No token provided' };
    }
    // if not starts with Bearer
    if (!auth_header.startsWith('Bearer ')) {
        Logger_1.Logger.error(`Error verifying token: Token is not a proper bearer token`);
        return { success: false, reason: 'Invalid auth' };
    }
    const match = auth_header.match(BEARER_PATTERN);
    if ((0, ramda_1.isNil)(match)) {
        Logger_1.Logger.error('Token is not a proper bearer token');
        return { success: false, reason: 'Token is malformed' };
    }
    const encodedToken = auth_header.replace('Bearer ', '');
    const decodedToken = jsonwebtoken_1.default.decode(encodedToken, { complete: true });
    if (!decodedJwtIsMalformed(decodedToken)) {
        return { success: false, reason: 'Token is malformed' };
    }
    const kid = decodedToken.header.kid;
    const jwksKeys = await fetchJwks();
    if (!jwksKeys) {
        return { success: false, reason: 'No jwk keys provided by auth server' };
    }
    const key = jwksKeys.find(k => k.kid === kid);
    if (!key) {
        return { success: false, reason: 'Token signed with invalid key' };
    }
    const pem = (0, jwk_to_pem_1.default)(key);
    jsonwebtoken_1.default.verify(auth_header, pem, { algorithms: ['RS256'] });
    const now = Date.now() / 1000;
    if (decodedToken.payload.exp && decodedToken.payload.exp < now) {
        return { success: false, reason: 'Token expired' };
    }
    return { success: true };
    //}
    // catch (error) {
    //   return { success: false, reason: getErrorMessage(error) };
    // }
};
const verifyTokenMiddleware = async (req, res, next) => {
    const auth_header = req.headers.authorization;
    const result = await verifyToken(auth_header);
    if (result.success) {
        next();
    }
    else {
        Logger_1.Logger.error(`Error verifying token: ${result.reason}`);
        // switch (result.reason) {
        //   case 'Token expired':
        //     return res.status(401).send('Token expired');
        //   case 'malformed token detected':
        //     return res.status(403).send('Malformed token detected');
        //   case 'Token signed with invalid key':
        //     return res.status(401).send('Invalid token signature');
        //   case 'Unexpected error fetching jwks':
        //   default:
        //     return res.status(401).send('Invalid token');
        // }
    }
};
exports.verifyTokenMiddleware = verifyTokenMiddleware;
//# sourceMappingURL=TokenVerificationMiddleware.js.map