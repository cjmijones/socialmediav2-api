import express from "express";
import { signup, signin } from "../controllers/auth.js";
import { signinLimiter, signupLimiter } from "../middleware/loginLimiter.js";

const router = express.Router();

router.get("/", (req, res, next) => {
  res.send("You are in the auth base page");
});

// Apply the signupLimiter to the signup route
router.post("/signup", signup);
router.get("/signup", (req, res, next) => {
  res.send("You are in the signup page");
});

// Apply the signinLimiter to the signin route
router.post("/signin", signin);
router.get("/signin", (req, res, next) => {
  res.send("You are in the signin page");
});

export default router;
