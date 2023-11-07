import { Logger } from  middleware/Logger.ts
import { Request } from 'express';

export { }

declare global {
  namespace Express {
    export interface Request {
      logger: Logger;
      requestId: string;
    }
  }
}