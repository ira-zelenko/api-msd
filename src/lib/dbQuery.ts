import { Request, Response } from "express";
import clientPromise from "./db";

/**
 * Generic handler for time-series data queries
 */
export interface QueryConfig {
  collection: string;
  periodType: 'daily' | 'weekly' | 'monthly';
  sortFields?: Record<string, 1 | -1>;
  additionalFilters?: Record<string, any>;
  errorMessage?: string;
}

/**
 * Common query builder for date-based queries
 */
export const buildDateQuery = (
  from: string | undefined,
  to: string | undefined
): { $gte: string; $lte: string } | null => {
  if (!from || !to) {
    return null;
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return null;
  }

  toDate.setHours(23, 59, 59, 999);

  return {
    $gte: fromDate.toISOString().slice(0, 19),
    $lte: toDate.toISOString().slice(0, 19),
  };
};

const handleTimeSeriesQuery = async (
  req: Request,
  res: Response,
  config: QueryConfig
): Promise<void> => {
  try {
    const client = await clientPromise;
    const db = client.db("msd");

    const { from, to } = req.query;
    const query: any = { periodType: config.periodType };

    // Build date query
    const dateQuery = buildDateQuery(from as string, to as string);
    if (!dateQuery) {
      res.status(400).json({ error: "Invalid or missing date parameters" });

      return;
    }

    query.referenceDate = dateQuery;

    // Add additional filters (e.g., state for geo queries)
    if (config.additionalFilters) {
      Object.assign(query, config.additionalFilters);
    }

    // Query database
    const sortFields = config.sortFields || { referenceDate: 1 };
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
