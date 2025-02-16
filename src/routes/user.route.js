import { Router } from "express";
import {
  getAllUsers,
  loginUser,
  logoutUser,
  registerUser,
  singleUser,
  userUpdate,
  getToken,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);

router.route("").get(getAllUsers);
router.route("/:id").get(singleUser);
router.route("/:id").patch(userUpdate);

router.route("/:id/verify/:token").get(getToken);

export default router;
