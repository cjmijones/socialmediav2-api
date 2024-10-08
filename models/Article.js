// models/Article.js
import { mongoose } from "mongoose";

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  username: String, // Add this field
  comment: {
    type: String,
    required: true,
    maxlength: 240, // Enforce comment length limit
  },
  createdAt: { type: Date, default: Date.now },
  editHistory: [
    {
      editedAt: { type: Date, default: Date.now },
    },
  ],
});

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  content: String,
  url: { type: String, required: true, unique: true },
  urlToImage: String,
  publishedAt: Date,
  source: {
    id: String,
    name: String,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [CommentSchema],
});

export default mongoose.model("Article", ArticleSchema);
