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

// Delete User - Verify token enabled
router.put("/:id", verifyToken, update);

// Get User
router.get("/find/:id", getUser);

// Delete User - Verify token enabled
router.delete("/delete/:id", verifyToken, deleteUser);

// Delete User - Verify token enabled
router.put("/follow/:id", verifyToken, follow);

// Delete User - Verify token enabled
router.put("/unfollow/:id", verifyToken, unFollow);

export default router;
