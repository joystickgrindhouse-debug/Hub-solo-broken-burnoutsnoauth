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

const WaitingForUpload = ({ user, onSetupComplete }) => {
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
      
      console.log("Skipping Storage upload, saving directly to Firestore...");

      console.log("Updating user profile in Firestore...");
      const updateResult = await UserService.updateUserProfile(auth.currentUser.uid, {
        avatarURL: croppedBase64, // Store Base64 directly for now
        hasCompletedSetup: true
      });
      console.log("Firestore update result:", updateResult);

      if (updateResult && updateResult.success) {
        console.log("Profile updated successfully, waiting for propagation...");
        await new Promise(r => setTimeout(r, 800));
        window.location.href = "/dashboard";
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
      minHeight: "100vh",
      padding: "2rem",
      textAlign: "center",
      color: "#fff",
      position: "relative",
      overflow: "hidden"
    }}>
      <div className="overlay-card" style={{ maxWidth: "500px", zIndex: 10 }}>
        <h1 style={{ 
          fontFamily: "'Press Start 2P', cursive", 
          color: "#ff3050",
          marginBottom: "1.5rem",
          fontSize: "1.2rem"
        }}>
          IDENTITY TERMINAL
        </h1>
        
        {!image ? (
          <>
            <p style={{ lineHeight: "1.6", marginBottom: "2rem", fontSize: "0.9rem" }}>
              The arena requires visual confirmation. Upload your pilot identity photo to proceed.
            </p>
            <label style={{
              display: "inline-block",
              padding: "1rem 2rem",
              background: "#ff3050",
              color: "#fff",
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "0.8rem",
              cursor: "pointer",
              borderRadius: "4px",
              boxShadow: "0 0 15px rgba(255, 48, 80, 0.4)"
            }}>
              CAPTURE PHOTO
              <input type="file" accept="image/*" onChange={onSelectFile} style={{ display: "none" }} />
            </label>
          </>
        ) : (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#000", zIndex: 1000, display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div style={{ padding: "2rem", background: "#111", display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button 
                onClick={() => setImage(null)}
                style={{
                  padding: "0.8rem 1.5rem",
                  background: "transparent",
                  border: "1px solid #ff3050",
                  color: "#ff3050",
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: "0.7rem",
                  cursor: "pointer"
                }}
              >
                CANCEL
              </button>
              <button 
                onClick={handleUpload}
                disabled={uploading}
                style={{
                  padding: "0.8rem 1.5rem",
                  background: "#ff3050",
                  color: "#fff",
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: "0.7rem",
                  cursor: "pointer",
                  opacity: uploading ? 0.5 : 1
                }}
              >
                {uploading ? "SYNCING..." : "SYNC IDENTITY"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .hero-background {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
        }
        .overlay-card {
          background: rgba(0, 0, 0, 0.85);
          padding: 2.5rem;
          border: 1px solid rgba(255, 48, 80, 0.3);
          box-shadow: 0 0 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 48, 80, 0.1);
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default WaitingForUpload;
