import { Router } from "express";
import { searchShipments } from "../controllers/shipmentController";
import { jwtCheck, requireClientType } from '../middleware/auth';

const router = Router();

/**
 * GET /api/shipment/search
 * Query params:
 * - search: string (searches in name, originsZip, destinationZip)
 * - brand: string (optional filter)
 * - carrier: string (optional filter)
 * - shipvia: string (optional filter)
 * - state: string (optional filter)
 * - page: number (optional, default: 1)
 * - limit: number (optional, default: 10)
 */
router.get("/search", jwtCheck, requireClientType, searchShipments);

export default router;
