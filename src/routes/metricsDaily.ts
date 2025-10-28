import { Router } from "express";
import { getMetricsDaily } from "../controllers/metricsDailyController";

const router = Router();
router.get("/", getMetricsDaily);
export default router;
