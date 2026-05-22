import React from "react";

const LevonOrnament = ({ className = "" }) => {
  return (
    <div
      className={`levon-ornament ${className}`}
      aria-hidden="true"
    >
      <span className="levon-ornament-line" />
      <span className="levon-ornament-dot" />
      <span className="levon-ornament-center">
        <span />
        <span />
        <span />
        <span />
      </span>
      <span className="levon-ornament-dot" />
      <span className="levon-ornament-line" />
    </div>
  );
};

export default LevonOrnament;
