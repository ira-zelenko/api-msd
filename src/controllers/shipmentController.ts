import { Request, Response } from 'express';
import pool from '../lib/pg';

/**
 * Search shipments with filters (PostgreSQL version)
 * Query params:
 * - search: string (searches in tracking_id, dest_zip)
 * - carrier: string (optional, comma-separated values for multiple)
 * - shipvia: string (optional, comma-separated values for multiple)
 * - state: string (optional, comma-separated values for multiple)
 * - daterange: string (optional, format "fromISO,toISO")
 * - clientId: string (required, client identifier)
 * - page: number (optional, default: 1)
 * - pageSize: number (optional, default: 10)
 */
export const searchShipments = async (
  req: Request,
  res: Response
): Promise<void> => {
  const client = await pool.connect();

  try {
    const {
      search,
      carrier,
      shipvia,
      state,
      daterange,
      clientId,
      page = "1",
      pageSize = "10",
    } = req.query;

    // Validate required clientId
    if (!clientId || typeof clientId !== "string") {
      res.status(400).json({
        error: "clientId is required",
      });
      return;
    }

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Always filter by client_id
    conditions.push(`client_id = $${paramIndex}`);
    params.push(clientId);
    paramIndex++;

    // Search across tracking_id, dest_zip
    if (search && typeof search === "string" && search.trim()) {
      conditions.push(
        `(tracking_id ILIKE $${paramIndex} OR dest_zip ILIKE $${paramIndex})`
      );
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Helper function for array filters
    const addArrayFilter = (param: any, fieldName: string) => {
      if (param && typeof param === "string") {
        const arr = param.split(",").map((s) => s.trim()).filter(Boolean);
        if (arr.length > 0) {
          conditions.push(`${fieldName} = ANY($${paramIndex})`);
          params.push(arr);
          paramIndex++;
        }
      }
    };

    addArrayFilter(carrier, "carrier");
    addArrayFilter(shipvia, "shipvia");
    addArrayFilter(state, "state");

    // Date range filter
    if (daterange && typeof daterange === "string") {
      const [from, to] = daterange.split(",");
      if (from && to) {
        const startDate = from.trim().substring(0, 10);
        const endDateObj = new Date(to.trim());
        endDateObj.setDate(endDateObj.getDate() + 1);
        const endDate = endDateObj.toISOString().substring(0, 10);

        conditions.push(
          `shipment_date >= $${paramIndex} AND shipment_date < $${paramIndex + 1}`
        );
        params.push(startDate, endDate);
        paramIndex += 2;
      }
    }

    // Build WHERE clause
    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    // Pagination
    const pageNum = parseInt(page as string, 10) || 1;
    const pageSizeNum = parseInt(pageSize as string, 10) || 10;
    const offset = (pageNum - 1) * pageSizeNum;

    // Execute queries in parallel
    const [dataResult, countResult] = await Promise.all([
      client.query(
        `SELECT * FROM ysd.shipments ${whereClause} ORDER BY shipment_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, pageSizeNum, offset]
      ),
      client.query(
        `SELECT COUNT(*) FROM ysd.shipments ${whereClause}`,
        params
      ),
    ]);

    const totalCount = parseInt(countResult.rows[0].count, 10);

    res.json({
      data: dataResult.rows,
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
  } finally {
    client.release();
  }
};
