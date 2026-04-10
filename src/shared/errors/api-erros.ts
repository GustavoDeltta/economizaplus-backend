export class ApiErrors extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

export class BadRequestError extends ApiErrors {
    constructor(message: string) {
        super(message, 400);
    }
}

export class NotFoundError extends ApiErrors {
    constructor(message: string) {
        super(message, 404);
    }
}

export class UnauthorizedError extends ApiErrors {
    constructor(message: string) {
        super(message, 401);
    }
}

export class ForbiddenError extends ApiErrors {
    constructor(message: string) {
        super(message, 403);
    }
}

export class InsufficientBalanceError extends ApiErrors {
    constructor(message: string = "Saldo insuficiente.") {
        super(message, 400);
    }
}

export class ResourceNotFoundError extends ApiErrors {
    constructor(message: string = "Recurso não encontrado.") {
        super(message, 404);
    }
}
