import 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import About from './pages/About'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Placeorder from './pages/Placeorder'
import Orders from './pages/Orders' 
import Navbar from './componens/Navbar'
import Home from './pages/Home'
import Footer from './componens/Footer'
import Collection from './pages/Collection'
import Contact from './pages/Contact'
import GiftSets from './pages/GiftSets'
import Favorites from './pages/Favorites'
import ComingSoon from './componens/ComingSoon'
import LevonLoader from './componens/LevonLoader'
import ShippingPolicy from './componens/ShippingPolicy'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from 'react';

// backend URL
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const App = () => {
  const location = useLocation();
  const [fade, setFade] = useState(false);

  // 🔥 Maintenance
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  // fetch maintenance status (hooks are always called)
  useEffect(() => {
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

  // 🔥 Render
  if (loading) return <LevonLoader />;

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
              <Route path="/gift-sets" element={<GiftSets />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/About" element={<About />} />
              <Route path="/Contact" element={<Contact />} />
              <Route path="/Product/:productId" element={<Product />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/place-order" element={<Placeorder />} />
              <Route path="/orders" element={<Orders />} />
              <Route path='/shippingpolicy' element={<ShippingPolicy />} />
            </Routes>
          </div>
          <Footer className="bg-[#2f2f2f] text-white" />
        </>
      )}
    </div>
  );
}

export default App
