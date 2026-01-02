import React, { useEffect, useState } from "react";
import { auth } from "../firebase";

const UserAvatar = () => {
  const [avatarURL, setAvatarURL] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    if (user.photoURL) {
      setAvatarURL(user.photoURL);
    }
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {avatarURL ? (
        <img
          src={avatarURL}
          alt="User Avatar"
          width={50}
          height={50}
          style={{ borderRadius: "50%" }}
        />
      ) : (
        <span>Loading avatar...</span>
      )}
    </div>
  );
};

export default UserAvatar;
