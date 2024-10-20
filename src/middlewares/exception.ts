import { Request, Response, NextFunction } from "express";

export const exception = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error);
  res.status(error.statusCode || 400).json({
    isSuccess: false,
    result: error.message,
    stack: error.stack,
  });
};
