import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

const SHOP_URL = "https://rivalis.printful.me";

const PRODUCTS = [
  { name: "Rivalis Tee", price: "$29.99", image: "/merch/tshirt.jpg", tag: "BESTSELLER" },
  { name: "Rivalis Hoodie", price: "$54.99", image: "/merch/hoodie.jpg", tag: "POPULAR" },
  { name: "Rivalis Bottle", price: "$19.99", image: "/merch/bottle.jpg", tag: null },
];

export default function MerchShop() {
  const navigate = useNavigate();
  const t = useTheme();

  const openShop = () => {
    window.open(SHOP_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ padding: "16px 12px", minHeight: "100vh", paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "1px", fontFamily: "'Press Start 2P', cursive", color: t.accent }}>
              MERCH SHOP
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", marginTop: "6px" }}>
              Official Rivalis gear — tap any item to shop
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              border: `1px solid ${t.shadowXs}`,
              background: "rgba(0,0,0,0.4)",
              color: "rgba(255,255,255,0.8)",
              fontSize: "11px",
              fontFamily: "'Press Start 2P', cursive",
              cursor: "pointer",
            }}
          >
            Back
          </button>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "12px",
        }}>
          {PRODUCTS.map((product, i) => (
            <div
              key={i}
              onClick={openShop}
              style={{
                borderRadius: "14px",
                border: `1px solid ${t.shadowXs}`,
                background: "rgba(0,0,0,0.5)",
                overflow: "hidden",
                cursor: "pointer",
                transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
                position: "relative",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = t.shadowSm;
                e.currentTarget.style.boxShadow = `0 8px 24px ${t.shadowXs}`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = t.shadowXs;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {product.tag && (
                <div style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  background: t.accent,
                  color: "#000",
                  fontSize: "7px",
                  fontFamily: "'Press Start 2P', cursive",
                  padding: "3px 6px",
                  borderRadius: "4px",
                  fontWeight: 700,
                  zIndex: 2,
                  letterSpacing: "0.5px",
                }}>
                  {product.tag}
                </div>
              )}
              <div style={{
                width: "100%",
                aspectRatio: "1",
                background: "rgba(20,20,20,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}>
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
              <div style={{ padding: "10px 12px" }}>
                <div style={{
                  fontSize: "9px",
                  fontFamily: "'Press Start 2P', cursive",
                  color: "#fff",
                  marginBottom: "6px",
                  lineHeight: 1.4,
                }}>
                  {product.name}
                </div>
                <div style={{
                  fontSize: "11px",
                  fontFamily: "'Press Start 2P', cursive",
                  color: t.accent,
                  fontWeight: 700,
                }}>
                  {product.price}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          onClick={openShop}
          style={{
            marginTop: "20px",
            padding: "16px",
            borderRadius: "14px",
            border: `1px solid ${t.shadowXs}`,
            background: "rgba(0,0,0,0.4)",
            textAlign: "center",
            cursor: "pointer",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = t.shadowSm;
            e.currentTarget.style.boxShadow = `0 4px 16px ${t.shadowXs}`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = t.shadowXs;
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{
            fontSize: "10px",
            fontFamily: "'Press Start 2P', cursive",
            color: t.accent,
            marginBottom: "6px",
          }}>
            VIEW FULL COLLECTION
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>
            Browse all Rivalis merch at our official store
          </div>
        </div>
      </div>
    </div>
  );
}
