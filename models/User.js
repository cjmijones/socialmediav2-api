import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, required: false },
    followers: [{ type: Array, defaultValue: [] }],
    following: [{ type: Array, defaultValue: [] }],
    description: { type: String, required: false },
    profilePicture: { type: String, required: false },
  },
  { timestamps: true }
);

UserSchema.pre("remove", async function (next) {
  try {
    // Import Tweet model here
    const Tweet = require("./Tweet").default; // Assuming your Tweet model file is named 'Tweet.js'
    await Tweet.deleteMany({ userID: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("User", UserSchema);
