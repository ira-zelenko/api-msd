import { Router } from "express";
import { getWeekly } from "../controllers/weeklyController";

const router = Router();
router.get("/", getWeekly);
export default router;
