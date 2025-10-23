import { Request, Response } from "express";
import clientPromise from "../lib/db";
import { PeriodEntry } from "../types/metrics";

export const getWeekly = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await clientPromise;
    const db = client.db("msd");

    const { from, to } = req.query;
    const query: any = {};

    if (from && to) {
      const fromDate = new Date(from as string);
      const toDate = new Date(to as string);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        res.status(400).json({ error: "Invalid date format" });
        return;
      }

      // // move "to" to the end of week
      // const toInclusive = new Date(toDate);
      // toInclusive.setDate(toInclusive.getDate() + (7 - ((toInclusive.getDay() || 7))));

      const fromStr = fromDate.toISOString().slice(0, 19);
      const toStr = toDate.toISOString().slice(0, 19);

      query.referenceDate = {
        $gte: fromStr,
        $lte: toStr,
      };
    }

    const data = (await db.collection("weekly").find(query).toArray()) as unknown as PeriodEntry[];
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch weekly data" });
  }
};
