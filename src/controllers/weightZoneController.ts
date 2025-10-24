import { Request, Response } from "express";
import clientPromise from "../lib/db";
import { WeightZoneData, MetricKey } from "../types/weightZone";

export const getWeightZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await clientPromise;
    const db = client.db("msd");

    const { from, to, metric } = req.query;

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
      .collection("weight_zone")
      .find(query)
      .sort({ date: 1 })
      .toArray()) as unknown as WeightZoneData[];

    if (!data.length) {
      res.status(404).json({ error: "No data found for the given period" });
      return;
    }

    let keys: MetricKey[] | null = null;
    if (metric) {
      keys = (metric as string).split(",") as MetricKey[];
    }

    const formatted = data.map((entry) => {
      const { date, metrics: allMetrics } = entry;

      const filteredMetrics = keys
        ? Object.fromEntries(
          keys
            .filter((k) => allMetrics[k])
            .map((k) => [k, allMetrics[k]])
        )
        : allMetrics;

      return {
        date,
        metrics: filteredMetrics,
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch weightZone data" });
  }
};
