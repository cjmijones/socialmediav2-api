import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import handleError from "../middleware/error.js";

export const signup = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const newUser = new User({ ...req.body, password: hash });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);

    const { password, ...otherData } = newUser._doc;
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(201)
      .json(otherData);
  } catch (err) {
    next(err);
  }
};

export const signin = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    console.log("Signing in ...", req.body.username);
    if (!user) return next(handleError(404, "User not found"));

    const valid = bcrypt.compareSync(req.body.password, user.password);

    if (!valid) return next(handleError(401, "Invalid credentials"));

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    console.log("Token: ", token);
    const { password, ...otherData } = user._doc;
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json(otherData);
  } catch (err) {
    next(err);
  }
};
