import { Request, Response, NextFunction } from "express";

import ApiError from "../../../shared/utils/apiError";

const roleMiddleware = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new ApiError(403, "Access denied");
    }

    next();
  };
};

export default roleMiddleware;
