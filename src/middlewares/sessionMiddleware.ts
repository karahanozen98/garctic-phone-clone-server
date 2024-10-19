import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import { AuthorizationException } from "../exceptions/authorizationException.js";

export const sessionMiddleware: any = (
  req: Request & { session: any },
  res: Response,
  next: NextFunction
) => {
  try {
    req.session = {};
    const token = req.cookies.token;

    if (
      req.originalUrl === "/" ||
      req.originalUrl === "/authentication/login"
    ) {
      return next();
    }

    if (!token) {
      throw new AuthorizationException("You are not authorized");
    }

    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as any;
      if (payload.id) {
        req.session.user = { ...payload };
      }
    } catch (error) {
      res.cookie("token", "", { maxAge: 0 });
      throw new AuthorizationException("You are not authorized");
    }

    return next();
  } catch (error) {
    next(error);
  }
};
