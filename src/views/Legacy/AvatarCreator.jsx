import React from "react";
import UserAvatarCustomizer from "../components/UserAvatarCustomizer";

export default function AvatarCreator({ user, isFirstTimeSetup = false, onSetupComplete, userProfile }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          {isFirstTimeSetup ? "Welcome! Create Your Profile" : "Edit Your Avatar"}
        </h1>
        <p style={styles.subtitle}>
          {isFirstTimeSetup 
            ? "Choose a nickname and customize your avatar to get started" 
            : "Update your avatar style and appearance"}
        </p>
      </div>
      <UserAvatarCustomizer 
        user={user} 
        isFirstTimeSetup={isFirstTimeSetup} 
        onSetupComplete={onSetupComplete}
        userProfile={userProfile}
      />
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)",
    padding: "20px 10px",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
    padding: "0 10px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#ff3050",
    textShadow: `
      0 0 10px rgba(255, 48, 80, 0.8),
      0 0 20px rgba(255, 48, 80, 0.6),
      0 0 30px rgba(255, 48, 80, 0.4)
    `,
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "16px",
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "400",
  },
};
