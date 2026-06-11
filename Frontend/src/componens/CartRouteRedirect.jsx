import { useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";

const CartRouteRedirect = () => {
  const { navigate, openCart } = useContext(ShopContext);

  useEffect(() => {
    openCart();
    navigate("/collection", { replace: true });
  }, [navigate, openCart]);

  return null;
};

export default CartRouteRedirect;
