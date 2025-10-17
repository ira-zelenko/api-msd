import { Router } from "express";
import { getMonthly } from "../controllers/monthlyController";

const router = Router();
router.get("/", getMonthly);
export default router;
