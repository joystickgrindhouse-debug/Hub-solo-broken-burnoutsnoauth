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
    background: "linear-gradient(135deg, #1e1e2e 0%, #2d1b3d 100%)",
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
    background: "linear-gradient(135deg, #667eea 0%, #ff4081 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "16px",
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "400",
  },
};
