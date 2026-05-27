import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../../../config/env";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // console.log("AUTH MIDDLEWARE RUNNING");

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("AUTH MIDDLEWARE RUNNING");
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
    //To check what is the role temporarily
    console.log(decoded);
    // req.user = decoded as any;
    (req as any).user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
