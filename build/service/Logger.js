"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupLogger = exports.ExpressLogger = exports.Logger = void 0;
const pino_1 = __importDefault(require("pino"));
const getLogLevel = () => {
    const validLogLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
    const logLevel = process.env.LOG_LEVEL ?? 'info';
    return validLogLevels.includes(logLevel) ? logLevel : 'info';
};
const defaultOptions = (logLevel, customDefinedHostname) => ({
    level: logLevel,
    name: 'default-logger',
    timestamp: () => `,"timestamp":${Date.now()}`,
    messageKey: 'message',
    formatters: {
        level(description) {
            return { logLevel: description };
        },
        bindings(bindings) {
            return {
                host: customDefinedHostname ?? bindings.hostname,
            };
        },
    },
});
exports.Logger = (0, pino_1.default)(defaultOptions(getLogLevel()));
const ExpressLogger = (req) => ({
    info(message) {
        exports.Logger.info({ requestId: req.requestId }, message);
    },
    debug(message) {
        exports.Logger.debug({ requestId: req.requestId }, message);
    },
    warn(message) {
        exports.Logger.warn({ requestId: req.requestId }, message);
    },
    error(message) {
        exports.Logger.error({ requestId: req.requestId }, message);
    },
    fatal(message) {
        exports.Logger.fatal({ requestId: req.requestId }, message);
    },
});
exports.ExpressLogger = ExpressLogger;
const SetupLogger = (req, res, next) => {
    req.logger = (0, exports.ExpressLogger)(req);
    next();
};
exports.SetupLogger = SetupLogger;
//# sourceMappingURL=Logger.js.map