import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";

export const sessionMiddleware: any = (
  req: Request & { session: any },
  res: Response,
  next: NextFunction
) => {
  //TODO
  try {
    req.session = {};
    const token = req.cookies.token;

    if (token) {
      const payload = jwt.decode(token) as any;
      if (payload.id) {
        req.session.user = { ...payload };
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
