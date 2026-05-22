import userModel from "../models/userModel.js";
import { logError } from "../utils/logger.js";

// add product to user cart
const addToCart = async (req, res) => {
  try {
    const { userId, itemId, size } = req.body; // after using that user ID from user model we will find that user  and we will modify that card data and we will add the item ID and this sizes and their cartdata

    const userData = await userModel.findById(userId); // here the userId that we will get from the request.body
    let cartData = await userData.cartData; // extract the cartData and this cartData if we open userModel file we will see an emty object of cartData so we call that cartData from user model and add userData to this cartData

    if (cartData[itemId]) {
      // if the cartData having an ID
      if (cartData[itemId][size]) {
        // and if the size with id available
        cartData[itemId][size] += 1; // so incrase the quantity of the size 
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      // else if there is no itemID in this cart
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    await userModel.findByIdAndUpdate(userId, { cartData }); // we are sending the updated data into this object
    res.json({ success: true, message: "Added To Cart" });
  } catch (error) {
    logError("addToCart", error);
    res.json({ success: false, message: error.message });
  }
};

// update user cart
// update user cart
const updateCart = async (req, res) => {
  try {
    const { userId, itemId, size, quantity } = req.body; // we request those from body
    const userData = await userModel.findById(userId); // get user by ID
    let cartData = await userData.cartData; // extract the cartData
 
    cartData[itemId][size] = quantity;   // Update the quantity for the specific item and size

    await userModel.findByIdAndUpdate(userId, { cartData }); // update user's cart
    res.json({ success: true, message: "Cart Updated" });

  } catch (error) {
    logError("updateCart", error);
    res.json({ success: false, message: error.message });
  }
};

// get user Cartdata
const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body; // get user ID from request mean frontend 
    const userData = await userModel.findById(userId); // here the userId that we will get from the request.body
    let cartData = await userData.cartData; // extract the cartData

    res.json({ success: true, cartData });
  } catch (error) {
    logError("getUserCart", error);
    res.json({ success: false, message: error.message });
  }
};

export { addToCart, updateCart, getUserCart };
