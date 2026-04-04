import { Request, Response } from "express";
import { GoogleLoginService } from "../../application/services/GoogleLoginService";

export class GoogleLoginController {
  constructor(private readonly googleLoginService: GoogleLoginService) {}

  async login(req: Request, res: Response) {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "idToken não informado" });
    }

    const result = await this.googleLoginService.login(idToken);
    return res.json(result);
  }
}