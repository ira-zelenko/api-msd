import { Request, Response } from "express";
import { handleTimeSeriesQuery, buildAdditionalFilters } from "../lib/dbQuery";

/**
 * Controller factory for time-series data
 * Works for metrics, weight zones, and geo data
 */
const createTimeSeriesController = (
  collection: string,
  periodType: 'daily' | 'weekly' | 'monthly',
  dataType: string,
  options?: {
    sortFields?: Record<string, 1 | -1>;
    additionalFilterKeys?: string[];
    useTestDb?: boolean;
  }
) => {
  return async (req: Request, res: Response): Promise<void> => {
    const filterKeys = ['clientId', ...(options?.additionalFilterKeys || [])];

    const additionalFilters = buildAdditionalFilters(req, filterKeys);

    await handleTimeSeriesQuery(req, res, {
      collection,
      periodType,
      sortFields: options?.sortFields || { periodKey: 1 },
      additionalFilters,
      errorMessage: `Failed to fetch ${periodType} ${dataType} data`,
      useTestDb: options?.useTestDb || false,
    });
  };
};

// METRICS CONTROLLERS
const getMetricsDaily = createTimeSeriesController(
  "metrics_daily",
  "daily",
  "metrics"
);

const getMetricsWeekly = createTimeSeriesController(
  "metrics_weekly",
  "weekly",
  "metrics"
);

const getMetricsMonthly = createTimeSeriesController(
  "metrics_monthly",
  "monthly",
  "metrics"
);

// WEIGHT ZONE CONTROLLERS
const getWeightZoneDaily = createTimeSeriesController(
  "weight_zone_daily",
  "daily",
  "weight zone"
);

// GEO STATE CONTROLLERS
const getGeoStateDaily = createTimeSeriesController(
  "geo_state_daily",
  "daily",
  "geo state",
  {
    sortFields: { state: 1 },
    additionalFilterKeys: ["state"],
  }
);

// GEO COUNTY CONTROLLERS
const getGeoCountyDaily = createTimeSeriesController(
  "geo_county_daily",
  "daily",
  "geo county",
  {
    sortFields: { state: 1, county: 1 },
    additionalFilterKeys: ["state"],
  }
);

export {
  createTimeSeriesController,
  getMetricsDaily,
  getMetricsWeekly,
  getMetricsMonthly,
  getWeightZoneDaily,
  getGeoStateDaily,
  getGeoCountyDaily,
}
