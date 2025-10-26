import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { generateAvatarForUser } from "../avatarService";

const UserAvatar = () => {
  const [avatarURL, setAvatarURL] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    if (user.photoURL) {
      setAvatarURL(user.photoURL);
    } else {
      generateAvatarForUser(user)
        .then((url) => setAvatarURL(url))
        .catch(console.error);
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
