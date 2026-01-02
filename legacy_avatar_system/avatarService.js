import { updateProfile } from "firebase/auth";

export const generateAvatarForUser = async (user, options = {}) => {
  const seed = user.uid;
  const { hair = "brown", eyes = "happy", clothes = "blue" } = options;

  const avatarURL = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&hairColor=${hair}&eyes=${eyes}&clothingColor=${clothes}`;

  await updateProfile(user, { photoURL: avatarURL });
  return avatarURL;
};
