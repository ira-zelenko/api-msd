import { Request, Response } from "express";
import clientPromise from "../lib/db";
import { GeoCountyRecord} from "../types/geo";

export const getGeoCountyWeeklyWeekly = async (req: Request, res: Response): Promise<void> => {
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

    // State filter (CRITICAL for drilldown)
    // When user clicks a state, we only fetch counties for that state
    if (state) {
      query.state = state;
      console.log(`[GEO COUNTY WEEKLY] Filtering by state: ${state}`);
    }

    const data = (await db
      .collection("geo_county_weekly")
      .find(query)
      .sort({ referenceDate: 1, state: 1, county: 1 })
      .toArray()) as unknown as GeoCountyRecord[];

    if (!data.length) {
      res.status(404).json({
        error: "No county data found for the given period",
        query: { from, to, state: state || "all" }
      });
      return;
    }

    console.log(`[GEO COUNTY WEEKLY] Found ${data.length} county records for ${state || "all states"}`);

    // Log sample for debugging
    if (data.length > 0) {
      console.log(`[GEO COUNTY WEEKLY] Sample record:`, {
        _id: data[0]._id,
        state: data[0].state,
        county: data[0].county,
        spent: data[0].spent,
      });
    }

    res.json(data);
  } catch (err) {
    console.error("Error in getGeoCountyWeekly:", err);
    res.status(500).json({ error: "Failed to fetch weekly geo county data" });
  }
  // try {
  //   const client = await clientPromise;
  //   const db = client.db("msd");
  //
  //   const { from, to } = req.query;
  //   const query: any = { periodType: "weekly" };
  //
  //   if (from && to) {
  //     const fromDate = new Date(from as string);
  //     const toDate = new Date(to as string);
  //
  //     if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
  //       res.status(400).json({ error: "Invalid date format" });
  //       return;
  //     }
  //
  //     toDate.setHours(23, 59, 59, 999);
  //
  //     query.referenceDate = {
  //       $gte: fromDate.toISOString().slice(0, 19),
  //       $lte: toDate.toISOString().slice(0, 19),
  //     };
  //   }
  //
  //   const data = (await db
  //     .collection("geo_county_weekly")
  //     .find(query)
  //     .sort({ referenceDate: 1 })
  //     .toArray()) as unknown as GeoCountyRecord[];
  //
  //   if (!data.length) {
  //     res.status(404).json({ error: "No weekly data found for the given period" });
  //     return;
  //   }
  //
  //   res.json(data);
  // } catch (err) {
  //   console.error("Error in getWeightZoneWeekly:", err);
  //   res.status(500).json({ error: "Failed to fetch weekly weight zone data" });
  // }
};
