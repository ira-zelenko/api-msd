import { Request, Response } from "express";
import clientPromise from "../lib/db";
import { WeightZoneDocument, MetricKey } from "../types/weightZone";

export const getWeightZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await clientPromise;
    const db = client.db("msd");

    const { from, to, metrics } = req.query;

    const query: any = {};

    if (from && to) {
      const fromDate = new Date(from as string);
      const toDate = new Date(to as string);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        res.status(400).json({ error: "Invalid date format" });
        return;
      }

      toDate.setHours(23, 59, 59, 999);

      const fromStr = fromDate.toISOString().slice(0, 19);
      const toStr = toDate.toISOString().slice(0, 19);

      query.date = {
        $gte: fromStr,
        $lte: toStr,
      };
    }

    const data = (await db
      .collection("weight-zone")
      .find(query)
      .sort({ date: 1 })
      .toArray()) as unknown as WeightZoneDocument[];

    if (!data.length) {
      res.status(404).json({ error: "No data found for the given period" });
      return;
    }

    // If specific metrics passed - filter them.
    let keys: MetricKey[] | null = null;
    if (metrics) {
      keys = (metrics as string).split(",") as MetricKey[];
    }

    // Bring the format to the form { date, metrics }
    const formatted = data.map(d => ({
      date: d.date,
      metrics: keys
        ? Object.fromEntries(keys.map(k => [k, d.metrics[k]]))
        : d.metrics
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch weightZone data" });
  }
};
