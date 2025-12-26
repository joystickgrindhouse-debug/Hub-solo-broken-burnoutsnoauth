import React, { useState, useEffect } from "react";
import { UserService } from "../services/userService.js";

export default function Profile({ user, userProfile }) {
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [isEditing, setIsEditing] = useState(false);
  const [streaks, setStreaks] = useState({ current: 0, longest: 0 });
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (userProfile) {
      setBio(userProfile.bio || "");
      setStreaks({
        current: userProfile.currentStreak || 0,
        longest: userProfile.longestStreak || 0
      });
      setAchievements(userProfile.achievements || []);
    }
  }, [userProfile]);

  const saveBio = async () => {
    if (!user) return;
    
    const result = await UserService.updateUserProfile(user.uid, { bio });
    if (result.success) {
      setIsEditing(false);
    }
  };

  const avatarURL = userProfile?.avatarURL || user?.photoURL || "";
  const nickname = userProfile?.nickname || user?.displayName || "User";
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
              {nickname}
            </h2>
          </div>

          <div style={{ flex: 1, minWidth: "300px" }}>
            <h3 style={{ 
              color: "#ff3050",
              textShadow: "0 0 15px rgba(255, 48, 80, 0.8)",
              marginBottom: "1rem"
            }}>
              Bio
            </h3>
            {isEditing ? (
              <div>
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
                  Edit Bio
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
    </div>
  );
}
