import { JwtPayload } from "./index.js";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: JwtPayload;
    }
  }
}

export {};
