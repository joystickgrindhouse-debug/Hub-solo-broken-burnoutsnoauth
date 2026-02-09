import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { storage, auth } from "../firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { UserService } from "../services/userService";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

const getCroppedImgBase64 = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    400,
    400
  );

  return canvas.toDataURL("image/jpeg", 0.6);
};

const WaitingForUpload = ({ user, onSetupComplete, isUpdating = false }) => {
  const t = useTheme();
  const [image, setImage] = useState(null);
  const [nickname, setNickname] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setImage(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleUpload = async () => {
    if (!image || !croppedAreaPixels || !nickname.trim()) {
      if (!nickname.trim()) alert("Please enter a nickname.");
      return;
    }
    setUploading(true);
    try {
      console.log("Starting upload process (Direct Firestore mode)...");
      const croppedBase64 = await getCroppedImgBase64(image, croppedAreaPixels);
      console.log("Cropped base64 created");
      
      console.log("Updating user profile in Firestore...");
      const updateResult = await UserService.updateUserProfile(auth.currentUser.uid, {
        nickname: nickname.trim(),
        avatarURL: croppedBase64,
        hasCompletedSetup: true
      });
      
      if (updateResult && updateResult.success) {
        console.log("Profile updated successfully");
        
        await new Promise(r => setTimeout(r, 800));
        
        if (isUpdating) {
          window.location.reload();
        } else {
          window.location.href = "/dashboard?refresh=" + Date.now();
        }
      } else {
        throw new Error(updateResult?.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Upload failed details:", err);
      alert(`Upload failed: ${err.message || 'Unknown error'}`);
      setUploading(false);
    }
  };

  return (
    <div className="hero-background" style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: isUpdating ? "auto" : "100vh",
      padding: "2rem",
      textAlign: "center",
      color: "#fff",
      position: "relative",
      overflow: "hidden"
    }}>
      <div className="overlay-card" style={{ 
        maxWidth: "600px", 
        zIndex: 10, 
        width: "100%",
        background: "rgba(0, 0, 0, 0.9)",
        border: `2px solid ${t.accent}`,
        borderRadius: "12px",
        padding: "2.5rem",
        boxShadow: `0 0 30px ${t.shadowSm}, inset 0 0 20px ${t.shadowXs}`,
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: "10px", left: "10px", width: "20px", height: "20px", borderTop: `2px solid ${t.accent}`, borderLeft: `2px solid ${t.accent}` }} />
        <div style={{ position: "absolute", top: "10px", right: "10px", width: "20px", height: "20px", borderTop: `2px solid ${t.accent}`, borderRight: `2px solid ${t.accent}` }} />
        <div style={{ position: "absolute", bottom: "10px", left: "10px", width: "20px", height: "20px", borderBottom: `2px solid ${t.accent}`, borderLeft: `2px solid ${t.accent}` }} />
        <div style={{ position: "absolute", bottom: "10px", right: "10px", width: "20px", height: "20px", borderBottom: `2px solid ${t.accent}`, borderRight: `2px solid ${t.accent}` }} />

        <h1 style={{ 
          fontFamily: "'Press Start 2P', cursive", 
          color: t.accent,
          marginBottom: "2rem",
          fontSize: "1.4rem",
          textShadow: `0 0 10px ${t.shadowMd}`,
          letterSpacing: "2px"
        }}>
          {isUpdating ? "UPDATE PROFILE" : "PROFILE SETUP"}
        </h1>

        <div style={{ marginBottom: "2rem", textAlign: "left" }}>
          <label style={{ 
            display: "block", 
            fontFamily: "'Press Start 2P', cursive", 
            fontSize: "0.7rem", 
            color: t.accent, 
            marginBottom: "10px" 
          }}>
            NICKNAME
          </label>
          <input 
            type="text" 
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter your rival name..."
            style={{
              width: "100%",
              padding: "12px",
              background: t.shadowXs,
              border: `2px solid ${t.accent}`,
              color: "#fff",
              fontFamily: "system-ui, sans-serif",
              borderRadius: "4px",
              outline: "none"
            }}
          />
        </div>
        
        {!image ? (
          <>
            <div style={{
              background: t.shadowXxs,
              padding: "1.5rem",
              borderRadius: "8px",
              border: `1px dashed ${t.shadowSm}`,
              marginBottom: "2rem"
            }}>
              <p style={{ 
                lineHeight: "1.8", 
                marginBottom: "0", 
                fontSize: "0.95rem",
                fontFamily: "system-ui, -apple-system, sans-serif",
                color: "rgba(255, 255, 255, 0.9)"
              }}>
                {isUpdating 
                  ? "Upload a new selfie or avatar to update your profile photo." 
                  : "Welcome to Rivalis! Please upload a selfie or an avatar to complete your profile setup."}
              </p>
            </div>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
              <label style={{
                display: "inline-block",
                padding: "1.2rem 2.5rem",
                background: t.accent,
                color: "#fff",
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "0.8rem",
                cursor: "pointer",
                borderRadius: "4px",
                border: "2px solid #fff",
                boxShadow: `0 0 20px ${t.shadowMd}`,
                transition: "transform 0.2s"
              }}>
                CHOOSE PHOTO
                <input type="file" accept="image/*" onChange={onSelectFile} style={{ display: "none" }} />
              </label>
              
              {isUpdating && onSetupComplete && (
                <button 
                  onClick={onSetupComplete}
                  style={{
                    padding: "1.2rem 2.5rem",
                    background: "rgba(0, 0, 0, 0.5)",
                    border: `2px solid ${t.accent}`,
                    color: t.accent,
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    borderRadius: "4px",
                    boxShadow: `0 0 10px ${t.shadowXs}`
                  }}
                >
                  CANCEL
                </button>
              )}
            </div>
          </>
        ) : (
          <div style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: "#000", 
            zIndex: 1000, 
            display: "flex", 
            flexDirection: "column" 
          }}>
            <div style={{ flex: 1, position: "relative", borderBottom: `3px solid ${t.accent}` }}>
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(${t.shadowXxs} 50%, transparent 50%)`,
                backgroundSize: "100% 4px",
                zIndex: 2,
                pointerEvents: "none"
              }} />
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                style={{
                  containerStyle: { background: "#000" },
                  cropAreaStyle: { border: `3px solid ${t.accent}`, boxShadow: `0 0 50px ${t.shadowMd}` }
                }}
              />
            </div>
            
            <div style={{ 
              padding: "2rem", 
              background: "#0a0a0a", 
              display: "flex", 
              flexDirection: "column",
              gap: "1.5rem", 
              alignItems: "center",
              borderTop: `1px solid ${t.shadowSm}`
            }}>
              <div style={{ width: "100%", maxWidth: "300px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: t.accent, fontFamily: "'Press Start 2P', cursive", fontSize: "0.6rem" }}>ZOOM</span>
                <input 
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: t.accent }}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem", width: "100%", justifyContent: "center" }}>
                <button 
                  onClick={() => setImage(null)}
                  style={{
                    flex: 1,
                    maxWidth: "150px",
                    padding: "1rem",
                    background: "rgba(0, 0, 0, 0.5)",
                    border: `2px solid ${t.accent}`,
                    color: t.accent,
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "0.7rem",
                    cursor: "pointer",
                    borderRadius: "4px"
                  }}
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={uploading}
                  style={{
                    flex: 1,
                    maxWidth: "200px",
                    padding: "1rem",
                    background: t.accent,
                    color: "#fff",
                    border: "2px solid #fff",
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "0.7rem",
                    cursor: "pointer",
                    borderRadius: "4px",
                    boxShadow: `0 0 20px ${t.shadowSm}`,
                    opacity: uploading ? 0.5 : 1
                  }}
                >
                  {uploading ? "SAVING..." : "SAVE PHOTO"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .hero-background {
          background: radial-gradient(circle at center, #1a0000 0%, #000 100%);
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 30px ${t.shadowSm}; }
          50% { box-shadow: 0 0 50px ${t.shadowMd}; }
        }
      `}</style>
    </div>
  );
};

export default WaitingForUpload;
