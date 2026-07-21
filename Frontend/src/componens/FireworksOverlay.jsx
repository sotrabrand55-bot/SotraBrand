import { createPortal } from "react-dom";

const fireworksSparks = [
  ["18vw", "31vh", "-34px", "-46px", "0ms", "#ffffff"],
  ["18vw", "31vh", "42px", "-38px", "70ms", "#f1c6d1"],
  ["18vw", "31vh", "-18px", "42px", "110ms", "#ff8fac"],
  ["35vw", "24vh", "-52px", "-24px", "40ms", "#ffffff"],
  ["35vw", "24vh", "50px", "-44px", "120ms", "#f1c6d1"],
  ["35vw", "24vh", "20px", "52px", "160ms", "#ff8fac"],
  ["54vw", "29vh", "-40px", "-50px", "10ms", "#ffffff"],
  ["54vw", "29vh", "48px", "-20px", "90ms", "#f1c6d1"],
  ["54vw", "29vh", "-22px", "46px", "150ms", "#ff8fac"],
  ["73vw", "34vh", "-48px", "-36px", "60ms", "#ffffff"],
  ["73vw", "34vh", "36px", "-52px", "130ms", "#f1c6d1"],
  ["73vw", "34vh", "24px", "46px", "190ms", "#ff8fac"],
  ["26vw", "56vh", "-42px", "-42px", "170ms", "#ffffff"],
  ["26vw", "56vh", "38px", "34px", "220ms", "#f1c6d1"],
  ["48vw", "52vh", "-46px", "32px", "200ms", "#ff8fac"],
  ["48vw", "52vh", "46px", "-40px", "240ms", "#ffffff"],
  ["68vw", "57vh", "-38px", "40px", "210ms", "#f1c6d1"],
  ["68vw", "57vh", "44px", "-34px", "260ms", "#ff8fac"],
];

const FireworksOverlay = () => {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="sotra-fireworks pointer-events-none fixed inset-0 z-[1000] h-screen w-screen overflow-hidden">
      {fireworksSparks.map(([x, y, dx, dy, delay, color], index) => (
        <span
          key={index}
          style={{
            "--spark-x": x,
            "--spark-y": y,
            "--spark-dx": dx,
            "--spark-dy": dy,
            "--spark-delay": delay,
            "--spark-color": color,
          }}
        />
      ))}
    </div>,
    document.body
  );
};

export default FireworksOverlay;
