import { Router } from "express";
import {
  deletetask,
  getAlltasks,
  getSingletask,
  taskAdd,
  updatetask,
} from "../controllers/task.controller.js";

const router = Router();

router.route("").post(taskAdd);
router.route("").get(getAlltasks);
router.route("/:id").get(getSingletask);
router.route("/:id").delete(deletetask);
router.route("/:id").patch(updatetask);

export default router;
