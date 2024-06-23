import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  createTweet,
  deleteTweet,
  likeOrDislike,
  getAllTweets,
  getUserTweets,
  getExploreTweets,
} from "../controllers/tweet.js";

const router = express.Router();

// Create a Tweet - Verify token enabled
router.post("/", verifyToken, createTweet);

// Delete a Tweet - Verify token enabled
router.delete("/:id", verifyToken, deleteTweet);

// Like or Dislike a Tweet - Verify token enabled
router.put("/:id/like", verifyToken, likeOrDislike);

// get all timeline tweets
router.get("/timeline/:id", getAllTweets);

// get user Tweets only
router.get("/user/all/:id", getUserTweets);

//explore
router.get("/explore", getExploreTweets);
export default router;
