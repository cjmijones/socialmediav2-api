import jwt from "jsonwebtoken";
import handleError from "../middleware/error.js";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return next(handleError(401, "Access Denied - You are not authenticated"));

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    console.log(
      "The User Object being submitted for token verification:",
      verified
    );
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      next(handleError(401, "Token expired"));
    } else {
      next(handleError(400, "Invalid token"));
    }
  }
};
