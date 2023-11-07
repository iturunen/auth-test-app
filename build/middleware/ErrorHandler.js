"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) => {
    const statusCode = 500;
    if (err instanceof Error) {
        // Using JSON.stringify to err yields empty object
        const jsonError = JSON.stringify({
            name: err.name,
            message: err.message,
            stack: err.stack,
        });
        req.logger.error(`${statusCode} ${jsonError}`);
    }
    else {
        req.logger.error(`${statusCode} ${err}`);
    }
    return res.status(statusCode).json({ message: 'Internal server error' });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=ErrorHandler.js.map