import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import metricsDailyRoutes from "./routes/metricsDaily";
import metricsWeeklyRoutes from "./routes/metricsWeekly";
import metricsMonthlyRoutes from "./routes/metricsMonthly";
import weightZoneDailyRoutes from "./routes/weightZoneDaily";
import weightZoneMonthlyRoutes from "./routes/weightZoneMonthly";
import weightZoneWeeklyRoutes from "./routes/weightZoneWeekly";

const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.local";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const app = express();

const allowedOrigins: (string | RegExp)[] = [
  "http://localhost:3000",
  "http://localhost:3001",
  /^https:\/\/.*\.vercel\.app$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const isAllowed = allowedOrigins.some((allowedOrigin) =>
        typeof allowedOrigin === "string"
          ? origin === allowedOrigin
          : allowedOrigin.test(origin)
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// JSON body parsing
app.use(express.json());

// Routes
app.use("/api/metrics-daily", metricsDailyRoutes);
app.use("/api/metrics-weekly", metricsWeeklyRoutes);
app.use("/api/metrics-monthly", metricsMonthlyRoutes);
app.use("/api/weight-zone-daily", weightZoneDailyRoutes);
app.use("/api/weight-zone-weekly", weightZoneWeeklyRoutes);
app.use("/api/weight-zone-monthly", weightZoneMonthlyRoutes);


// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

// Export for Vercel (Serverless func)
export default app;

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
}
