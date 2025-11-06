import { Router } from "express";
import { getGeoStateWeekly } from "../controllers/geoStateWeeklyController";

const router = Router();
router.get("/", getGeoStateWeekly);
export default router;
