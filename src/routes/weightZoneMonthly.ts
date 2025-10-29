import { Router } from "express";
import { getWeightZoneMonthly } from "../controllers/weightZoneMonthlyController";

const router = Router();
router.get("/", getWeightZoneMonthly);

export default router;
