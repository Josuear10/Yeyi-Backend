import express from "express";
import {
  getUsers,
  createUser,
  login,
} from "../controllers/usersController.js";

const router = express.Router();

router.get("/", getUsers);
router.post("/", createUser);
router.post("/login", login);

export default router;
