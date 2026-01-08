import { Request, Response } from "express";
import { handleTimeSeriesQuery, buildAdditionalFilters } from "../lib/dbQuery";

interface TimeSeriesOptions {
  collection: string;
  dataType: string;
  periodType?: 'daily' | 'weekly' | 'monthly';
  sortFields?: Record<string, 1 | -1>;
  additionalFilterKeys?: string[];
  useTestDb?: boolean;
}

/**
 * Controller factory for time-series data
 * Works for metrics, weight zones, and geo data
 */
const createTimeSeriesController = (options: TimeSeriesOptions) => {
  return async (req: Request, res: Response): Promise<void> => {
    const filterKeys = ['clientId', ...(options.additionalFilterKeys || [])];
    const additionalFilters = buildAdditionalFilters(req, filterKeys);

    const {
      collection,
      periodType,
      sortFields,
      dataType,
      useTestDb,
    } = options;

    await handleTimeSeriesQuery(req, res, {
      collection,
      periodType,
      sortFields: sortFields || { periodKey: 1 },
      additionalFilters,
      errorMessage: `Failed to fetch ${periodType || 'daily'} ${dataType} data`,
      useTestDb: useTestDb || false,
    });
  };
};

// METRICS CONTROLLERS
const getMetricsDaily = createTimeSeriesController({
  collection: "metrics_daily",
  periodType: "daily",
  dataType: "metrics"
});

const getMetricsWeekly = createTimeSeriesController({
  collection: "metrics_weekly",
  periodType: "weekly",
  dataType: "metrics"
});

const getMetricsMonthly = createTimeSeriesController({
  collection: "metrics_monthly",
  periodType: "monthly",
  dataType: "metrics"
});

// WEIGHT ZONE CONTROLLERS
const getWeightZoneDaily = createTimeSeriesController({
  collection: "weight_zone_daily",
  dataType: "weight zone",
});

// GEO STATE CONTROLLERS
const getGeoStateDaily = createTimeSeriesController({
  collection: "geo_state_daily",
  dataType: "geo state",
});

// GEO COUNTY CONTROLLERS
const getGeoCountyDaily = createTimeSeriesController({
  collection: "geo_county_daily",
  dataType: "geo county",
  additionalFilterKeys: ['state'],
});

export {
  createTimeSeriesController,
  getMetricsDaily,
  getMetricsWeekly,
  getMetricsMonthly,
  getWeightZoneDaily,
  getGeoStateDaily,
  getGeoCountyDaily,
}
