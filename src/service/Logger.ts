
import pino from 'pino';
import { Request, Response, NextFunction } from 'express';


const getLogLevel = (): string => {
  const validLogLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
  var logLevel = process.env.LOG_LEVEL ?? 'info'
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

export const setupExpressLogger = (req: Request, res: Response, next: NextFunction): void => {
  req.logger = Logger;
  req.logger.info(`Started to handle a request`)
  next();
};

