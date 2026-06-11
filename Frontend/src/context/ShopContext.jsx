import { createContext, useCallback, useState } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { mockProducts, mockSettings, useMockData } from "../lib/mockData";
import { mapCategoryGroups, subcategoryGroups as fallbackCategoryGroups } from "../lib/subcategoryCatalog";
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
];

const DEFAULT_SIZE_KEY = "_no_size";
const DEFAULT_COLOR_KEY = "_default";
const DEFAULT_PERFUME_TYPE_KEY = "_no_perfume_type";

const normalizeVariantKey = (value, fallback) => {
  const text = String(value || "").trim();
  return text && text.toLowerCase() !== "default" ? text : fallback;
};

const walkCartQuantities = (value, visitor, meta = {}) => {
  if (typeof value === "number") {
    if (value > 0) visitor(value, meta);
    return;
  }
  if (!value || typeof value !== "object") return;

  Object.entries(value).forEach(([key, child]) => {
    if (typeof child === "number") {
      if (child > 0) visitor(child, { ...meta, key });
      return;
    }
    walkCartQuantities(child, visitor, { ...meta, key });
  });
};

const ShopContextProvider = (props) => {
  const currency =
    "$"; /* here if i change the currency it will updaitet for  entire  page */
  const [delivery_fee, setDeliveryFee] = useState(3);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [favoriteItems, setFavoriteItems] = useState(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("nancy_favorites") ||
          localStorage.getItem("levon_favorites") ||
          "[]"
      );
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  });
  const backendUrl = String(import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
  const [products, setProducts] = useState([]); // instand of the assets products to store the new products from data base we just replace it
  const [productsLoading, setProductsLoading] = useState(true);
  const [scentFamilies, setScentFamilies] = useState(defaultScentFamilies);
  const [siteSettings, setSiteSettings] = useState(mockSettings);
  const [categoryGroups, setCategoryGroups] = useState(fallbackCategoryGroups);
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const [appliedCoupon, setAppliedCoupon] = useState(null); // currently applied coupon
  const [couponDiscount, setCouponDiscount] = useState(0); // discount amount
  const openCart = useCallback(() => setCartDrawerOpen(true), []);
  const closeCart = useCallback(() => setCartDrawerOpen(false), []);

  // 🔥 FETCH DELIVERY FEE ONCE
  useEffect(() => {
    if (useMockData) {
      setSiteSettings(mockSettings);
      setDeliveryFee(mockSettings.delivery_fee);
      return;
    }

    const fetchSettings = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/settings/site`);
        const data = await res.json();
        if (data?.success && data.settings) {
          const nextSettings = { ...mockSettings, ...data.settings };
          setSiteSettings(nextSettings);
          if (typeof nextSettings.delivery_fee === "number") {
            setDeliveryFee(nextSettings.delivery_fee);
          }
        }
      } catch {
        setDeliveryFee(3);
      }
    };

    fetchSettings();
    const interval = window.setInterval(fetchSettings, 10000);
    window.addEventListener("focus", fetchSettings);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", fetchSettings);
    };
  }, [backendUrl]);

  /*  why we use nagivate instad link ? 
     Using navigate inside a button
    This approach is useful when you need to perform some logic 
    before navigating (e.g., checking cart items, verifying user authentication, etc.). */

  //----------------------ADD TO CART FUNCTION ---------------------------------------------
  // extended to support optional (color, quantity) but fully backward compatible with your old signature (itemId, size)
  const addToCart = async (itemId, size, color = null, quantity = 1, perfumeType = null) => {
    // async yaani wa2t bfut a shi wbrj3 elh ma byaaml relod lal page
    const sizeKey = normalizeVariantKey(size, DEFAULT_SIZE_KEY);
    const colorKey = normalizeVariantKey(color, DEFAULT_COLOR_KEY);
    const perfumeTypeKey = normalizeVariantKey(perfumeType, DEFAULT_PERFUME_TYPE_KEY);
    if (quantity <= 0) quantity = 1;

    let cartData = structuredClone(cartItems);
    // `structuredClone(cartItems)` → Creates a deep copy of the cartItems object.
    // This ensures that modifying `cartData` doesn't directly change `cartItems` before updating the state.

    if (!cartData[itemId]) {
      cartData[itemId] = {}; // If the item does not exist in the cart, create an empty object for it.
    }

    // color-aware path (keeps old behavior if no color is provided)
    if (color || perfumeType) {
      if (typeof cartData[itemId][sizeKey] === "number") {
        const prevQty = cartData[itemId][sizeKey] || 0;
        cartData[itemId][sizeKey] = {
          [DEFAULT_COLOR_KEY]: { [DEFAULT_PERFUME_TYPE_KEY]: prevQty },
        };
      } else if (
        !cartData[itemId][sizeKey] ||
        typeof cartData[itemId][sizeKey] !== "object"
      ) {
        cartData[itemId][sizeKey] = {};
      }
      if (typeof cartData[itemId][sizeKey][colorKey] === "number") {
        cartData[itemId][sizeKey][colorKey] = {
          [DEFAULT_PERFUME_TYPE_KEY]: cartData[itemId][sizeKey][colorKey],
        };
      }
      if (
        !cartData[itemId][sizeKey][colorKey] ||
        typeof cartData[itemId][sizeKey][colorKey] !== "object"
      ) {
        cartData[itemId][sizeKey][colorKey] = {};
      }
      cartData[itemId][sizeKey][colorKey][perfumeTypeKey] =
        (Number(cartData[itemId][sizeKey][colorKey][perfumeTypeKey]) || 0) + quantity;
    } else {
      // size-only (old)
      if (cartData[itemId][sizeKey]) {
        if (typeof cartData[itemId][sizeKey] === "object") {
          cartData[itemId][sizeKey]._default =
            (cartData[itemId][sizeKey]._default || 0) + quantity;
        } else {
          cartData[itemId][sizeKey] += quantity; // If it exists, increase the quantity
        }
      } else {
        cartData[itemId][sizeKey] = quantity; // initialize quantity
      }
    }

    setCartItems(cartData);

    if (token && !useMockData) {
      // if tokem is available
      try {
        // include color and quantity if provided (older backend can ignore unknown fields safely)
        await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size: sizeKey, color, perfumeType, quantity },
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
          walkCartQuantities(val, (quantity) => {
            totalCount += quantity;
          });
        } catch {
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
    localStorage.setItem("nancy_favorites", JSON.stringify(favoriteItems));
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
  const updateQuantity = async (itemId, size, quantity, color = null, perfumeType = null) => {
    const sizeKey = normalizeVariantKey(size, DEFAULT_SIZE_KEY);
    const colorKey = normalizeVariantKey(color, DEFAULT_COLOR_KEY);
    const perfumeTypeKey = normalizeVariantKey(perfumeType, DEFAULT_PERFUME_TYPE_KEY);
    let cartData = structuredClone(cartItems); // Create a deep copy of cartItems to avoid modifying the original state directly

    // color-aware update/removal
    if (color || perfumeType) {
      if (
        cartData[itemId] &&
        cartData[itemId][sizeKey] &&
        typeof cartData[itemId][sizeKey] === "object"
      ) {
        if (typeof cartData[itemId][sizeKey][colorKey] === "number") {
          cartData[itemId][sizeKey][colorKey] = {
            [DEFAULT_PERFUME_TYPE_KEY]: cartData[itemId][sizeKey][colorKey],
          };
        }
        if (
          !cartData[itemId][sizeKey][colorKey] ||
          typeof cartData[itemId][sizeKey][colorKey] !== "object"
        ) {
          cartData[itemId][sizeKey][colorKey] = {};
        }
        if (quantity <= 0) {
          // remove just this color
          delete cartData[itemId][sizeKey][colorKey][perfumeTypeKey];
        } else {
          cartData[itemId][sizeKey][colorKey][perfumeTypeKey] = quantity;
        }
        if (
          cartData[itemId][sizeKey][colorKey] &&
          typeof cartData[itemId][sizeKey][colorKey] === "object" &&
          Object.keys(cartData[itemId][sizeKey][colorKey]).length === 0
        ) {
          delete cartData[itemId][sizeKey][colorKey];
        }
        // cleanup empty size object
        if (
          cartData[itemId][sizeKey] &&
          typeof cartData[itemId][sizeKey] === "object" &&
          Object.keys(cartData[itemId][sizeKey]).length === 0
        ) {
          delete cartData[itemId][sizeKey];
        }
      }
    } else {
      // size-only update/removal (no color)
      if (cartData[itemId]) {
        if (quantity <= 0) {
          // remove the whole size entry
          delete cartData[itemId][sizeKey];
        } else {
          if (typeof cartData[itemId][sizeKey] === "object") {
            cartData[itemId][sizeKey]._default = quantity;
          } else {
            cartData[itemId][sizeKey] = quantity; // Update the quantity of the specific product size
          }
        }
      }
    }

    // cleanup empty item object
    if (cartData[itemId] && Object.keys(cartData[itemId]).length === 0) {
      delete cartData[itemId];
    }

    setCartItems(cartData); // Update the state with the modified cart data

    if (token && !useMockData)
      // if token available
      try {
        // include color so server can distinguish variants if supported (your backend can ignore it)
        await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, size: sizeKey, quantity, color, perfumeType },
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
        walkCartQuantities(val, (quantity) => {
          totalAmount += unitPrice * quantity;
        });
      }
    }
    return totalAmount;
  };

  // ----------------GETTING THE PRODUCT DATA------------------------------------------
  const getProductsData = async ({ silent = false } = {}) => {
    // to get the products from   data base
    if (!silent) setProductsLoading(true);
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
      if (!silent) {
        setProducts([]);
        toast.error("Backend products could not load");
      }
    } finally {
      if (!silent) setProductsLoading(false);
    }
  };

  const getScentFamilies = async ({ silent = false } = {}) => {
    if (useMockData) {
      setScentFamilies(defaultScentFamilies);
      return;
    }

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

  const getCategoryGroups = async ({ silent = false } = {}) => {
    if (useMockData) {
      setCategoryGroups(fallbackCategoryGroups);
      return;
    }

    try {
      const response = await axios.get(`${backendUrl}/api/categories/list`);
      if (response.data.success) {
        const nextGroups = mapCategoryGroups(response.data.groups);
        setCategoryGroups(nextGroups.length ? nextGroups : fallbackCategoryGroups);
      } else if (!silent) {
        toast.error(response.data.message || "Failed to load category menu");
      }
    } catch (error) {
      console.log(error);
      setCategoryGroups(fallbackCategoryGroups);
    }
  };

  const getUserCart = async (token) => {
    if (useMockData) return;

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
    if (useMockData) {
      toast.info("Coupons are paused while mock data is enabled");
      setAppliedCoupon(null);
      setCouponDiscount(0);
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
    getCategoryGroups({ silent: true });
  }, []);

  useEffect(() => {
    if (useMockData) return;

    const interval = setInterval(() => {
      getProductsData({ silent: true });
      getScentFamilies({ silent: true });
      getCategoryGroups({ silent: true });
    }, 8000);

    const onFocus = () => {
      getProductsData({ silent: true });
      getScentFamilies({ silent: true });
      getCategoryGroups({ silent: true });
    };
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [backendUrl]);

  // i can add this function even in the login page it will work the same
  useEffect(() => {
    if (useMockData) return;

    if (!token && localStorage.getItem("token")) {
      // if there is not token and the local storage has the token so
      setToken(localStorage.getItem("token")); // get the token from the localstorage and add it ino our var like this even we refresh it will not open the loggin page
      getUserCart(localStorage.getItem("token")); // this function will be excuted whenever the token is available so if i have the token even if i reload the page my carts items will still with my quantity
    }
  }, []);

  const value = {
    products,
    productsLoading,
    getProductsData,
    scentFamilies,
    categoryGroups,
    getCategoryGroups,
    siteSettings,
    getScentFamilies,
    currency,
    delivery_fee, // i can accses this accross all the compnents mtl assests.jsx
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    cartDrawerOpen,
    openCart,
    closeCart,
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
