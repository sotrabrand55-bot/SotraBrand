import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken"; // To create the token ID
import { logError } from "../utils/logger.js";

const cookieBaseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
};

const adminCookieMaxAge = 10 * 365 * 24 * 60 * 60 * 1000;

const setAuthCookie = (res, name, token, maxAge) => {
  res.cookie(name, token, {
    ...cookieBaseOptions,
    maxAge,
  });
};

const clearAuthCookie = (res, name) => {
  res.clearCookie(name, cookieBaseOptions);
};

// Function to create a JWT token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

//---------- Route for User Login------------
const LoginUser = async (req, res) => {
  // Request and response handling for user login
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }); // as same of register if i want undrstand there is explain below

    if (!user) {
      // if the user not available
      return res.json({ success: false, message: "User dosen't exists" });
    }
    // if the user exists then we will create a new const is match to see if the password matching by the bcrypt comparing
    const isMatch = await bcrypt.compare(password, user.password); // the (password) is the new pass from login and the (user.password) that is the already stored password i our data base
    // then if is match it will be true else it will be false

    if (isMatch) {
      const token = createToken(user._id); // iza hal login true baati new id
      setAuthCookie(res, "levon_token", token, 7 * 24 * 60 * 60 * 1000);
      res.json({ success: true, token });
    }
    // if the password not matching then
    else {
      res.json({ success: false, message: "Invalid Password" }); // messag if the password wrong
    }
  } catch (error) {
    logError("LoginUser", error);
    res.json({ success: false, message: error.message });
    // Catches and logs any error that occurs
  }
};

//------------ Route for User Registration---------------
const registerUser = async (req, res) => {
  try {
    // Step 1: Extract data from request body
    const { name, email, password } = req.body;

    // Checking if the user already exists
    const exists = await userModel.findOne({ email });

    if (exists) {
      return res.json({ success: false, message: "User Already Exists" });
    }
    /* userModel.findOne({ email }) is a MongoDB query using Mongoose.
           It searches the database to check if a user with the same email already exists.
           await ensures that the database query completes before moving forward. */

    // Validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // Check for password strength
    if (password.length < 8) {
      // Fixed 'lenght' typo to 'length'
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    /* If the email and password are valid, we create the account.
           Before storing the password, we hash it using bcrypt for security. */

    // Hashing user password yaani ma bbayen el original password bkun 3leh hashing wbs bl bycrypt byn3mel
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); // Store hashed password in the database

    // Creating a new user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    // Saving the user in the database
    const user = await newUser.save();

    // Creating a token to allow the user to log in
    const token = createToken(user._id);
    setAuthCookie(res, "levon_token", token, 7 * 24 * 60 * 60 * 1000);
    // The token will be used for authentication and will be auto-generated in MongoDB

    res.json({ success: true, token });
  } catch (error) {
    logError("registerUser", error);
    res.json({ success: false, message: error.message });
    // Catches and logs any error that occurs
  }
};

//-------------- Route for Admin Login---------------
const adminLogin = async (req, res) => {
  // Request and response handling for admin login
  try {
    const { email, password } = req.body; // hayde la ektob 3nd ljason w aamol test request in body

    if ( email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD  ) { // iza hal email and password li rah e3mol 3laya test in json body matching the sam of env email and pass that i put so in that case create on token like this

      const token = jwt.sign(
        { adminKey: email + password, role: "admin" },
        process.env.JWT_SECRET
      ); // admin token intentionally has no expiry
      setAuthCookie(res, "levon_admin_token", token, adminCookieMaxAge);
      res.json({ success: true, token });

    } else {
      // else if the pass not matching
      res.json({ success: false, message: "Invalid credentails" });
    }
    
  } catch (error) {
    logError("adminLogin", error);
    res.json({ success: false, message: error.message });
  }
};

const logoutUser = async (req, res) => {
  clearAuthCookie(res, "levon_token");
  res.json({ success: true, message: "Logged out" });
};

const adminLogout = async (req, res) => {
  clearAuthCookie(res, "levon_admin_token");
  res.json({ success: true, message: "Admin logged out" });
};

export { LoginUser, registerUser, adminLogin, logoutUser, adminLogout };

/* Breakdown Explanation:
   req.body contains the data sent in the request body (typically from a form or API request).
   { name, email, password } destructures req.body,
   so instead of accessing req.body.name, req.body.email, and req.body.password separately,
   we extract them into individual variables. */
