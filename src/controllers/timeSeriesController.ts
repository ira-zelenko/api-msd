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
  }
) => {
  return async (req: Request, res: Response): Promise<void> => {
    const additionalFilters = options?.additionalFilterKeys
      ? buildAdditionalFilters(req, options.additionalFilterKeys)
      : {};

    await handleTimeSeriesQuery(req, res, {
      collection,
      periodType,
      sortFields: options?.sortFields || { referenceDate: 1 },
      additionalFilters,
      errorMessage: `Failed to fetch ${periodType} ${dataType} data`,
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

const getWeightZoneWeekly = createTimeSeriesController(
  "weight_zone_weekly",
  "weekly",
  "weight zone"
);

const getWeightZoneMonthly = createTimeSeriesController(
  "weight_zone_monthly",
  "monthly",
  "weight zone"
);

// GEO STATE CONTROLLERS
const getGeoStateDaily = createTimeSeriesController(
  "geo_state_daily",
  "daily",
  "geo state",
  {
    sortFields: { referenceDate: 1, state: 1 },
    additionalFilterKeys: ["state"],
  }
);

const getGeoStateWeekly = createTimeSeriesController(
  "geo_state_weekly",
  "weekly",
  "geo state",
  {
    sortFields: { referenceDate: 1, state: 1 },
    additionalFilterKeys: ["state"],
  }
);

const getGeoStateMonthly = createTimeSeriesController(
  "geo_state_monthly",
  "monthly",
  "geo state",
  {
    sortFields: { referenceDate: 1, state: 1 },
    additionalFilterKeys: ["state"],
  }
);


// GEO COUNTY CONTROLLERS
const getGeoCountyDaily = createTimeSeriesController(
  "geo_county_daily",
  "daily",
  "geo county",
  {
    sortFields: { referenceDate: 1, state: 1, county: 1 },
    additionalFilterKeys: ["state"],
  }
);

const getGeoCountyWeekly = createTimeSeriesController(
  "geo_county_weekly",
  "weekly",
  "geo county",
  {
    sortFields: { referenceDate: 1, state: 1, county: 1 },
    additionalFilterKeys: ["state"],
  }
);

const getGeoCountyMonthly = createTimeSeriesController(
  "geo_county_monthly",
  "monthly",
  "geo county",
  {
    sortFields: { referenceDate: 1, state: 1, county: 1 },
    additionalFilterKeys: ["state"],
  }
);

export {
  createTimeSeriesController,
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
}
