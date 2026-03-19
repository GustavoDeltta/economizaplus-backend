import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../helpers/api-erros";
import jwt from "jsonwebtoken";
import { userRepository } from "../infrastructure/prisma/repositories/userRepository";

type JwtPayload = {
    id: string;
    role: string;
    jti: string;
    iat: number;
    exp: number;
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    
    if (!authorization) {
        throw new UnauthorizedError("Token is missing!");
    }
    
    const token = authorization.split(" ")[1];
    
    const decoded = jwt.verify(token, process.env.JWT_PASS ?? "");

    if (typeof decoded === "string") {
    throw new UnauthorizedError("Invalid token payload");
    }

    const payload = decoded as JwtPayload;
    
    const UserRepository = new userRepository();
    const user = await UserRepository.findById(payload.id);

    if (!user) {
        throw new UnauthorizedError("Invalid token!");
    }
    req.user = payload.id;
    req.role = user.role;
    
    next();
}