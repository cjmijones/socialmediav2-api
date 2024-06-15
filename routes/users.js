import express from "express";
import {
  getUser,
  update,
  deleteUser,
  follow,
  unFollow,
} from "../controllers/user.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Update User - Verify token disabled, add verifyToken to routes to reactivate
router.put("/:id", update);

// Get User
router.get("/find/:id", getUser);

// Delete User - Verify token disabled, add verifyToken to routes to reactivate
router.delete("/delete/:id", deleteUser);

// Follow - Verify token disabled, add verifyToken to routes to reactivate
router.put("/follow/:id", follow);

// Unfollow - Verify token disabled, add verifyToken to routes to reactivate
router.put("/unfollow/:id", unFollow);

export default router;
