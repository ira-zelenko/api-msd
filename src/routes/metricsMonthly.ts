import { Router } from "express";
import { getMetricsMonthly } from "../controllers/metricsMonthlyController";

const router = Router();
router.get("/", getMetricsMonthly);
export default router;
