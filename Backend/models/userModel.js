import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
    } /* if we jave created the account using one email id and trying to create another account with that same
         email id then it will not create the another account in that case we will provide an error message that this email id is already use in another account */,
    password: { type: String, required: true },
    cartData: { type: Object, default: {} }, // whenever the new user will be created there cart will be one emty object
  },
  {
    minimize: false,
    /* 🔹 Default behavior (minimize: true)
👉 MongoDB removes cartData if it's an empty object {}.

🔹 With minimize: false
👉 MongoDB keeps cartData: {} even if it's empty. */
  }
);
// now create the model using this schema

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
