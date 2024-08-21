export class ApiError extends Error {
    constructor(readonly statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}