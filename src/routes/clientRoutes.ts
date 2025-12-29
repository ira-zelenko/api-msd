import express from "express";
import { jwtCheck, requireClientType } from "../middleware/auth";
import { getClientById, updateClient } from "../controllers/clientController";

const router = express.Router();

/**
 * Fetch client data by ID
 */
router.get('/clients/:id', jwtCheck, requireClientType, getClientById);

/**
 * Update client data
 */
router.put('/clients/:id', jwtCheck, requireClientType, updateClient);

export default router;
