import { Request, Response, NextFunction } from "express";

import { ZodType } from "zod";

const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);

      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        // message: error.errors[0].message,
        message: error.issues[0].message,
      });
    }
  };
};

export default validate;
