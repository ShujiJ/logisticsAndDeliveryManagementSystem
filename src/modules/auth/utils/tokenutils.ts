import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { JwtPayload } from "../../auth/interfaces/jwtPayloadInterface";
import { env } from "../../../config/env";

//Secret and SignOptions are TypeScript types provided by jsonwebtoken documentation
export const generateAccessToken = (payload: JwtPayload) => {
  return jwt.sign(
    payload,

    env.ACCESS_TOKEN_SECRET as Secret,

    {
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
    } as SignOptions,
  );
};

export const generateRefreshToken = (payload: JwtPayload) => {
  return jwt.sign(
    payload,

    env.REFRESH_TOKEN_SECRET as Secret,

    {
      expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
    } as SignOptions,
  );
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as JwtPayload;
};
