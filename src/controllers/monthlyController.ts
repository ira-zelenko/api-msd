import { Request, Response } from "express";
import { startOfMonth, endOfMonth } from "date-fns";
import clientPromise from "../lib/db";
import { PeriodEntry } from "../types/metrics";

export const getMonthly = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await clientPromise;
    const db = client.db("msd");

    const { from, to } = req.query;

    if (from && to) {
      const fromDate = new Date(from as string);
      const toDate = new Date(to as string);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        res.status(400).json({ error: "Invalid date format" });
        return;
      }

      const start = startOfMonth(fromDate);
      const end = endOfMonth(toDate);

      const data = (await db
        .collection("monthly")
        .find({
          referenceDate: {
            $gte: start.toISOString(),
            $lte: end.toISOString(),
          },
        })
        .toArray()) as unknown as PeriodEntry[];

      res.json(data);
      return;
    }

    const data = (await db
      .collection("monthly")
      .find({})
      .toArray()) as unknown as PeriodEntry[];

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch monthly data" });
  }
};
