import express from "express";
import {
  getAllEmployees,
  createEmployee,
  editEmployee,
  deleteEmployee,
} from "../controllers/employeesController.js";

const router = express.Router();

router.get("/", getAllEmployees);
router.post("/", createEmployee);
router.put("/:id", editEmployee);
router.delete("/:id", deleteEmployee);

export default router;