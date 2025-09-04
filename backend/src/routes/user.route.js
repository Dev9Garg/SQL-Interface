import {Router} from "express";
import {SQLQueryExecutor} from "../controllers/user.controllers.js";

const router = Router();

router.route("/query").post(SQLQueryExecutor)

// router.route("/changeDb").post(changeDb)

export default router;
