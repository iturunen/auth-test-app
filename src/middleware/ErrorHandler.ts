import { ErrorRequestHandler, Response } from 'express';

export const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
): Response => {
  const statusCode = 500;
  if (err instanceof Error) {
    const jsonError = JSON.stringify({
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
    req.logger.error(`${statusCode} ${jsonError}`);
  } else {
    req.logger.error(`${statusCode} ${err}`);
  }
  return res.status(statusCode).json({ message: 'Internal error' });
};
