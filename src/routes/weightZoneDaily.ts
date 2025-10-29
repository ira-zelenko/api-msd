import { Router } from "express";
import { getWeightZoneDaily } from "../controllers/weightZoneDailyController";

const router = Router();
router.get("/", getWeightZoneDaily);

export default router;
