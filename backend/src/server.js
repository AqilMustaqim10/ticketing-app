/**
 * Main Express Server Entry Point
 *
 * Configures global middleware (CORS, JSON parsing), mounts API routers,
 * and launches the HTTP server.
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
app.use(express.json());

// API Route Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);

// Root health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    status: "online",
    message: "IT Support Ticketing API is running successfully.",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err.stack);
  res.status(500).json({ error: "Something went wrong on the server!" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
