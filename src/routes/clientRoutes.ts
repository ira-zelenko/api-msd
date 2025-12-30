import express from "express";
import { jwtCheck, requireClientType } from "../middleware/auth";
import { getClientById, updateClient } from "../controllers/clientController";

const router = express.Router();

/**
 * Fetch client data by ID
 */
router.get('/:id', jwtCheck, requireClientType, getClientById);

/**
 * Update client data
 */
router.put('/:id', jwtCheck, requireClientType, updateClient);

export default router;
