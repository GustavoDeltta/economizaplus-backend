import { Request, Response } from "express";
import { LoginService } from "../../application/services/LoginService";


export class LoginController {
  constructor(private loginService: LoginService) {}
      async login(req: Request, res: Response) {
        const { email, password } = req.body;
    
        const token = await this.loginService.login(email, password);
    
        return res.json(token);
      }
}