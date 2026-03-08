import { useState } from "react";

export default function AICoach() {

  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "320px",
            height: "420px",
            background: "#0b0b0b",
            border: "1px solid #222",
            borderRadius: "14px",
            boxShadow: "0 20px 60px rgba(0,0,0,.7)",
            zIndex: 3000,
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div
            style={{
              padding: "10px",
              borderBottom: "1px solid #222",
              fontWeight: "bold"
            }}
          >
            Rivalis Coach
          </div>

          <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
            Ask me anything about your workouts.
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          fontSize: "28px",
          background: "#ff0033",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          zIndex: 3000
        }}
      >
        💪
      </button>
    </>
  );
}
