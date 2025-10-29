import { Request, Response } from "express";
import clientPromise from "../lib/db";
import { WeightZoneRecord } from "../types/weightZone";

export const getWeightZoneWeekly = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await clientPromise;
    const db = client.db("msd");

    const { from, to } = req.query;
    const query: any = { periodType: "weekly" };

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

    const data = (await db
      .collection("weight_zone_weekly")
      .find(query)
      .sort({ referenceDate: 1 })
      .toArray()) as unknown as WeightZoneRecord[];

    if (!data.length) {
      res.status(404).json({ error: "No weekly data found for the given period" });
      return;
    }

    res.json(data);
  } catch (err) {
    console.error("Error in getWeightZoneWeekly:", err);
    res.status(500).json({ error: "Failed to fetch weekly weight zone data" });
  }
};
