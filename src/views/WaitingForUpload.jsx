import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { storage, auth } from "../firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { UserService } from "../services/userService";
import { useNavigate } from "react-router-dom";

/**
 * Converts a cropped area to a Base64 string for more reliable transfer
 * in environments where Blobs might have issues.
 */
const getCroppedImgBase64 = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  // Set smaller fixed dimensions for profile photo to stay under Firestore limits
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

  return canvas.toDataURL("image/jpeg", 0.6); // Lower quality (0.6) to ensure small size
};

const WaitingForUpload = ({ user, onSetupComplete, isUpdating = false }) => {
  const [image, setImage] = useState(null);
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
    if (!image || !croppedAreaPixels) return;
    setUploading(true);
    try {
      console.log("Starting upload process (Direct Firestore mode)...");
      const croppedBase64 = await getCroppedImgBase64(image, croppedAreaPixels);
      console.log("Cropped base64 created");
      
      console.log("Updating user profile in Firestore...");
      const updateResult = await UserService.updateUserProfile(auth.currentUser.uid, {
        avatarURL: croppedBase64,
        hasCompletedSetup: true
      });
      
      if (updateResult && updateResult.success) {
        console.log("Profile updated successfully");
        // Force session update by notifying observers if any, 
        // but since we are doing a hard redirect, the new load will fetch the updated profile.
        
        await new Promise(r => setTimeout(r, 800));
        
        // Ensure we clear any local state that might interfere
        if (isUpdating) {
          window.location.reload();
        } else {
          // Use a cache-busting parameter for the dashboard redirect
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
        border: "2px solid #ff3050",
        borderRadius: "12px",
        padding: "2.5rem",
        boxShadow: "0 0 30px rgba(255, 48, 80, 0.4), inset 0 0 20px rgba(255, 48, 80, 0.1)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative corner accents */}
        <div style={{ position: "absolute", top: "10px", left: "10px", width: "20px", height: "20px", borderTop: "2px solid #ff3050", borderLeft: "2px solid #ff3050" }} />
        <div style={{ position: "absolute", top: "10px", right: "10px", width: "20px", height: "20px", borderTop: "2px solid #ff3050", borderRight: "2px solid #ff3050" }} />
        <div style={{ position: "absolute", bottom: "10px", left: "10px", width: "20px", height: "20px", borderBottom: "2px solid #ff3050", borderLeft: "2px solid #ff3050" }} />
        <div style={{ position: "absolute", bottom: "10px", right: "10px", width: "20px", height: "20px", borderBottom: "2px solid #ff3050", borderRight: "2px solid #ff3050" }} />

        <h1 style={{ 
          fontFamily: "'Press Start 2P', cursive", 
          color: "#ff3050",
          marginBottom: "2rem",
          fontSize: "1.4rem",
          textShadow: "0 0 10px rgba(255, 48, 80, 0.6)",
          letterSpacing: "2px"
        }}>
          {isUpdating ? "UPDATE PROFILE" : "PROFILE SETUP"}
        </h1>
        
        {!image ? (
          <>
            <div style={{
              background: "rgba(255, 48, 80, 0.05)",
              padding: "1.5rem",
              borderRadius: "8px",
              border: "1px dashed rgba(255, 48, 80, 0.3)",
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
                background: "linear-gradient(135deg, #ff3050 0%, #a30019 100%)",
                color: "#fff",
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "0.8rem",
                cursor: "pointer",
                borderRadius: "4px",
                border: "2px solid #fff",
                boxShadow: "0 0 20px rgba(255, 48, 80, 0.6)",
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
                    border: "2px solid #ff3050",
                    color: "#ff3050",
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    borderRadius: "4px",
                    boxShadow: "0 0 10px rgba(255, 48, 80, 0.2)"
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
            {/* Cropper UI with scanline effect */}
            <div style={{ flex: 1, position: "relative", borderBottom: "3px solid #ff3050" }}>
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(rgba(255, 48, 80, 0.05) 50%, transparent 50%)",
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
                  cropAreaStyle: { border: "3px solid #ff3050", boxShadow: "0 0 50px rgba(255, 48, 80, 0.5)" }
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
              borderTop: "1px solid rgba(255, 48, 80, 0.3)"
            }}>
              {/* Zoom control */}
              <div style={{ width: "100%", maxWidth: "300px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "#ff3050", fontFamily: "'Press Start 2P', cursive", fontSize: "0.6rem" }}>ZOOM</span>
                <input 
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: "#ff3050" }}
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
                    border: "2px solid #ff3050",
                    color: "#ff3050",
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
                    background: "linear-gradient(135deg, #ff3050 0%, #a30019 100%)",
                    color: "#fff",
                    border: "2px solid #fff",
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "0.7rem",
                    cursor: "pointer",
                    borderRadius: "4px",
                    boxShadow: "0 0 20px rgba(255, 48, 80, 0.4)",
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
          0%, 100% { box-shadow: 0 0 30px rgba(255, 48, 80, 0.4); }
          50% { box-shadow: 0 0 50px rgba(255, 48, 80, 0.6); }
        }
      `}</style>
    </div>
  );
};

export default WaitingForUpload;
