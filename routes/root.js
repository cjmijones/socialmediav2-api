import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Get the current file URL and then the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get("^/$|/index(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

export default router;
