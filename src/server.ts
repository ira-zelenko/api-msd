import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import dailyRoutes from "./routes/daily";
import weeklyRoutes from "./routes/weekly";
import monthlyRoutes from "./routes/monthly";

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
      console.log(`📍 Request from origin: ${origin}`); // Add this line

      if (!origin) {
        return callback(null, true);
      }

      const isAllowed = allowedOrigins.some((allowedOrigin) =>
        typeof allowedOrigin === "string"
          ? origin === allowedOrigin
          : allowedOrigin.test(origin)
      );

      if (isAllowed) {
        console.log(`✅ Allowed origin: ${origin}`); // Add this line
        callback(null, true);
      } else {
        console.error(`🚫 CORS blocked origin: ${origin}`);
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
app.use("/api/daily", dailyRoutes);
app.use("/api/weekly", weeklyRoutes);
app.use("/api/monthly", monthlyRoutes);

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
