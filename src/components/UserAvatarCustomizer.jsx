import React, { useState, useEffect, useCallback } from "react";
import Cropper from 'react-easy-crop';
import { useNavigate } from "react-router-dom";
import { auth, storage } from "../firebase";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UserService } from "../services/userService";

// Helper for cropping
  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Ensure we have a square canvas for the avatar
    const size = Math.min(pixelCrop.width, pixelCrop.height);
    canvas.width = size;
    canvas.height = size;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      size,
      size
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.85); // Added quality parameter for faster upload
    });
  };

const avatarStyles = [
  { id: "adventurer", name: "Adventurer", desc: "Illustrated characters" },
  { id: "avataaars", name: "Avataaars", desc: "Cartoon style" },
  { id: "bottts", name: "Robots", desc: "Futuristic bots" },
  { id: "lorelei", name: "Lorelei", desc: "Modern portraits" },
  { id: "micah", name: "Micah", desc: "Geometric style" },
  { id: "miniavs", name: "Miniavs", desc: "Minimal avatars" },
  { id: "notionists", name: "Notionists", desc: "Notion-style" },
  { id: "open-peeps", name: "Open Peeps", desc: "Hand-drawn" },
  { id: "personas", name: "Personas", desc: "Professional" },
  { id: "pixel-art", name: "Pixel Art", desc: "Retro gaming" },
];

const parseDicebearURL = (url) => {
  return null;
};

const UserAvatarCustomizer = ({ user: propUser, isFirstTimeSetup = false, onSetupComplete, userProfile }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(propUser || null);
  const [selectedStyle, setSelectedStyle] = useState("adventurer");
  const [seed, setSeed] = useState("");
  const [avatarURL, setAvatarURL] = useState("");
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDicebearAvatar, setIsDicebearAvatar] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [nicknameError, setNicknameError] = useState("");

  // Cropping state
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    const currentUser = propUser || auth.currentUser;
    if (!currentUser) return;
    setUser(currentUser);
    
    if (userProfile && userProfile.nickname) {
      setNickname(userProfile.nickname);
    }
    
    if (currentUser.photoURL) {
      setAvatarURL(currentUser.photoURL);
      setIsDicebearAvatar(false);
    }
    
    setInitialized(true);
  }, [propUser, userProfile]);

  useEffect(() => {
    // Disabled style generation
  }, [selectedStyle, seed, initialized, isDicebearAvatar, avatarURL]);

  const handleSaveAvatar = async () => {
    console.log("=== SAVE AVATAR CLICKED ===");
    
    if (!user) {
      console.error("No user found!");
      return;
    }
    
    if (!nickname.trim()) {
      setNicknameError("Nickname is required");
      return;
    }
    
    setNicknameError("");
    setSaving(true);
    
    try {
      await updateProfile(user, {
        photoURL: avatarURL,
        displayName: nickname
      });
      
      await UserService.updateUserProfile(user.uid, { 
        nickname, 
        avatarURL,
        hasCompletedSetup: true 
      });
      
      if (isFirstTimeSetup && onSetupComplete) {
        onSetupComplete({ ...userProfile, nickname, avatarURL, hasCompletedSetup: true });
      }
      alert("Profile updated successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const generateRandomNickname = () => {
    // Disabled random generation
  };

  const randomizeSeed = () => {
    // Disabled random generation
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileUpload = (event) => {
    console.log("=== FILE UPLOAD EVENT TRIGGERED ===");
    const file = event.target.files?.[0];
    
    if (!file) {
      console.log("No file selected in event");
      return;
    }

    console.log("File detected:", file.name, file.type, file.size);

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      console.error("Invalid type:", file.type);
      alert("Please upload a valid image (JPG, PNG, GIF, or WebP)");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      console.log("FileReader finished, setting imageToCrop");
      setImageToCrop(reader.result);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setIsDicebearAvatar(false);
    });
    reader.readAsDataURL(file);
    
    // Clear input so same file can be selected again
    event.target.value = "";
  };

  const handleCropSave = async () => {
    if (!croppedAreaPixels || !imageToCrop) {
      console.error("Missing crop data or image");
      return;
    }
    
    try {
      setSaving(true);
      console.log("Saving crop, croppedAreaPixels:", croppedAreaPixels);
      
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const uid = user?.uid || auth.currentUser?.uid;
      
      if (!uid) {
        throw new Error("User session not found. Please log in again.");
      }

      console.log("Uploading blob of size:", croppedBlob.size);

      // Upload directly to Firebase Storage
      const storageRef = ref(storage, `avatars/${uid}-${Date.now()}.jpg`);
      await uploadBytes(storageRef, croppedBlob);
      const downloadURL = await getDownloadURL(storageRef);
      
      console.log("Firebase Storage upload successful, URL:", downloadURL);

      // Update local state first for immediate UI feedback
      setAvatarURL(downloadURL);
      setSeed("");
      setIsDicebearAvatar(false);
      setImageToCrop(null);
      
      // CRITICAL: Force update both Auth and Firestore immediately
      console.log("Performing final profile sync...");
      await Promise.all([
        updateProfile(auth.currentUser, { 
          photoURL: downloadURL,
          displayName: nickname || auth.currentUser.displayName 
        }),
        UserService.updateUserProfile(uid, { 
          avatarURL: downloadURL, 
          nickname: nickname || auth.currentUser.displayName,
          hasCompletedSetup: true 
        })
      ]);
      
      console.log("Profile sync complete, navigating...");
      navigate("/dashboard");
    } catch (e) {
      console.error("CRITICAL SAVE ERROR:", e);
      alert("Error saving: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      {imageToCrop && (
        <div style={styles.cropperModal}>
          <div style={styles.cropperContainer}>
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape="round"
              showGrid={false}
            />
          </div>
          <div style={styles.cropperControls}>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              style={styles.zoomRange}
            />
            <div style={styles.cropperButtons}>
              <button onClick={() => setImageToCrop(null)} style={styles.cancelButton}>Cancel</button>
              <button onClick={handleCropSave} style={styles.confirmButton} disabled={saving}>
                {saving ? "Processing..." : "Crop & Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.previewSection}>
        <h3 style={styles.heading}>Profile Identity</h3>
        <div style={styles.avatarWrapper}>
          {avatarURL ? (
            <img
              src={avatarURL}
              alt="Avatar Preview"
              style={styles.avatar}
            />
          ) : (
            <div style={{ ...styles.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff3050', background: '#000' }}>
              No Photo
            </div>
          )}
        </div>
        <div style={styles.buttonGroup}>
          <button 
            onClick={() => document.getElementById('avatar-file-input').click()} 
            style={styles.randomButton}
          >
            📸 Upload Profile Photo
          </button>
          <input
            id="avatar-file-input"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={saving}
            style={{ display: 'none' }}
          />
        </div>
        <p style={styles.uploadHint}>Upload your own photo or selfie (JPG, PNG, GIF, WebP - max 5MB)</p>
      </div>

      <div style={styles.customizeSection}>
        <div style={styles.nicknameSection}>
          <label style={styles.label}>Nickname</label>
          <div style={styles.nicknameInputGroup}>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setNicknameError("");
              }}
              placeholder="Enter your nickname"
              style={{...styles.input, marginBottom: 0, borderColor: nicknameError ? '#ff3050' : 'rgba(255, 255, 255, 0.1)'}}
            />
          </div>
          {nicknameError && <div style={styles.error}>❌ {nicknameError}</div>}
        </div>

        <button
          onClick={handleSaveAvatar}
          disabled={saving || !avatarURL || !nickname}
          style={{
            ...styles.saveButton,
            ...(saving || !avatarURL || !nickname ? styles.saveButtonDisabled : {})
          }}
        >
          {saving ? "Updating..." : "💾 Finalize Profile"}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    padding: "15px",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  },
  cropperModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#000000',
    zIndex: 99999,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  cropperContainer: {
    position: 'relative',
    flex: 1,
    width: '100%',
    background: '#000',
  },
  cropperControls: {
    height: '180px',
    padding: '20px',
    backgroundColor: '#111',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'center',
    borderTop: '1px solid #333',
    zIndex: 100000,
  },
  zoomRange: {
    width: '80%',
    accentColor: '#ff3050',
  },
  cropperButtons: {
    display: 'flex',
    gap: '20px',
  },
  cancelButton: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #ff3050',
    background: 'transparent',
    color: '#ff3050',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  confirmButton: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#ff3050',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  previewSection: {
    width: "100%",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    padding: "20px",
    textAlign: "center",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxSizing: "border-box",
  },
  customizeSection: {
    width: "100%",
    boxSizing: "border-box",
  },
  nicknameSection: {
    marginBottom: "20px",
    width: "100%",
  },
  nicknameInputGroup: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  generateButton: {
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #ff3050 0%, #cc0033 100%)",
    color: "#fff",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 4px 15px rgba(255, 48, 80, 0.4)",
  },
  hint: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "11px",
    marginBottom: "8px",
    fontStyle: "italic",
  },
  error: {
    color: "#ff3050",
    fontSize: "14px",
    marginTop: "8px",
    fontWeight: "600",
    padding: "8px",
    background: "rgba(255, 48, 80, 0.1)",
    borderRadius: "6px",
    border: "1px solid #ff3050",
  },
  heading: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "15px",
    color: "#fff",
    textAlign: "center",
  },
  avatarWrapper: {
    width: "150px",
    height: "150px",
    margin: "0 auto 15px",
    borderRadius: "50%",
    overflow: "hidden",
    background: "linear-gradient(135deg, #ff3050 0%, #cc0033 100%)",
    padding: "5px",
    boxShadow: "0 10px 40px rgba(255, 48, 80, 0.6), 0 0 20px rgba(255, 48, 80, 0.4)",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "#fff",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  randomButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #ff3050 0%, #cc0033 100%)",
    color: "#fff",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 4px 15px rgba(255, 48, 80, 0.4)",
  },
  uploadLabel: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #ff3050 0%, #cc0033 100%)",
    color: "#fff",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 4px 15px rgba(255, 48, 80, 0.4)",
    display: "block",
  },
  fileInput: {
    display: "none",
  },
  uploadHint: {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: "10px",
    marginBottom: 0,
  },
  stylesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
    gap: "10px",
    marginBottom: "20px",
    width: "100%",
  },
  styleCard: {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    padding: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "2px solid transparent",
    backdropFilter: "blur(10px)",
  },
  styleCardActive: {
    border: "2px solid #ff3050",
    background: "rgba(255, 48, 80, 0.1)",
    transform: "scale(1.05)",
    boxShadow: "0 8px 25px rgba(255, 48, 80, 0.5), 0 0 15px rgba(255, 48, 80, 0.3)",
  },
  stylePreview: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#fff",
    margin: "0 auto 8px",
    display: "block",
  },
  styleInfo: {
    textAlign: "center",
  },
  styleName: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#fff",
    marginBottom: "2px",
  },
  styleDesc: {
    fontSize: "10px",
    color: "rgba(255, 255, 255, 0.6)",
  },
  seedSection: {
    marginBottom: "15px",
    width: "100%",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#fff",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    background: "rgba(255, 255, 255, 0.05)",
    color: "#fff",
    backdropFilter: "blur(10px)",
    boxSizing: "border-box",
  },
  saveButton: {
    width: "100%",
    padding: "14px",
    fontSize: "16px",
    fontWeight: "700",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #ff3050 0%, #cc0033 100%)",
    color: "#fff",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 20px rgba(255, 48, 80, 0.6), 0 0 30px rgba(255, 48, 80, 0.4)",
  },
  saveButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};

export default UserAvatarCustomizer;
