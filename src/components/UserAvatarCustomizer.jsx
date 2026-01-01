import React, { useState, useEffect, useCallback } from "react";
import Cropper from 'react-easy-crop';
import { useNavigate } from "react-router-dom";
import { auth, storage } from "../firebase";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UserService } from "../services/userService";
import { NicknameService } from "../services/nicknameService";

// Helper for cropping
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg');
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
  if (!url || !url.includes('dicebear.com')) {
    return null;
  }
  
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const seed = urlObj.searchParams.get('seed');
    
    if (!seed) return null;
    
    const versionIndex = pathParts.findIndex(part => part.includes('.x'));
    if (versionIndex === -1) return null;
    
    const style = pathParts[versionIndex + 1];
    
    if (!style) return null;
    
    return { style, seed };
  } catch (e) {
    return null;
  }
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
    } else if (isFirstTimeSetup) {
      setNickname(NicknameService.generate());
    }
    
    if (currentUser.photoURL) {
      const parsed = parseDicebearURL(currentUser.photoURL);
      
      if (parsed && parsed.style && parsed.seed) {
        setSelectedStyle(parsed.style);
        setSeed(parsed.seed);
        setAvatarURL(currentUser.photoURL);
        setIsDicebearAvatar(true);
      } else {
        setAvatarURL(currentUser.photoURL);
        setIsDicebearAvatar(false);
        const initialSeed = currentUser.email?.split('@')[0] || Math.random().toString(36).substring(7);
        setSeed(initialSeed);
      }
    } else {
      const initialSeed = currentUser.email?.split('@')[0] || Math.random().toString(36).substring(7);
      setSeed(initialSeed);
      setIsDicebearAvatar(true);
      const url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${initialSeed}`;
      setAvatarURL(url);
    }
    
    setInitialized(true);
  }, [propUser, userProfile, isFirstTimeSetup]);

  useEffect(() => {
    if (initialized && isDicebearAvatar && seed && !avatarURL.startsWith('/objects/')) {
      const url = `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${seed}`;
      setAvatarURL(url);
    }
  }, [selectedStyle, seed, initialized, isDicebearAvatar, avatarURL]);

  const handleSaveAvatar = async () => {
    console.log("=== SAVE AVATAR CLICKED ===");
    console.log("User:", user);
    console.log("Nickname:", nickname);
    console.log("Avatar URL:", avatarURL);
    console.log("Is first time setup:", isFirstTimeSetup);
    
    if (!user) {
      console.error("No user found!");
      return;
    }
    
    const validation = NicknameService.validate(nickname);
    console.log("Validation result:", validation);
    if (!validation.valid) {
      setNicknameError(validation.error);
      console.error("Validation failed:", validation.error);
      alert("Invalid nickname: " + validation.error);
      return;
    }
    
    setNicknameError("");
    setSaving(true);
    console.log("Starting save process...");
    
    try {
      console.log("Updating Firebase Auth profile...");
      await updateProfile(user, {
        photoURL: avatarURL,
        displayName: nickname
      });
      console.log("Firebase Auth profile updated successfully");
      
      const parsed = parseDicebearURL(avatarURL);
      if (parsed) {
        setIsDicebearAvatar(true);
      } else if (avatarURL.startsWith('/objects/')) {
        setIsDicebearAvatar(false);
      }
      
      console.log("Finalizing Firestore update with avatarURL:", avatarURL);
      const updateResult = await UserService.updateUserProfile(user.uid, { 
        nickname, 
        avatarURL,
        hasCompletedSetup: true 
      });
      
      if (updateResult.success) {
        console.log("Profile saved to Firestore successfully");
        if (isFirstTimeSetup && onSetupComplete) {
          onSetupComplete({ ...userProfile, nickname, avatarURL, hasCompletedSetup: true });
        }
        alert("Avatar and nickname saved successfully!");
        navigate("/dashboard");
      } else {
        console.error("Failed to update profile in Firestore:", updateResult.error);
        alert("Failed to save to Firestore: " + (updateResult.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving avatar:", error);
      alert("Failed to save: " + error.message);
    } finally {
      setSaving(false);
      console.log("=== SAVE COMPLETE ===");
    }
  };

  const generateRandomNickname = () => {
    const newNickname = NicknameService.generate();
    setNickname(newNickname);
    setNicknameError("");
  };

  const randomizeSeed = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setSeed(newSeed);
    setIsDicebearAvatar(true);
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
        alert("User session not found. Please log in again.");
        setSaving(false);
        return;
      }

      console.log("Uploading blob of size:", croppedBlob.size);

      // Step 1: Request presigned URL from backend
      const response = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `avatar-${uid}-${Date.now()}.jpg`,
          size: croppedBlob.size,
          contentType: "image/jpeg",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadURL, objectPath } = await response.json();
      console.log("Received upload URL, starting PUT upload...");

      // Step 2: Upload directly to cloud storage
      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        body: croppedBlob,
        headers: { "Content-Type": "image/jpeg" },
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload to storage: " + uploadRes.statusText);
      }

      console.log("Upload to cloud successful!");

      // Final avatar URL is the internal /objects/ path
      const downloadURL = objectPath;
      console.log("New avatar internal path set to state:", downloadURL);
      
      setAvatarURL(downloadURL);
      setSeed(""); // Clear seed to prevent Dicebear override
      setIsDicebearAvatar(false);
      setImageToCrop(null);
      
      // Auto-save to profile immediately after crop
      console.log("Auto-saving to profile...");
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
      await UserService.updateUserProfile(uid, { avatarURL: downloadURL, hasCompletedSetup: true });
      
      alert("Selfie uploaded and saved successfully!");
      navigate("/dashboard");
    } catch (e) {
      console.error("Crop save error detail:", e);
      alert("Failed to crop and upload image: " + e.message);
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
        <h3 style={styles.heading}>Avatar Preview</h3>
        <div style={styles.avatarWrapper}>
          {avatarURL && (
            <img
              src={avatarURL}
              alt="Avatar Preview"
              style={styles.avatar}
            />
          )}
        </div>
        <div style={styles.buttonGroup}>
          <button onClick={randomizeSeed} style={styles.randomButton}>
            🎲 Randomize
          </button>
          <button 
            onClick={() => document.getElementById('avatar-file-input').click()} 
            style={styles.randomButton}
          >
            📸 Upload Photo
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
          <div style={styles.hint}>Only letters, numbers, and underscores (no spaces). 3-20 characters.</div>
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
            <button onClick={generateRandomNickname} style={styles.generateButton}>
              🎲 Generate
            </button>
          </div>
          {nicknameError && <div style={styles.error}>❌ {nicknameError}</div>}
        </div>

        <h3 style={styles.heading}>Choose Style</h3>
        <div style={styles.stylesGrid}>
          {avatarStyles.map((style) => (
            <div
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              style={{
                ...styles.styleCard,
                ...(selectedStyle === style.id ? styles.styleCardActive : {})
              }}
            >
              <img
                src={`https://api.dicebear.com/7.x/${style.id}/svg?seed=${seed}`}
                alt={style.name}
                style={styles.stylePreview}
              />
              <div style={styles.styleInfo}>
                <div style={styles.styleName}>{style.name}</div>
                <div style={styles.styleDesc}>{style.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.seedSection}>
          <label style={styles.label}>Custom Seed (name or phrase)</label>
          <input
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Enter text to generate unique avatar"
            style={styles.input}
          />
        </div>

        <button
          onClick={handleSaveAvatar}
          disabled={saving}
          style={{
            ...styles.saveButton,
            ...(saving ? styles.saveButtonDisabled : {})
          }}
        >
          {saving ? "Saving..." : "💾 Save Avatar"}
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
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    zIndex: 9999, // Extremely high z-index to stay on top
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropperContainer: {
    position: 'relative',
    width: '100%',
    height: '70vh', // Take up most of the screen
    background: '#000',
  },
  cropperControls: {
    padding: '20px',
    backgroundColor: '#111',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    alignItems: 'center',
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
