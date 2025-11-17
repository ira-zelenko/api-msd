import express from "express";
import timeSeriesRoutes from "./timeSeriesRoutes";
import shipmentRoutes from "./shipmentRoutes";

const router = express.Router();

// Time series routes (metrics, weight-zone, geo)
router.use("/", timeSeriesRoutes);

// Shipment routes
router.use("/shipment", shipmentRoutes);

export default router;
