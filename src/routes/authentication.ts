import { NextFunction, Router } from "express";
import { User } from "../model/user.js";
import jwt from "jsonwebtoken";
import { AuthorizationException } from "../exceptions/authorizationException.js";

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const user = (await User.findOne({ email: req.body.username })) as any;

    if (!user) {
      throw new Error("User not found");
    }

    const isMatch = await user.comparePassword(req.body.password);

    if (!isMatch) {
      throw new Error("User not found");
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      secure: process.env.ENV === "Production",
      httpOnly: process.env.ENV === "Production",
      path: "/",
      sameSite: "lax",
    });
    res.json({ id: user.id, username: user.username, email: user.email });
  } catch (error) {
    next(error);
  }
});

router.get("/me", (req: any, res: any, next: NextFunction) => {
  try {
    if (!req.session.user) {
      throw new AuthorizationException("You are not authorized");
    }
    res.json(req.session.user);
  } catch (error) {
    next(error);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    res.cookie("token", "", {
      maxAge: 0,
    });
    res.json();
  } catch (error) {
    next(error);
  }
});

export default router;
