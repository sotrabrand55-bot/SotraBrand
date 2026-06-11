/* eslint-disable no-unused-vars */
import React from "react";

// Pass a tailwind bg class or a hex color string to `bg`.
// Examples: bg="bg-white" or bg="#ffffff"
// eslint-disable-next-line react/prop-types
const FullWidth = ({ bg = "bg-white", className = "", children, ...rest }) => {
  // if user passed a hex, keep it raw; if they passed a tailwind class, use it
  const bgClass = bg.startsWith("bg-") ? bg : "";
  const bgStyle = !bgClass ? { backgroundColor: bg } : undefined;

  return (
    <section
      {...rest} // ✅ forward id and any other props
      style={bgStyle}
      className={`
        -mx-4 sm:-mx-[5vw] md:-mx-[7vw] lg:-mx-[9vw]
        ${bgClass} py-5 sm:py-7 md:py-8 ${className}
      `}
    >
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
        {children}
      </div>
    </section>
  );
};

export default FullWidth;
