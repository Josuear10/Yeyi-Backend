import express from "express";
import {
  getAllSales,
  createSale,
  updateSale,
  deleteSale,
} from "../controllers/salesController.js";

const router = express.Router();

router.get("/", getAllSales);
router.post("/", createSale);
router.put("/:id", updateSale);
router.delete("/:id", deleteSale);

export default router;