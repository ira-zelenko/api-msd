import { Router } from "express";
import { getMetricsWeekly } from "../controllers/metricsWeeklyController";

const router = Router();
router.get("/", getMetricsWeekly);
export default router;
