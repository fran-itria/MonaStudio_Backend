import { HttpException, HttpStatus } from "@nestjs/common";

export class ErrorsExceptions extends HttpException {
    constructor(errorCode: string, message: string, status: HttpStatus) {
        super(
            {
                errorCode,
                message,
                status,
                timestamp: new Date(),
            },
            status,
        );
    }

    static notFound(errorCode: string, message: string) {
        return new ErrorsExceptions(errorCode, message, HttpStatus.NOT_FOUND);
    }

    static badRequest(errorCode: string, message: string) {
        return new ErrorsExceptions(errorCode, message, HttpStatus.BAD_REQUEST);
    }

    static unauthorized(errorCode: string, message: string) {
        return new ErrorsExceptions(errorCode, message, HttpStatus.UNAUTHORIZED);
    }

    static conflict(errorCode: string, message: string) {
        return new ErrorsExceptions(errorCode, message, HttpStatus.CONFLICT);
    }
}