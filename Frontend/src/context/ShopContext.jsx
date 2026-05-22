import { createContext, useState } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { mockProducts, mockSettings, useMockData } from "../lib/mockData";
import { getEffectiveProductPrice, normalizeProducts } from "../utils/productMapping";
export const ShopContext = createContext();

const defaultScentFamilies = [
  "Amber",
  "Floral",
  "Fresh",
  "Woods",
  "Oud",
  "Musk",
  "Citrus",
  "Gift Sets",
];

const ShopContextProvider = (props) => {
  const currency =
    "$"; /* here if i change the currency it will updaitet for  entire  page */
  const [delivery_fee, setDeliveryFee] = useState(3);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [favoriteItems, setFavoriteItems] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("levon_favorites") || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  });
  const backendUrl = String(import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
  const [products, setProducts] = useState([]); // instand of the assets products to store the new products from data base we just replace it
  const [productsLoading, setProductsLoading] = useState(true);
  const [scentFamilies, setScentFamilies] = useState(defaultScentFamilies);
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const [appliedCoupon, setAppliedCoupon] = useState(null); // currently applied coupon
 const [couponDiscount, setCouponDiscount] = useState(0); // discount amount

  // 🔥 FETCH DELIVERY FEE ONCE
  useEffect(() => {
    if (useMockData) {
      setDeliveryFee(mockSettings.delivery_fee);
      return;
    }

    fetch(`${backendUrl}/api/settings/delivery-fee`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.delivery_fee === "number") {
          setDeliveryFee(data.delivery_fee);
        }
      })
      .catch(() => {
        // fallback safety
        setDeliveryFee(3);
      });
  }, [backendUrl]);

  /*  why we use nagivate instad link ? 
     Using navigate inside a button
    This approach is useful when you need to perform some logic 
    before navigating (e.g., checking cart items, verifying user authentication, etc.). */

  //----------------------ADD TO CART FUNCTION ---------------------------------------------
  // extended to support optional (color, quantity) but fully backward compatible with your old signature (itemId, size)
  const addToCart = async (itemId, size, color = null, quantity = 1) => {
    // async yaani wa2t bfut a shi wbrj3 elh ma byaaml relod lal page
    if (!size) {
      toast.error("Select Prodct Size"); // this an alert error message
      return;
    }
    if (quantity <= 0) quantity = 1;

    let cartData = structuredClone(cartItems);
    // `structuredClone(cartItems)` → Creates a deep copy of the cartItems object.
    // This ensures that modifying `cartData` doesn't directly change `cartItems` before updating the state.

    if (!cartData[itemId]) {
      cartData[itemId] = {}; // If the item does not exist in the cart, create an empty object for it.
    }

    // color-aware path (keeps old behavior if no color is provided)
    if (color) {
      if (typeof cartData[itemId][size] === "number") {
        const prevQty = cartData[itemId][size] || 0;
        cartData[itemId][size] = { _default: prevQty };
      } else if (
        !cartData[itemId][size] ||
        typeof cartData[itemId][size] !== "object"
      ) {
        cartData[itemId][size] = {};
      }
      cartData[itemId][size][color] =
        (cartData[itemId][size][color] || 0) + quantity;
    } else {
      // size-only (old)
      if (cartData[itemId][size]) {
        if (typeof cartData[itemId][size] === "object") {
          cartData[itemId][size]._default =
            (cartData[itemId][size]._default || 0) + quantity;
        } else {
          cartData[itemId][size] += quantity; // If it exists, increase the quantity
        }
      } else {
        cartData[itemId][size] = quantity; // initialize quantity
      }
    }

    setCartItems(cartData);

    if (token) {
      // if tokem is available
      try {
        // include color and quantity if provided (older backend can ignore unknown fields safely)
        await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size, color, quantity },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  // ------------------------GET CART COUNT FUNCTION ----------------------------------------------
  const getCartCount = () => {
    let totalCount = 0; // Initialize a variable to store the total item count

    for (const items in cartItems) {
      // Loop through each item ID in the cart
      for (const item in cartItems[items]) {
        // Loop through each size of the item
        try {
          const val = cartItems[items][item];

          // handle both old style (number) and new style (object of colors)
          if (typeof val === "number") {
            if (val) totalCount += val;
          } else if (val && typeof val === "object") {
            for (const c in val) {
              if (val[c]) totalCount += val[c];
            }
          }
        } catch (error) {
          /* empty */
        } // Catch any errors, but do nothing
      }
    }

    return totalCount; // Return the total number of items in the cart
  };

  useEffect(() => {
    // iza bde aamol test shu bsir ta efham console.log(cartItems);
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("levon_favorites", JSON.stringify(favoriteItems));
  }, [favoriteItems]);

  const toggleFavorite = (itemId) => {
    if (!itemId) return;

    setFavoriteItems((prev) => {
      const exists = prev.includes(itemId);
      const next = exists
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];

      toast[exists ? "info" : "success"](
        exists ? "Removed from favorites" : "Added to favorites",
        {
          autoClose: 900,
          hideProgressBar: true,
          closeButton: false,
          position: "top-center",
        }
      );

      return next;
    });
  };

  const isFavorite = (itemId) => favoriteItems.includes(itemId);
  const getFavoriteCount = () => favoriteItems.length;

  // ----------------------UPDATE QUANTITY FUNCTION ------------------------------------------
  // extended to support optional color; old calls still work (itemId, size, quantity)
  // ❗ FIX: allow quantity = 0 to REMOVE the line (and clean up empty size/item)
  const updateQuantity = async (itemId, size, quantity, color = null) => {
    let cartData = structuredClone(cartItems); // Create a deep copy of cartItems to avoid modifying the original state directly

    // color-aware update/removal
    if (color) {
      if (
        cartData[itemId] &&
        cartData[itemId][size] &&
        typeof cartData[itemId][size] === "object"
      ) {
        if (quantity <= 0) {
          // remove just this color
          delete cartData[itemId][size][color];
        } else {
          cartData[itemId][size][color] = quantity;
        }
        // cleanup empty size object
        if (
          cartData[itemId][size] &&
          typeof cartData[itemId][size] === "object" &&
          Object.keys(cartData[itemId][size]).length === 0
        ) {
          delete cartData[itemId][size];
        }
      }
    } else {
      // size-only update/removal (no color)
      if (cartData[itemId]) {
        if (quantity <= 0) {
          // remove the whole size entry
          delete cartData[itemId][size];
        } else {
          if (typeof cartData[itemId][size] === "object") {
            cartData[itemId][size]._default = quantity;
          } else {
            cartData[itemId][size] = quantity; // Update the quantity of the specific product size
          }
        }
      }
    }

    // cleanup empty item object
    if (cartData[itemId] && Object.keys(cartData[itemId]).length === 0) {
      delete cartData[itemId];
    }

    setCartItems(cartData); // Update the state with the modified cart data

    if (token)
      // if token available
      try {
        // include color so server can distinguish variants if supported (your backend can ignore it)
        await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, size, quantity, color },
          { headers: { token } }
        ); // we passing the token to can addtocart
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
  };

  // --------------------GETTING THE CARTAMOUNT ----------------------------------------------------
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      const unitPrice = itemInfo ? getEffectiveProductPrice(itemInfo) : 0;
      for (const item in cartItems[items]) {
        const val = cartItems[items][item];
        if (typeof val === "number") {
          totalAmount += unitPrice * val;
        } else if (val && typeof val === "object") {
          for (const c in val) {
            const q = val[c];
            totalAmount += unitPrice * q;
          }
        }
      }
    }
    return totalAmount;
  };

  // ----------------GETTING THE PRODUCT DATA------------------------------------------
  const getProductsData = async () => {
    // to get the products from   data base
    setProductsLoading(true);
    if (useMockData) {
      setProducts(normalizeProducts(mockProducts));
      setProductsLoading(false);
      return;
    }

    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      //console.log(response.data)
      if (response.data.success) {
        setProducts(normalizeProducts(response.data.products));
      } else {
        toast.error(response.data.message);
        setProducts([]);
      }
    } catch (error) {
      console.log(error);
      setProducts([]);
      toast.error("Backend products could not load");
    } finally {
      setProductsLoading(false);
    }
  };

  const getScentFamilies = async ({ silent = false } = {}) => {
    try {
      const response = await axios.get(`${backendUrl}/api/scent-families/list`);
      if (response.data.success) {
        const nextFamilies = (response.data.families || [])
          .map((item) => (typeof item === "string" ? item : item?.name))
          .filter(Boolean);
        setScentFamilies(nextFamilies.length ? nextFamilies : defaultScentFamilies);
      } else if (!silent) {
        toast.error(response.data.message || "Failed to load scent families");
      }
    } catch (error) {
      console.log(error);
      setScentFamilies(defaultScentFamilies);
    }
  };

  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/cart/get",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        // if the data of the cart true and having the items
        setCartItems(response.data.cartData); // then store the items in cartitems
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // ------------------ NEW: GET TOTAL AFTER COUPON DISCOUNT ------------------
  const getTotalAfterDiscount = () => Math.max(0, getCartAmount() - couponDiscount);

  
   // ------------------ NEW: APPLY COUPON FUNCTION ------------------\

  const applyCoupon = async (code) => {
    if (!code || code.trim() === "") {
      toast.error("Enter a coupon code");
      return;
    }
    try {
      const res = await axios.post(
        backendUrl + "/api/coupon/check",
        { code },
        { headers: { token } }
      );

      if (res.data.success && res.data.coupon) {
        const coupon = res.data.coupon;
        setAppliedCoupon(coupon);

        // calculate discount
        let discount = 0;
        const total = getCartAmount();
        if (coupon.type === "percentage") discount = total * (coupon.value / 100);
        else if (coupon.type === "fixed") discount = coupon.value;
        discount = Math.min(discount, total);

        setCouponDiscount(discount);
        toast.success("Coupon applied!");
      } else {
        toast.error(res.data.message || "Invalid coupon");
        setAppliedCoupon(null);
        setCouponDiscount(0);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      setAppliedCoupon(null);
      setCouponDiscount(0);
    }
  };

  // ------------------ NEW: REMOVE COUPON FUNCTION ------------------
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  useEffect(() => {
    // to show the data whenever this function will e excuted
    getProductsData();
    getScentFamilies({ silent: true });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      getScentFamilies({ silent: true });
    }, 8000);

    const onFocus = () => getScentFamilies({ silent: true });
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [backendUrl]);

  // i can add this function even in the login page it will work the same
  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      // if there is not token and the local storage has the token so
      setToken(localStorage.getItem("token")); // get the token from the localstorage and add it ino our var like this even we refresh it will not open the loggin page
      getUserCart(localStorage.getItem("token")); // this function will be excuted whenever the token is available so if i have the token even if i reload the page my carts items will still with my quantity
    }
  }, []);

  const value = {
    products,
    productsLoading,
    scentFamilies,
    getScentFamilies,
    currency,
    delivery_fee, // i can accses this accross all the compnents mtl assests.jsx
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    favoriteItems,
    setFavoriteItems,
    toggleFavorite,
    isFavorite,
    getFavoriteCount,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    setToken,
    token,
    getTotalAfterDiscount, // ✅ new
    appliedCoupon, // ✅ new
    couponDiscount, // ✅ new
    applyCoupon, // ✅ new
    removeCoupon, // ✅ new
  };
  return (
    <ShopContext.Provider value={value}>
      {/* eslint-disable-next-line react/prop-types*/}
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;

/* what is the context 
... (your explanation kept)
*/
