import React, { useEffect } from "react";
import { FaInstagram, FaFacebookF } from "react-icons/fa";

const ShippingPolicy = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="bg-[#E9DFD3] min-h-screen flex flex-col items-center px-6 py-20 text-[#2f2f2f]">
      
      <h1 className="text-3xl font-serif mb-8">Shipping Policy</h1>

      <p className="max-w-2xl text-center leading-7 text-[16px]">
        We offer domestic shipping across Lebanon through our trusted delivery
        partners. Orders are processed within <b>1–2 business days</b>, and
        delivery typically takes <b>3–4 days</b> depending on your location.
        <br /><br />
        Please note that occasional delays may occur due to local conditions
        beyond our control. Shipping fees are calculated at checkout.
      </p>

      {/* social icons */}
      <div className="flex gap-6 mt-10 text-xl">
        <a
          href="https://www.instagram.com/velor_lb"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#C7A96B] transition"
        >
          <FaInstagram />
        </a>

        <a
          href="https://www.facebook.com/share/1DSWbsYdzx/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#C7A96B] transition"
        >
          <FaFacebookF />
        </a>
      </div>
    </div>
  );
};

export default ShippingPolicy;
