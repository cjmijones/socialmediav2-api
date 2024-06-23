import jwt from "jsonwebtoken";
import handleError from "./error.js";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  if (!token) return next(handleError(401, "You are not authenticated!"));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(handleError(403, "Token is invalid!"));
    req.user = user;
    next();
  });
};

export default verifyToken;
