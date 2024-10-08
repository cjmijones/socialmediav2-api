// routes/articles.js
import express from "express";
import { body, param, query, validationResult } from "express-validator";
import Article from "../models/Article.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

/**
 * Middleware to handle validation results
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @route   GET /api/articles
 * @desc    Get all articles with optional pagination
 * @access  Public
 */
router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Limit must be a positive integer"),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const articles = await Article.find()
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.status(200).json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @route   GET /api/articles/:id
 * @desc    Get a single article by ID
 * @access  Public
 */
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid article ID")],
  handleValidation,
  async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);
      if (!article)
        return res.status(404).json({ message: "Article not found" });
      res.status(200).json(article);
    } catch (error) {
      console.error("Error fetching article:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @route   POST /api/articles/:id/like
 * @desc    Like or unlike an article
 * @access  Private
 */
router.post(
  "/:id/like",
  verifyToken,
  [param("id").isMongoId().withMessage("Invalid article ID")],
  handleValidation,
  async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);
      if (!article)
        return res.status(404).json({ message: "Article not found" });

      const userId = req.user.id;

      if (article.likes.includes(userId)) {
        // Unlike the article
        article.likes.pull(userId);
      } else {
        // Like the article
        article.likes.push(userId);
      }

      await article.save();
      res.status(200).json({ likes: article.likes });
    } catch (error) {
      console.error("Error liking/unliking article:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
);

// routes/articles.js
/**
 * @route   POST /api/articles/:id/comment
 * @desc    Add a comment to an article
 * @access  Private
 */
router.post(
  "/:id/comment",
  verifyToken,
  [
    param("id").isMongoId().withMessage("Invalid article ID"),
    body("comment")
      .trim()
      .isLength({ min: 1, max: 240 })
      .withMessage("Comment must be between 1 and 240 characters"),
  ],
  handleValidation,
  async (req, res) => {
    const user_check = await User.findById(req.user.id);
    console.log("What the findById method produces: " + user_check);
    try {
      const { comment } = req.body;

      const article = await Article.findById(req.params.id);
      if (!article)
        return res.status(404).json({ message: "Article not found" });

      const user = await User.findById(req.user.id);
      console.log();
      console.log("This is the user for making an article comment", user);
      if (!user) return res.status(404).json({ message: "User not found" });

      article.comments.push({
        user: req.user.id,
        username: user.username, // Include the username
        comment,
      });

      await article.save();
      res.status(201).json({ comments: article.comments });
    } catch (error) {
      console.error("Error adding comment:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @route   GET /api/articles/:id/comments
 * @desc    Get comments for an article
 * @access  Public
 */
router.get(
  "/:id/comments",
  [param("id").isMongoId().withMessage("Invalid article ID")],
  handleValidation,
  async (req, res) => {
    try {
      const article = await Article.findById(req.params.id).populate(
        "comments.user",
        "username"
      );
      if (!article)
        return res.status(404).json({ message: "Article not found" });

      res.status(200).json(article.comments);
    } catch (error) {
      console.error("Error fetching comments:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @route   PUT /api/articles/:articleId/comments/:commentId
 * @desc    Edit a comment
 * @access  Private
 */
router.put(
  "/:articleId/comments/:commentId",
  verifyToken,
  [
    param("articleId").isMongoId().withMessage("Invalid article ID"),
    param("commentId").isMongoId().withMessage("Invalid comment ID"),
    body("comment")
      .trim()
      .isLength({ min: 1, max: 240 })
      .withMessage("Comment must be between 1 and 240 characters"),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { articleId, commentId } = req.params;
      const { comment } = req.body;
      const userId = req.user.id;

      const article = await Article.findById(articleId);
      if (!article)
        return res.status(404).json({ message: "Article not found" });

      const commentObj = article.comments.id(commentId);
      if (!commentObj)
        return res.status(404).json({ message: "Comment not found" });

      // Check if the current user is the owner of the comment
      if (commentObj.user.toString() !== userId) {
        return res
          .status(403)
          .json({ message: "You are not authorized to edit this comment" });
      }

      // Update the comment and add a new edit timestamp
      commentObj.comment = comment;
      commentObj.editHistory.push({ editedAt: Date.now() });

      await article.save();
      res.status(200).json({ comments: article.comments });
    } catch (error) {
      console.error("Error editing comment:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @route   DELETE /api/articles/:articleId/comments/:commentId
 * @desc    Delete a comment
 * @access  Private
 */
router.delete(
  "/:articleId/comments/:commentId",
  verifyToken,
  [
    param("articleId").isMongoId().withMessage("Invalid article ID"),
    param("commentId").isMongoId().withMessage("Invalid comment ID"),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { articleId, commentId } = req.params;
      const userId = req.user.id;

      // Find the article containing the comment
      const article = await Article.findById(articleId);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Find the comment within the article
      const commentObj = article.comments.find(
        (comment) => comment._id.toString() === commentId
      );
      if (!commentObj) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Check if the current user is the owner of the comment
      if (commentObj.user.toString() !== userId) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this comment" });
      }

      // Remove the comment using the pull method
      article.comments.pull({ _id: commentId });

      // Save the article after removing the comment
      await article.save();

      res.status(200).json({ comments: article.comments });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
