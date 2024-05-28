import mongoose from "mongoose";

const TweetSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    likes: {
      type: Array,
      defaultValue: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Tweet", TweetSchema);
