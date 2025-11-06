import { Request, Response } from "express";
import clientPromise from "../lib/db";
import { GeoStateRecord } from "../types/geo";

/**
 * Get geo state data for weekly period
 */
export const getGeoStateWeekly = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await clientPromise;
    const db = client.db("msd");

    const { from, to, state } = req.query;
    const query: any = { periodType: "weekly" };

    // Date range filter
    if (from && to) {
      const fromDate = new Date(from as string);
      const toDate = new Date(to as string);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        res.status(400).json({ error: "Invalid date format" });
        return;
      }

      toDate.setHours(23, 59, 59, 999);

      query.referenceDate = {
        $gte: fromDate.toISOString().slice(0, 19),
        $lte: toDate.toISOString().slice(0, 19),
      };
    }

    // Optional state filter (for specific state queries)
    if (state) {
      query.state = state;
    }

    const data = (await db
      .collection("geo_state_weekly")
      .find(query)
      .sort({ referenceDate: 1, state: 1 })
      .toArray()) as unknown as GeoStateRecord[];

    if (!data.length) {
      res.status(404).json({
        error: "No state data found for the given period",
        query: { from, to, state: state || "all" }
      });
      return;
    }

    console.log(`[GEO STATE WEEKLY] Found ${data.length} records for ${state || "all states"}`);

    res.json(data);
  } catch (err) {
    console.error("Error in getGeoStateWeekly:", err);
    res.status(500).json({ error: "Failed to fetch weekly geo state data" });
  }
};



