import express from "express";
import {
  getAllDetails,
  createDetail,
  updateDetail,
  deleteDetail,
} from "../controllers/detailsController.js";

const router = express.Router();

router.get("/", getAllDetails);
router.post("/", createDetail);
router.put("/:id", updateDetail);
router.delete("/:id", deleteDetail);

export default router;