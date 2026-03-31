import { NextFunction } from "express";
import { UnauthorizedError } from "../errors/api-erros";
import { Request, Response } from "express";

export function roleMiddleware(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    
    if(!req.role){
        throw new UnauthorizedError("Role not found!");
    }

    if (!allowedRoles.includes(req.role)) {
        throw new UnauthorizedError("Access denied!");
    }

    next();
  };

}
