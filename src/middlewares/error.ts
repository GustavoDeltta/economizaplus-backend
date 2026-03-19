import { Request, Response, NextFunction } from "express";
import { ApiErrors } from "../helpers/api-erros";

export const errorMiddleware = (
    error: Error & Partial<ApiErrors>,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = error.statusCode ?? 500;
    const message = error.statusCode ? error.message : "Erro interno do servidor.";

    res.status(statusCode).json({ error: message });
};