var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from "express";
import { User } from "../model/user.js";
import jwt from "jsonwebtoken";
import { AuthorizationException } from "../exceptions/authorizationException.js";
const router = Router();
router.post("/login", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = (yield User.findOne({ email: req.body.username }));
        if (!user) {
            throw new Error("User not found");
        }
        const isMatch = yield user.comparePassword(req.body.password);
        if (!isMatch) {
            throw new Error("User not found");
        }
        const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        res.cookie("token", token, {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            secure: process.env.ENV === "Production",
            httpOnly: process.env.ENV === "Production",
            path: "/",
            sameSite: "lax",
        });
        res.json({ id: user.id, username: user.username, email: user.email });
    }
    catch (error) {
        next(error);
    }
}));
router.get("/me", (req, res, next) => {
    try {
        if (!req.session.user) {
            throw new AuthorizationException("You are not authorized");
        }
        res.json(req.session.user);
    }
    catch (error) {
        next(error);
    }
});
router.post("/logout", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.cookie("token", "", {
            maxAge: 0,
        });
        res.json();
    }
    catch (error) {
        next(error);
    }
}));
export default router;
