import { Router } from "express";
import { getDaily } from "../controllers/dailyController";

const router = Router();
router.get("/", getDaily);
export default router;
