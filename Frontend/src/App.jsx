import 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import About from './pages/About'
import Product from './pages/Product'
import Login from './pages/Login'
import Placeorder from './pages/Placeorder'
import Orders from './pages/Orders' 
import Navbar from './componens/Navbar'
import Home from './pages/Home'
import Footer from './componens/Footer'
import Collection from './pages/Collection'
import Contact from './pages/Contact'
import Favorites from './pages/Favorites'
import Ratings from './pages/Ratings'
import ComingSoon from './componens/ComingSoon'
import NancyPreviewLoader from './componens/NancyPreviewLoader'
import ShippingPolicy from './componens/ShippingPolicy'
import LegalPolicy from './componens/LegalPolicy'
import SubcategoryProducts from './pages/SubcategoryProducts'
import CartDrawer from './componens/CartDrawer'
import CartRouteRedirect from './componens/CartRouteRedirect'
import WhatsAppOrderPopup from './componens/WhatsAppOrderPopup'
import { ShopContext } from './context/ShopContext'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext, useEffect, useState } from 'react';
import { useMockData } from './lib/mockData';

// backend URL
const backendUrl = String(import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");

const App = () => {
  const location = useLocation();
  const { cartDrawerOpen, closeCart } = useContext(ShopContext);
  const [fade, setFade] = useState(false);

  // 🔥 Maintenance
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(true);

  // fetch maintenance status (hooks are always called)
  useEffect(() => {
    if (useMockData) {
      setMaintenance(false);
      setLoading(false);
      return;
    }

    const fetchMaintenance = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/maintenance`);
        const data = await res.json();
        setMaintenance(data.maintenance);
      } catch (err) {
        console.error("Failed to fetch maintenance:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaintenance();
  }, []);

  useEffect(() => {
    setFade(true);
    const timeout = setTimeout(() => setFade(false), 150);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  useEffect(() => {
    const timeout = setTimeout(() => setPreviewLoading(false), 900);
    return () => clearTimeout(timeout);
  }, []);

  // 🔥 Render
  if (loading || previewLoading) {
    return <NancyPreviewLoader />;
  }

  return (         
    <div className="min-h-screen bg-white ">
      {maintenance ? (
        <ComingSoon />
      ) : (
        <>
          <Navbar />
          <div
            className={`transition-all ${
              fade ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
          >
            <ToastContainer />
            
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/Collection" element={<Collection />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/ratings" element={<Ratings />} />
              <Route path="/About" element={<About />} />
              <Route path="/Contact" element={<Contact />} />
              <Route path="/Product/:productId" element={<Product />} />
              <Route path="/cart" element={<CartRouteRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/place-order" element={<Placeorder />} />
              <Route path="/orders" element={<Orders />} />
              <Route path='/shippingpolicy' element={<ShippingPolicy />} />
              <Route path="/privacy-policy" element={<LegalPolicy type="privacy" />} />
              <Route path="/terms" element={<LegalPolicy type="terms" />} />
              <Route path="/subcategory/:slug" element={<SubcategoryProducts />} />
            </Routes>
          </div>
          <WhatsAppOrderPopup suppressed={cartDrawerOpen} />
          <CartDrawer open={cartDrawerOpen} onClose={closeCart} />
          <Footer className="bg-[#2f2f2f] text-white" />
        </>
      )}
    </div>
  );
}

export default App
