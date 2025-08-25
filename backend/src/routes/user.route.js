import { Router } from "express";
import { login, logout, register, SQLQueryExecutor } from "../controllers/user.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.route("/register").post(register)

router.route("/login").post(login)

router.route("/logout").post(
    verifyJWT,
    logout
)

router.route("/query").post(
    verifyJWT,
    SQLQueryExecutor
)

export default router;