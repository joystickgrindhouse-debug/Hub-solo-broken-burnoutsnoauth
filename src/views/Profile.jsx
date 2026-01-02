import React, { useState, useEffect } from "react";
import { UserService } from "../services/userService.js";
import { storage } from "../firebase.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import WaitingForUpload from "./WaitingForUpload.jsx";

const avatarStyles = [
  { id: "adventurer", name: "Adventurer" },
  { id: "avataaars", name: "Avataaars" },
  { id: "bottts", name: "Robots" },
  { id: "lorelei", name: "Lorelei" },
  { id: "micah", name: "Micah" },
  { id: "miniavs", name: "Miniavs" },
  { id: "notionists", name: "Notionists" },
  { id: "open-peeps", name: "Open Peeps" },
  { id: "personas", name: "Personas" },
  { id: "pixel-art", name: "Pixel Art" },
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

export default function Profile({ user, userProfile }) {
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [nickname, setNickname] = useState(userProfile?.nickname || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [seed, setSeed] = useState("");
  const [isDicebearAvatar, setIsDicebearAvatar] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [streaks, setStreaks] = useState({ current: 0, longest: 0 });
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (userProfile) {
      setBio(userProfile.bio || "");
      setNickname(userProfile.nickname || "");
      setStreaks({
        current: userProfile.currentStreak || 0,
        longest: userProfile.longestStreak || 0
      });
      setAchievements(userProfile.achievements || []);
    }
  }, [userProfile]);

  // When opening edit mode, reset the preview states to blank
  useEffect(() => {
    if (isEditingAvatar) {
      setCurrentAvatar("");
      setSelectedStyle("");
      setIsDicebearAvatar(false);
      // Generate a seed ready for when they pick a style, but don't show the avatar yet
      setSeed(user?.email?.split('@')[0] || Math.random().toString(36).substring(7));
    }
  }, [isEditingAvatar, user]);

  const saveBio = async () => {
    if (!user) return;
    
    const result = await UserService.updateUserProfile(user.uid, { bio, nickname });
    if (result.success) {
      setIsEditing(false);
    }
  };

  const saveAvatar = async () => {
    if (!user) return;
    setIsSavingAvatar(true);
    
    try {
      const avatarURL = isDicebearAvatar 
        ? `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${seed}`
        : currentAvatar;
      
      console.log("Saving Avatar URL:", avatarURL);
      
      // Update Firebase Auth
      await updateProfile(user, { photoURL: avatarURL });
      
      // Update Firestore
      const result = await UserService.updateUserProfile(user.uid, { avatarURL });
      
      if (result.success) {
        alert("Avatar saved successfully!");
        setIsEditingAvatar(false);
        window.location.reload(); 
      } else {
        throw new Error(result.error || "Database update failed");
      }
    } catch (error) {
      console.error("Error saving avatar:", error);
      alert("Failed to save avatar: " + error.message);
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image (JPG, PNG, GIF, or WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    try {
      setIsSavingAvatar(true);
      
      // 1. Instant Preview
      const objectUrl = URL.createObjectURL(file);
      setCurrentAvatar(objectUrl);
      setIsDicebearAvatar(false);

      // 2. Upload to Storage
      const timestamp = Date.now();
      const fileRef = ref(storage, `avatars/${user.uid}/${timestamp}-${file.name}`);
      const metadata = { contentType: file.type };
      
      console.log("Uploading to Storage...");
      await uploadBytes(fileRef, file, metadata);
      const downloadURL = await getDownloadURL(fileRef);
      
      // 3. Update State & Database
      setCurrentAvatar(downloadURL);
      console.log("Uploading to Firestore...");
      const updateResult = await UserService.updateUserProfile(user.uid, { avatarURL: downloadURL });
      
      if (updateResult.success) {
        await updateProfile(user, { photoURL: downloadURL });
        alert("Photo uploaded successfully!");
        setIsEditingAvatar(false);
        window.location.reload();
      } else {
        throw new Error(updateResult.error || "Firestore update failed");
      }
    } catch (error) {
      console.error("Critical upload error:", error);
      alert("Upload failed: " + error.message);
    } finally {
      setIsSavingAvatar(false);
      if (event.target) event.target.value = "";
    }
  };

  const avatarURL = userProfile?.avatarURL || user?.photoURL || "";
  const displayNicknameValue = userProfile?.nickname || user?.displayName || "User";
  const totalReps = userProfile?.totalReps || 0;
  const totalMiles = userProfile?.totalMiles || 0;
  const diceBalance = userProfile?.diceBalance || 0;

  const defaultAchievements = [
    { id: 1, name: "First Steps", description: "Complete your first workout", unlocked: totalReps > 0, icon: "🏃" },
    { id: 2, name: "Century Club", description: "Complete 100 total reps", unlocked: totalReps >= 100, icon: "💯" },
    { id: 3, name: "Rep Master", description: "Complete 500 total reps", unlocked: totalReps >= 500, icon: "🏆" },
    { id: 7, name: "First Blood", description: "Complete your first run", unlocked: totalMiles > 0, icon: "🏁" },
    { id: 8, name: "Breaking Stride", description: "Run 1 mile total", unlocked: totalMiles >= 1, icon: "⚡" },
    { id: 9, name: "Road Warrior", description: "Run 50 total miles", unlocked: totalMiles >= 50, icon: "🛣️" },
    { id: 4, name: "Dice Collector", description: "Earn 10 dice", unlocked: diceBalance >= 10, icon: "🎲" },
    { id: 5, name: "Streak Keeper", description: "Maintain a 7-day streak", unlocked: streaks.current >= 7, icon: "🔥" },
    { id: 6, name: "Elite Athlete", description: "Complete 1000 total reps", unlocked: totalReps >= 1000, icon: "⭐" }
  ];

  return (
    <div className="hero-background">
      <div style={{ 
        width: "95%", 
        maxWidth: "900px",
        minHeight: "80vh",
        background: "#000000",
        border: "2px solid #ff3050",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 0 30px rgba(255, 48, 80, 0.5), inset 0 0 20px rgba(255, 48, 80, 0.05)"
      }}>
        <div style={{
          display: "flex",
          gap: "2rem",
          marginBottom: "2rem",
          flexWrap: "wrap"
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem"
          }}>
            {isEditingAvatar ? (
              <div style={{ textAlign: "center", width: "100%", maxWidth: "400px" }}>
                <WaitingForUpload 
                  user={user} 
                  isUpdating={true} 
                  onSetupComplete={() => setIsEditingAvatar(false)} 
                />
              </div>
            ) : (
              <>
                {avatarURL && (
                  <img 
                    src={avatarURL} 
                    alt={nickname} 
                    style={{ 
                      width: "120px", 
                      height: "120px", 
                      borderRadius: "50%", 
                      background: "#fff",
                      border: "4px solid #ff3050",
                      boxShadow: "0 0 20px rgba(255, 48, 80, 0.6)"
                    }}
                  />
                )}
                <h2 style={{ 
                  color: "#ff3050",
                  textShadow: "0 0 15px rgba(255, 48, 80, 0.8)",
                  margin: 0
                }}>
                  {displayNicknameValue}
                </h2>
                <button
                  onClick={() => setIsEditingAvatar(true)}
                  style={{
                    padding: "6px 12px",
                    background: "#000000",
                    border: "2px solid #ff3050",
                    borderRadius: "6px",
                    color: "#ff3050",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  Edit Avatar
                </button>
              </>
            )}
          </div>

            <h3 style={{ 
              color: "#ff3050",
              textShadow: "0 0 15px rgba(255, 48, 80, 0.8)",
              marginBottom: "1rem"
            }}>
              Identity Details
            </h3>
            {isEditing ? (
              <div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ color: "#ff3050", display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontFamily: "'Press Start 2P', cursive" }}>NICKNAME</label>
                  <input 
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "#000000",
                      border: "2px solid #ff3050",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px",
                      boxShadow: "0 0 15px rgba(255, 48, 80, 0.3)"
                    }}
                  />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ color: "#ff3050", display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontFamily: "'Press Start 2P', cursive" }}>BIO</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    style={{
                      width: "100%",
                      minHeight: "100px",
                      padding: "0.75rem",
                      background: "#000000",
                      border: "2px solid #ff3050",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px",
                      resize: "vertical",
                      boxShadow: "0 0 15px rgba(255, 48, 80, 0.3), inset 0 0 10px rgba(255, 48, 80, 0.05)"
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <button
                    onClick={saveBio}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#ff3050",
                      border: "2px solid #ff3050",
                      borderRadius: "8px",
                      color: "#fff",
                      fontWeight: "bold",
                      cursor: "pointer",
                      boxShadow: "0 0 15px rgba(255, 48, 80, 0.6)"
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setBio(userProfile?.bio || "");
                      setNickname(userProfile?.nickname || "");
                      setIsEditing(false);
                    }}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#000000",
                      border: "2px solid #ff3050",
                      borderRadius: "8px",
                      color: "#ff3050",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ 
                  color: "#fff", 
                  lineHeight: "1.6",
                  marginBottom: "1rem"
                }}>
                  {bio || "No bio yet. Click Edit to add one!"}
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#000000",
                    border: "2px solid #ff3050",
                    borderRadius: "8px",
                    color: "#ff3050",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Edit Identity
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem"
        }}>
          <div style={{
            background: "rgba(255, 48, 80, 0.1)",
            border: "2px solid #ff3050",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center",
            boxShadow: "0 0 20px rgba(255, 48, 80, 0.3)"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔥</div>
            <div style={{ color: "#ff3050", fontSize: "2rem", fontWeight: "bold", textShadow: "0 0 10px rgba(255, 48, 80, 0.8)" }}>
              {streaks.current}
            </div>
            <div style={{ color: "#fff", fontSize: "0.9rem" }}>Current Streak</div>
          </div>

          <div style={{
            background: "rgba(255, 48, 80, 0.1)",
            border: "2px solid #ff3050",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center",
            boxShadow: "0 0 20px rgba(255, 48, 80, 0.3)"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⭐</div>
            <div style={{ color: "#ff3050", fontSize: "2rem", fontWeight: "bold", textShadow: "0 0 10px rgba(255, 48, 80, 0.8)" }}>
              {streaks.longest}
            </div>
            <div style={{ color: "#fff", fontSize: "0.9rem" }}>Longest Streak</div>
          </div>

          <div style={{
            background: "rgba(255, 48, 80, 0.1)",
            border: "2px solid #ff3050",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center",
            boxShadow: "0 0 20px rgba(255, 48, 80, 0.3)"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💪</div>
            <div style={{ color: "#ff3050", fontSize: "2rem", fontWeight: "bold", textShadow: "0 0 10px rgba(255, 48, 80, 0.8)" }}>
              {totalReps}
            </div>
            <div style={{ color: "#fff", fontSize: "0.9rem" }}>Total Reps</div>
          </div>

          <div style={{
            background: "rgba(255, 48, 80, 0.1)",
            border: "2px solid #ff3050",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center",
            boxShadow: "0 0 20px rgba(255, 48, 80, 0.3)"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏃</div>
            <div style={{ color: "#ff3050", fontSize: "2rem", fontWeight: "bold", textShadow: "0 0 10px rgba(255, 48, 80, 0.8)" }}>
              {totalMiles.toFixed(1)}
            </div>
            <div style={{ color: "#fff", fontSize: "0.9rem" }}>Total Miles</div>
          </div>

          <div style={{
            background: "rgba(255, 48, 80, 0.1)",
            border: "2px solid #ff3050",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center",
            boxShadow: "0 0 20px rgba(255, 48, 80, 0.3)"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎲</div>
            <div style={{ color: "#ff3050", fontSize: "2rem", fontWeight: "bold", textShadow: "0 0 10px rgba(255, 48, 80, 0.8)" }}>
              {diceBalance}
            </div>
            <div style={{ color: "#fff", fontSize: "0.9rem" }}>Dice Balance</div>
          </div>
        </div>

        <div>
          <h3 style={{ 
            color: "#ff3050",
            textShadow: "0 0 15px rgba(255, 48, 80, 0.8)",
            marginBottom: "1rem"
          }}>
            🏆 Achievements
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1rem"
          }}>
            {defaultAchievements.map((achievement) => (
              <div
                key={achievement.id}
                style={{
                  background: achievement.unlocked 
                    ? "rgba(255, 48, 80, 0.2)" 
                    : "rgba(0, 0, 0, 0.3)",
                  border: `2px solid ${achievement.unlocked ? "#ff3050" : "rgba(255, 48, 80, 0.3)"}`,
                  borderRadius: "12px",
                  padding: "1rem",
                  opacity: achievement.unlocked ? 1 : 0.5,
                  transition: "all 0.3s",
                  boxShadow: achievement.unlocked 
                    ? "0 0 20px rgba(255, 48, 80, 0.4)" 
                    : "none"
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                  {achievement.icon}
                </div>
                <div style={{ 
                  color: "#ff3050", 
                  fontWeight: "bold",
                  marginBottom: "0.25rem",
                  textShadow: achievement.unlocked ? "0 0 10px rgba(255, 48, 80, 0.8)" : "none"
                }}>
                  {achievement.name}
                </div>
                <div style={{ color: "#fff", fontSize: "0.85rem" }}>
                  {achievement.description}
                </div>
                {achievement.unlocked && (
                  <div style={{ 
                    marginTop: "0.5rem",
                    color: "#00ff00",
                    fontSize: "0.8rem",
                    fontWeight: "bold"
                  }}>
                    ✓ Unlocked
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}
