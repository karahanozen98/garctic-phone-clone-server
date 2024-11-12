import { Router } from "express";
import { authorize } from "../middlewares/authorize.js";
import * as roomController from "../controllers/roomController.js";

const router = Router();
router.post("/", roomController.create);
router.get("/:id", roomController.getById);
router.get("/:id/detailed", authorize(), roomController.getByIdDetailed);
router.delete("/all", authorize(), roomController.deleteAll);
router.get("/:id/getMyQuest", roomController.getMyQuest);
router.put("/:id/join", roomController.join);
router.put("/:id/start", roomController.start);
router.put("/:id/sentence", roomController.postSentence);
router.put("/:id/drawing", roomController.postDrawing);

export default router;
