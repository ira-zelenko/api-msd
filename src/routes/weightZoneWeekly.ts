import { Router } from "express";
import { getWeightZoneWeekly } from "../controllers/weightZoneWeeklyController";

const router = Router();
router.get("/", getWeightZoneWeekly);

export default router;
