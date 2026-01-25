import { JwtPayload } from "./index.ts";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: JwtPayload;
    }
  }
}

export {};
