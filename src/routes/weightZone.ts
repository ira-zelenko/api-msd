import { Router } from "express";
import { getWeightZone } from "../controllers/weightZoneController";

const router = Router();
router.get("/", getWeightZone);

export default router;
