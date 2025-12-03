import { Request, Response } from "express";
import clientPromise, { testClientPromise } from "./db";
import { format, startOfWeek, getISOWeek } from "date-fns";

/**
 * Generic handler for time-series data queries
 */
export interface QueryConfig {
  collection: string;
  periodType: 'daily' | 'weekly' | 'monthly';
  sortFields?: Record<string, 1 | -1>;
  additionalFilters?: Record<string, any>;
  errorMessage?: string;
  useTestDb?: boolean;
}

/**
 * Format date based on period type to match periodKey format
 */
const formatPeriodKey = (date: Date, periodType: string): string => {
  switch (periodType) {
    case 'monthly':
      return format(date, 'yyyy-MM');

    case 'weekly':
      const year = format(date, 'yyyy');
      const week = getISOWeek(date);

      return `${year}-W${String(week).padStart(2, '0')}`;

    case 'daily':
      return format(date, 'yyyy-MM-dd');

    default:
      return format(date, 'yyyy-MM-dd');
  }
};

/**
 * Common query builder for date-based queries
 * Returns dates formatted according to periodType to match periodKey field
 */
export const buildDateQuery = (
  from: string | undefined,
  to: string | undefined,
  periodType: 'daily' | 'weekly' | 'monthly'
): { $gte: string; $lte: string } | null => {
  if (!from || !to) {
    return null;
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return null;
  }

  // For weekly, adjust to start of week (Monday)
  if (periodType === 'weekly') {
    const adjustedFromDate = startOfWeek(fromDate, { weekStartsOn: 1 });
    const adjustedToDate = startOfWeek(toDate, { weekStartsOn: 1 });

    return {
      $gte: formatPeriodKey(adjustedFromDate, periodType),
      $lte: formatPeriodKey(adjustedToDate, periodType),
    };
  }

  // Format dates according to period type
  return {
    $gte: formatPeriodKey(fromDate, periodType),
    $lte: formatPeriodKey(toDate, periodType),
  };
};

const handleTimeSeriesQuery = async (
  req: Request,
  res: Response,
  config: QueryConfig
): Promise<void> => {
  try {
    // Select the appropriate database connection
    const client = config.useTestDb
      ? await testClientPromise
      : await clientPromise;

    // Select the appropriate database name
    const dbName = config.useTestDb
      ? process.env.MONGODB_DB_NAME_TEST
      : process.env.MONGODB_DB_NAME;

    const db = client.db(dbName);

    const { from, to } = req.query;
    const query: any = { periodType: config.periodType };

    // Build date query with periodType-aware formatting
    const dateQuery = buildDateQuery(
      from as string,
      to as string,
      config.periodType
    );

    if (!dateQuery) {
      res.status(400).json({ error: "Invalid or missing date parameters" });
      return;
    }

    query.periodKey = dateQuery;

    // Add additional filters (e.g., state for geo queries)
    if (config.additionalFilters) {
      Object.assign(query, config.additionalFilters);
    }

    // Query database
    const sortFields = config.sortFields || { periodKey: 1 };
    const data = await db
      .collection(config.collection)
      .find(query)
      .sort(sortFields)
      .toArray();

    if (!data.length) {
      res.status(404).json({
        error: config.errorMessage || "No data found for the given period",
        query: { from, to, ...config.additionalFilters },
      });
      return;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: config.errorMessage || "Failed to fetch data",
    });
  }
};

/**
 * Build additional filters from query params
 */
const buildAdditionalFilters = (
  req: Request,
  filterKeys: string[]
): Record<string, any> => {
  const filters: Record<string, any> = {};

  filterKeys.forEach((key) => {
    const value = req.query[key];
    if (value) {
      filters[key] = value;
    }
  });

  return filters;
};

export { buildAdditionalFilters, handleTimeSeriesQuery };
