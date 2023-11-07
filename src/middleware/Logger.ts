import pino from 'pino';
import type {
  NextFunction, Request, RequestHandler, Response,
} from 'express';

const getLogLevel = (): string => {
  const validLogLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
  const logLevel = process.env.LOG_LEVEL ?? 'info';
  return validLogLevels.includes(logLevel) ? logLevel : 'info';
};

const defaultOptions = (
  logLevel: string,
  customDefinedHostname?: string,
): pino.LoggerOptions => ({
  level: logLevel,
  name: 'default-logger',
  timestamp: (): string => `,"timestamp":${Date.now()}`,
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

export const Logger: pino.Logger = pino(defaultOptions(getLogLevel()));

export interface Logging {
  info(message: string): void;
  debug(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  fatal(message: string): void;
}

export const ExpressLogger = (req: Request): Logging => ({
  info(message: string): void {
    Logger.info({ requestId: req.requestId }, message);
  },
  debug(message: string): void {
    Logger.debug({ requestId: req.requestId }, message);
  },
  warn(message: string): void {
    Logger.warn({ requestId: req.requestId }, message);
  },
  error(message: string): void {
    Logger.error({ requestId: req.requestId }, message);
  },
  fatal(message: string): void {
    Logger.fatal({ requestId: req.requestId }, message);
  },
});

// eslint-disable-next-line max-len
export const SetupLogger: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  req.logger = ExpressLogger(req);
  next();
};
