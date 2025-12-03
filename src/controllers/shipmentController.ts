import { Request, Response } from "express";
import { testClientPromise } from "../lib/db";

/**
 * Search shipments with filters
 * Query params:
 * - search: string (searches in name, originsZip, destinationZip)
 * - brand: string (optional, comma-separated values for multiple)
 * - carrier: string (optional, comma-separated values for multiple)
 * - shipvia: string (optional, comma-separated values for multiple)
 * - state: string (optional, comma-separated values for multiple)
 * - daterange: string (optional, format "fromISO,toISO")
 * - page: number (optional, default: 1)
 * - pageSize: number (optional, default: 10)
 */
export const searchShipments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const client = await testClientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME_TEST);

    const {
      search,
      brand,
      carrier,
      shipvia,
      state,
      daterange,
      page = "1",
      pageSize = "10",
    } = req.query;

    // Build query
    const query: any = {};

    // Search across name, originsZip, destinationZip
    if (search && typeof search === "string" && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { originsZip: searchRegex },
        { destinationZip: searchRegex },
      ];
    }

    // Helper function for array filters
    const addArrayFilter = (param: any, fieldName: string) => {
      if (param && typeof param === "string") {
        const arr = param.split(",").map((s) => s.trim()).filter(Boolean);
        if (arr.length > 0) {
          query[fieldName] = { $in: arr };
        }
      }
    };

    addArrayFilter(brand, "brand");
    addArrayFilter(carrier, "carrier");
    addArrayFilter(shipvia, "shipvia");
    addArrayFilter(state, "state");

    // Date range filter - string comparison works for ISO format
    if (daterange && typeof daterange === "string") {
      const [from, to] = daterange.split(",");
      if (from && to) {
        const startDate = from.trim().substring(0, 10);
        const endDateObj = new Date(to.trim());

        endDateObj.setDate(endDateObj.getDate() + 1);

        const endDate = endDateObj.toISOString().substring(0, 10);

        query.createdAt = {
          $gte: startDate,
          $lt: endDate
        };
      }
    }

    // Pagination
    const pageNum = parseInt(page as string, 10) || 1;
    const pageSizeNum = parseInt(pageSize as string, 10) || 10;
    const skip = (pageNum - 1) * pageSizeNum;

    // Execute query
    const [data, totalCount] = await Promise.all([
      db
        .collection("shipment")
        .find(query)
        .skip(skip)
        .limit(pageSizeNum)
        .toArray(),
      db.collection("shipment").countDocuments(query),
    ]);

    res.json({
      data,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSizeNum),
      },
    });
  } catch (err) {
    console.error("Shipment search error:", err);
    res.status(500).json({
      error: "Failed to search shipments",
    });
  }
};
