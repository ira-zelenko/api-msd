import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import dailyRoutes from "./routes/daily";
import weeklyRoutes from "./routes/weekly";
import monthlyRoutes from "./routes/monthly";

const envFile =
  process.env.NODE_ENV === "production" ? ".env" : ".env.local";

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/daily", dailyRoutes);
app.use("/api/weekly", weeklyRoutes);
app.use("/api/monthly", monthlyRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
