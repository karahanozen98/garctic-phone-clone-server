import { Request, Response, NextFunction } from "express";

export const exceptionMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(error.statusCode || 400).json({
    isSuccess: false,
    result: error.message,
    stack: error.stack,
  });
};
