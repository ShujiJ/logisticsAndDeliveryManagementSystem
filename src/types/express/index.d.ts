import { JwtPayload } from "../../modules/auth/interfaces/jwtPayloadInterface";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
