import React from "react";
import { useNavigate } from "react-router-dom";
import boxingImage from "/assets/images/boxing.png";
import nutritionImage from "/assets/images/nutrition.png";
import golfImage from "/assets/images/golf.png";
import danceImage from "/assets/images/dance.png";
import baseballImage from "/assets/images/baseball.png";

const otherApps = [
  {
    id: "boxing",
    name: "Rivalis Boxing",
    image: boxingImage,
    link: "#",
    status: "Active"
  },
  {
    id: "nutrition",
    name: "Rivalis Nutrition",
    image: nutritionImage,
    link: "#",
    status: "Coming Soon"
  },
  {
    id: "golf",
    name: "Rivalis Golf",
    image: golfImage,
    link: "#",
    status: "Coming Soon"
  },
  {
    id: "dance",
    name: "Rivalis Dance",
    image: danceImage,
    link: "#",
    status: "Coming Soon"
  },
  {
    id: "baseball",
    name: "Rivalis Baseball",
    image: baseballImage,
    link: "#",
    status: "Coming Soon"
  }
];

export default function OtherApps() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-background" style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => navigate("/")} style={styles.backButton}>
            ← BACK TO HUB
          </button>
          <h1 className="rivalis-text" style={styles.title}>OTHER RIVALIS APPS</h1>
        </div>

        <div style={styles.tilesGrid}>
          {otherApps.map((app) => (
            <div key={app.id} style={styles.tile}>
              <img 
                src={app.image} 
                alt={app.name} 
                style={styles.tileImage}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{...styles.imagePlaceholder, display: 'none'}}>
                {app.name.charAt(8)}
              </div>
              <div style={styles.tileOverlay}>
                <h2 style={styles.tileName}>{app.name}</h2>
                <span style={{
                  ...styles.status,
                  color: app.status === "Active" ? "#00ff00" : "#ff4081"
                }}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", padding: "20px" },
  container: { maxWidth: "1200px", margin: "0 auto" },
  header: { display: "flex", alignItems: "center", marginBottom: "40px", gap: "20px" },
  backButton: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "white",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "'Press Start 2P', cursive",
    fontSize: "0.7rem"
  },
  title: { fontSize: "2rem", color: "white", margin: 0 },
  tilesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px"
  },
  tile: {
    position: "relative",
    height: "250px",
    borderRadius: "16px",
    overflow: "hidden",
    border: "2px solid rgba(255,255,255,0.1)",
    background: "#111"
  },
  tileImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "4rem",
    color: "rgba(255,255,255,0.05)",
    background: "linear-gradient(45deg, #111, #222)"
  },
  tileOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "20px",
    background: "linear-gradient(transparent, rgba(0,0,0,0.9))"
  },
  tileName: { color: "white", margin: "0 0 5px 0", fontSize: "1.5rem" },
  status: { fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase" }
};