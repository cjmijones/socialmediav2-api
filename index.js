import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "./middleware/logger.js";
import handleError from "./middleware/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import corsOptions from "./config/corsOptions.js";
import connectDB from "./config/dbConn.js";
import mongoose from "mongoose";
import { logEvents } from "./middleware/logger.js";
import authRoutes from "./routes/auths.js";
import userRoutes from "./routes/users.js";
import tweetRoutes from "./routes/tweets.js";
import rootRoutes from "./routes/root.js";

const app = express();
dotenv.config();
const port = process.env.PORT || 3500;

// For ES module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log environment mode
console.log(process.env.NODE_ENV);

// Connect to MongoDB
connectDB();

// Middleware setup
app.use(logger);
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());

// Static file serving
app.use("/", express.static(path.join(__dirname, "public")));

// Routes
app.use("/", rootRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tweets", tweetRoutes);

// 404 Handling
app.all("*", (req, res) => {
  res.status(404);
  console.log("failed 404 request");
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found v1" });
  } else {
    res.type("txt").send("404 Not Found v2");
  }
});

// Error handling middleware
app.use(handleError);

// MongoDB connection events
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(port, () => console.log(`Server running on port ${port}`));
});

mongoose.connection.on("error", (err) => {
  console.error(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
