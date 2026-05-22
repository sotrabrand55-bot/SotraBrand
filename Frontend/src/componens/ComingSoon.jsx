export default function ComingSoon() {
  return (
    <div
      style={{
        backgroundColor: "#E9DFD3", // beige background
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "20px"
      }}
    >
      {/* LOGO */}
      <h1
        style={{
          color: "#C7A96B",          // gold color same as your brand
          fontSize: "72px",
          fontWeight: "400",
          letterSpacing: "4px",
          margin: 0,
          fontFamily: "Garamond, serif",
        }}
      >
        LEVON
      </h1>

      {/* SUBTEXT */}
      <p
        style={{
          color: "#000000",
          fontSize: "20px",
          marginTop: "20px",
          fontFamily: "Poppins, sans-serif",
          opacity: 0.9
        }}
      >
        Coming Soon — Stay Tuned
      </p>
    </div>
  );
}

