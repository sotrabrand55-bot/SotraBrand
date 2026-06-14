import jwt from "jsonwebtoken";
import { logError } from "../utils/logger.js";

const USER_COOKIE_NAME = "nancy_token";
const LEGACY_USER_COOKIE_NAME = "levon_token";

const authUser = async (req, res, next) => {
  const token =
    req.headers.token ||
    req.cookies?.[USER_COOKIE_NAME] ||
    req.cookies?.[LEGACY_USER_COOKIE_NAME]; // getting the token from headers or httpOnly cookie

  if (!token) {
    // if the token not available
    return res.json({ success: false, message: "Not Authorized Login Again" });
  }

  try {
    // decoding mean extract the token to see id and expire date and the information
    const token_decode = jwt.verify(token, process.env.JWT_SECRET); // jwt.verify() checks if the token is valid (i.e., it hasn’t been tampered with and hasn’t expired).
    req.body.userId = token_decode.id; // getting the user Id from the token and add it into decode using that we can update the cart or place the order
    next();
  } catch (error) {
    logError("authUser", error);
    res.json({ success: false, message: error.message });
  }
};

export default authUser;
