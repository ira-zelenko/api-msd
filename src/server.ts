import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";

const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.local";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

import { initAuth0Config } from "./config/auth0.config";
initAuth0Config();

import apiRoutes from "./routes/index";

const app = express();

// Security headers
app.use(helmet());

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

// Body parser with size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use((req, res, next) => {
  next();
});

// Routes
app.use('/api', apiRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "API is running",
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

export default app;

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
   app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
}
