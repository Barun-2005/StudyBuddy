import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "./config/config.js";
import passport from "./lib/passport.js";
import { connectDB } from "./lib/db.js";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import friendRequestsRoutes from "./routes/friendRequests.js";
import studyBuddyRoutes from "./routes/studyBuddy.js";
import reviewRoutes from "./routes/reviews.js"; 
import callRoutes from "./routes/call.route.js";
import friendRoutes from './routes/friend.routes.js';
import studySessionRoutes from './routes/studySession.route.js';
import studyGroupRoutes from "./routes/studyGroup.route.js";
import groupMessageRoutes from "./routes/groupMessage.route.js";

import { app, server } from "./lib/socket.js";

const PORT = process.env.PORT || 5001;

// File path helpers (for ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? [config.frontend.url, process.env.FRONTEND_URL].filter(Boolean)
    : ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/friendRequests", friendRequestsRoutes);
app.use("/api/studyBuddy", studyBuddyRoutes);
app.use("/api/reviews", reviewRoutes); 
app.use("/api/calls", callRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/study-sessions', studySessionRoutes);
app.use('/api/study-groups', studyGroupRoutes);
app.use('/api/group-messages', groupMessageRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../../Frontend/dist");
  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: "API route not found" });
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server and connect to the database
server.listen(PORT, () => {
  console.log("Server is running on PORT: " + PORT);
  connectDB();
});
