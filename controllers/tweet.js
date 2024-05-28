import Tweet from "../models/Tweet.js";
import User from "../models/User.js";
import handleError from "../middleware/error.js";

// the id in the url is the id of the user NOT the tweet id
export const createTweet = async (req, res, next) => {
  const newTweet = new Tweet(req.body);
  console.log("Createing new tweet");
  try {
    console.log("Creating new tweet");
    console.log(req.body);
    const savedTweet = await newTweet.save();
    console.log("Tweet saved");
    res.status(200).json(savedTweet);
  } catch (err) {
    handleError(500, err);
  }
};

// the id in the url is the id of the user NOT the tweet id
export const deleteTweet = async (req, res, next) => {
  const tweet = await Tweet.findById(req.body.tweetId);
  console.log(tweet);
  console.log(req.body);

  if (tweet.userID === req.user.id) {
    try {
      await tweet.deleteOne();
      res.status(200).json("tweet deleted");
    } catch (error) {
      next(handleError(500, error));
    }
  } else {
    next(handleError(403, "You may only delete tweets under your account"));
  }
};

// the id in the url is the id of the user NOT the tweet id
export const likeOrDislike = async (req, res, next) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet.likes.includes(req.body.id)) {
      await tweet.updateOne({ $push: { likes: req.body.id } });
      res.status(200).json("tweet has been liked");
    } else {
      await tweet.updateOne({ $pull: { likes: req.body.id } });
      res.status(200).json("tweet has been disliked");
    }
  } catch (err) {
    handleError(500, err);
  }
};

export const getAllTweets = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.params.id);
    const userTweets = await Tweet.find({ userID: currentUser._id });
    const followersTweet = await Promise.all(
      currentUser.following.map((followersID) => {
        return Tweet.find({ userID: followersID });
      })
    );

    res.status(200).json(userTweets.concat(...followersTweet));
  } catch (err) {
    next(handleError(500, err));
  }
};

export const getUserTweets = async (req, res, next) => {
  try {
    const userTweets = await Tweet.find({ userID: req.params.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(userTweets);
  } catch (err) {
    next(handleError(500, err));
  }
};

export const getExploreTweets = async (req, res, next) => {
  try {
    const exploreTweets = await Tweet.find({
      likes: { $exists: true },
    }).sort({ likes: -1 });

    res.status(200).json(exploreTweets);
  } catch (err) {
    next(handleError(500, err));
  }
};
