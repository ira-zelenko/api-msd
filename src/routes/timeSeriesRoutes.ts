import { Router } from "express";
import {
  getMetricsDaily,
  getMetricsWeekly,
  getMetricsMonthly,
  getWeightZoneDaily,
  getGeoStateDaily,
  getGeoCountyDaily,
} from "../controllers/timeSeriesController";
import { jwtCheck, requireClientType } from '../middleware/auth';

const router = Router();

// METRICS ROUTES, Query params: from, to
/**
 * GET /api/metrics/${periodType}
 */
router.get("/metrics/daily", jwtCheck, requireClientType, getMetricsDaily);
router.get("/metrics/weekly", jwtCheck, requireClientType, getMetricsWeekly);
router.get("/metrics/monthly", jwtCheck, requireClientType, getMetricsMonthly);

// WEIGHT ZONE ROUTES, Query params: from, to
/**
 * GET /api/weight-zone/daily
 */
router.get("/weight-zone/daily", jwtCheck, requireClientType, getWeightZoneDaily);

// GEO STATE ROUTES, Query params: from, to, state (optional)
/**
 * GET /api/geo/state/daily
 */
router.get("/geo/state/daily", jwtCheck, requireClientType, getGeoStateDaily);

// GEO COUNTY ROUTES, Query params: from, to, state (optional - REQUIRED for drilldown)
/**
 * GET /api/geo/county/daily
 */
router.get("/geo/county/daily", jwtCheck, requireClientType, getGeoCountyDaily);

export default router;
