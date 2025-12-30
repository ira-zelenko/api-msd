import express from "express";
import timeSeriesRoutes from "./timeSeriesRoutes";
import shipmentRoutes from "./shipmentRoutes";
import { authRoutes } from "./authRoutes";
import clientRoutes from "./clientRoutes";

const router = express.Router();

// Time series routes (metrics, weight-zone, geo)
router.use("/", timeSeriesRoutes);

// Shipment routes
router.use("/shipment", shipmentRoutes);

// Auth routes (registration, health)
router.use("/auth", authRoutes);

// Client routes (GET/PUT client data)
router.use("/clients", clientRoutes);

export default router;
