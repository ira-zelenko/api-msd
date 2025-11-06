import { Router } from "express";
import { getGeoCountyWeeklyWeekly } from "../controllers/geoCountyWeeklyController";

const router = Router();
router.get("/", getGeoCountyWeeklyWeekly);
export default router;
