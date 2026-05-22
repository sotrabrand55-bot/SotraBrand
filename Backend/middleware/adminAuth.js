import jwt from 'jsonwebtoken'; // Import the JWT library to verify and decode tokens
import { logError } from "../utils/logger.js";

// This middleware checks if the user is an admin before allowing access
const adminAuth = async (req, res, next) => {
    try {
      const token = req.headers.token || req.cookies?.levon_admin_token; // Extract the token from headers or httpOnly cookie
      // if not token 
      if(!token){//❌ If no token is provided in the header so we will return false
        return res.json({success:false,message:"Not Athorized Login Again"}) // we add return because wen its return it will stop here
      }
        
      const token_decode = jwt.verify(token,process.env.JWT_SECRET); // ✅ If token is provided, decode and verify it using your secret key yaene iza hada jarab yfut bi fake token men el JWT_secret
      const expectedAdminKey = process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD;
      const decodedAdminKey =
        typeof token_decode === "string" ? token_decode : token_decode?.adminKey;
      if(decodedAdminKey !== expectedAdminKey){ // if this decode token is not matching with this string its mean the user is not authorized in that case we will generate one res
        return res.json({success:false,message:"Not Athorized Login Again"})
      }
      next()//// ✅ continue to the protected route

    } catch (error) {
        logError("adminAuth", error);
        res.json({ success: false, message: error.message });
    }
}
export default adminAuth
