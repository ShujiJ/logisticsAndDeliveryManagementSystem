import { Response } from "express";

const responseHandler = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export default responseHandler;
