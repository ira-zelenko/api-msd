import { Router } from "express";
import {
  getMetricsDaily,
  getMetricsWeekly,
  getMetricsMonthly,
  getWeightZoneDaily,
  getWeightZoneWeekly,
  getWeightZoneMonthly,
  getGeoStateDaily,
  getGeoStateWeekly,
  getGeoStateMonthly,
  getGeoCountyDaily,
  getGeoCountyWeekly,
  getGeoCountyMonthly,
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
 * GET /api/weight-zone/${periodType}
 */
router.get("/weight-zone/daily", getWeightZoneDaily);
router.get("/weight-zone/weekly", getWeightZoneWeekly);
router.get("/weight-zone/monthly", getWeightZoneMonthly);

// GEO STATE ROUTES, Query params: from, to, state (optional)
/**
 * GET /api/geo/state/${periodType}
 */
router.get("/geo/state/daily", getGeoStateDaily);
router.get("/geo/state/weekly", getGeoStateWeekly);
router.get("/geo/state/monthly", getGeoStateMonthly);

// GEO COUNTY ROUTES, Query params: from, to, state (optional - REQUIRED for drilldown)
/**
 * GET /api/geo/county/${periodType}
 */
router.get("/geo/county/daily", getGeoCountyDaily);
router.get("/geo/county/weekly", getGeoCountyWeekly);
router.get("/geo/county/monthly", getGeoCountyMonthly);

export default router;
