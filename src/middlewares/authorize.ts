import { Response, NextFunction } from "express";
import { AuthorizationException } from "../exceptions/authorizationException.js";

export const authorize =
  () => (req: any, res: Response, next: NextFunction) => {
    try {
      if (req.session?.user?.role !== "admin") {
        throw new AuthorizationException();
      }
      next();
    } catch (error) {
      next(error);
    }
  };
