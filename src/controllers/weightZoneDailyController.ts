import { Request, Response } from "express";
import clientPromise from "../lib/db";
import { WeightZoneRecord } from "../types/weightZone";

export const getWeightZoneDaily = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await clientPromise;
    const db = client.db("msd");

    const { from, to } = req.query;
    const query: any = { periodType: "daily" }; // this controller serves daily data only

    if (from && to) {
      const fromDate = new Date(from as string);
      const toDate = new Date(to as string);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        res.status(400).json({ error: "Invalid date format" });
        return;
      }

      // make 'to' inclusive up to the end of the day
      toDate.setHours(23, 59, 59, 999);

      // use ISO-like strings for consistency with other controllers in the project
      const fromStr = fromDate.toISOString().slice(0, 19);
      const toStr = toDate.toISOString().slice(0, 19);

      query.referenceDate = {
        $gte: fromStr,
        $lte: toStr,
      };
    }

    const data = (await db
      .collection("weight_zone_daily")
      .find(query)
      .sort({ referenceDate: 1 })
      .toArray()) as unknown as WeightZoneRecord[];

    if (!data || data.length === 0) {
      res.status(404).json({ error: "No data found for the given period" });
      return;
    }

    // return documents as-is (you can map/strip fields here if needed)
    res.json(data);
  } catch (err) {
    console.error("Error in getWeightZone:", err);
    res.status(500).json({ error: "Failed to fetch weight zone data" });
  }
};
