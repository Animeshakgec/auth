class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'failed' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}
//es6 vs eslint
module.exports = AppError;