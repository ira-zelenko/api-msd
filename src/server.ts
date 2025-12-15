// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import path from "path";
// import apiRoutes from "./routes/index";
//
// const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.local";
// dotenv.config({ path: path.resolve(process.cwd(), envFile) });
//
// const app = express();
//
// const allowedOrigins: (string | RegExp)[] = [
//   "http://localhost:3000",
//   "http://localhost:3001",
//   /^https:\/\/.*\.vercel\.app$/,
// ];
//
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) {
//         return callback(null, true);
//       }
//
//       const isAllowed = allowedOrigins.some((allowedOrigin) =>
//         typeof allowedOrigin === "string"
//           ? origin === allowedOrigin
//           : allowedOrigin.test(origin)
//       );
//
//       if (isAllowed) {
//         callback(null, true);
//       } else {
//         callback(new Error(`Not allowed by CORS: ${origin}`));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
//     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//   })
// );
//
// // JSON body parsing
// app.use(express.json());
//
// app.use("/api", apiRoutes);
//
// // Health check endpoint
// app.get("/", (req, res) => {
//   res.json({ status: "ok", message: "API is running" });
// });
//
// // Export for Vercel (Serverless func)
// export default app;
//
// // For local development
// if (process.env.NODE_ENV !== "production") {
//   const PORT = process.env.PORT || 4000;
//   app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
// }


// backend/src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import apiRoutes from "./routes/index";
import { authRoutes } from "./routes/auth.routes";

const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.local";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const app = express();

const allowedOrigins: (string | RegExp)[] = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173", // Add if using Vite for promo site
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

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Auth routes (registration)
app.use("/api", authRoutes);

// Your existing API routes
app.use("/api", apiRoutes);

// Health check endpoint
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
  console.error("❌ Unhandled error:", err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// Export for Vercel (Serverless func)
export default app;

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log('=================================');
    console.log(`✅ API running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 Auth0 Domain: ${process.env.AUTH0_DOMAIN}`);
    console.log('=================================');
  });
}
