import { Request, Response, NextFunction } from "express";

export const exceptionMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(500).json({
    isSuccess: false,
    result: error.message,
    stack: error.stack,
  });
};
