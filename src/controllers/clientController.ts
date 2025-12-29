import { Request, Response } from "express";
import clientPromise from "../lib/db";
import { callYSDAPIWithUserData } from "../services/m2m.service";

/**
 * Get client by ID from main MongoDB database (clients collection)
 * Route: GET /api/clients/:id
 */
const getClientById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
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

/**
 * Update client data
 * Route: PUT /api/clients/:id
 */
const updateClient = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const response = await callYSDAPIWithUserData(`/clients/${id}`, {
      req,
      method: 'PUT',
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update client data',
      message: error.message,
    });
  }
}

export { getClientById, updateClient };
