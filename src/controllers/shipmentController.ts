import { Request, Response } from "express";
import clientPromise from "../lib/db";

/**
 * Search shipments with filters
 * Query params:
 * - search: string (searches in name, originsZip, destinationZip)
 * - brand: string (optional)
 * - carrier: string (optional)
 * - shipvia: string (optional)
 * - state: string (optional)
 * - page: number (optional, default: 1)
 * - pageSize: number (optional, default: 10)
 */
export const searchShipments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const client = await clientPromise;
    const db = client.db("msd");

    const {
      search,
      brand,
      carrier,
      shipvia,
      state,
      page = "1",
      pageSize = "10",
    } = req.query;

    // Build query
    const query: any = {};

    // Search across name, originsZip, destinationZip (only if search is provided and not empty)
    if (search && typeof search === "string" && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { originsZip: searchRegex },
        { destinationZip: searchRegex },
      ];
    }

    // Add filter fields
    if (brand && typeof brand === "string") {
      query.brand = brand;
    }
    if (carrier && typeof carrier === "string") {
      query.carrier = carrier;
    }
    if (shipvia && typeof shipvia === "string") {
      query.shipvia = shipvia;
    }
    if (state && typeof state === "string") {
      query.state = state;
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const pageSizeNum = parseInt(pageSize as string, 10);
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
