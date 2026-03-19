declare global {
  namespace Express {
    export interface Request {
      user: string;
      role: string;
    }
  }
}

export {};