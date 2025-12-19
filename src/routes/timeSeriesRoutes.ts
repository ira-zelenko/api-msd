import { Router } from "express";
import {
  getMetricsDaily,
  getMetricsWeekly,
  getMetricsMonthly,
  getWeightZoneDaily,
  getGeoStateDaily,
  getGeoCountyDaily,
} from "../controllers/timeSeriesController";

const router = Router();

// METRICS ROUTES, Query params: from, to
/**
 * GET /api/metrics/${periodType}
 */
router.get("/metrics/daily", getMetricsDaily);
router.get("/metrics/weekly", getMetricsWeekly);
router.get("/metrics/monthly", getMetricsMonthly);

// WEIGHT ZONE ROUTES, Query params: from, to
/**
 * GET /api/weight-zone/daily
 */
router.get("/weight-zone/daily", getWeightZoneDaily);

// GEO STATE ROUTES, Query params: from, to, state (optional)
/**
 * GET /api/geo/state/daily
 */
router.get("/geo/state/daily", getGeoStateDaily);

// GEO COUNTY ROUTES, Query params: from, to, state (optional - REQUIRED for drilldown)
/**
 * GET /api/geo/county/daily
 */
router.get("/geo/county/daily", getGeoCountyDaily);

export default router;
