import { Request, Response } from "express";
import clientPromise from "../lib/db";

/**
 * Get client by ID from main MongoDB database (clients collection)
 * Route: GET /api/clients/:id
 */
const getClientById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Extract client ID from params
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: "Client ID is required"
      });
      return;
    }

    // Connect to MAIN database (not test)
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);

    // Find client by _id
    const clientData = await db
      .collection("clients")
      .findOne({ client_id: id });

    if (!clientData) {
      res.status(404).json({
        success: false,
        error: "Client not found"
      });
      return;
    }

    res.json({
      success: true,
      data: clientData
    });

  } catch (err: any) {
    console.error("Get client error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch client"
    });
  }
};

export { getClientById };
