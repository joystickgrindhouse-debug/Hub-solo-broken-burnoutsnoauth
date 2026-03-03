import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  getUserSubscription,
  SUBSCRIPTION_TIERS
} from "../services/subscriptionService";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [subscriptionTier, setSubscriptionTier] = useState("free");
  const [saving, setSaving] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    async function loadUser() {
      if (!user) {
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setDisplayName(data.displayName || "");
      }

      const tier = await getUserSubscription(user.uid);
      setSubscriptionTier(tier);

      setLoading(false);
    }

    loadUser();
  }, [user]);

  async function handleSave() {
    if (!user) return;

    setSaving(true);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName
      });
    } catch (error) {
      console.error("Save failed:", error);
    }

    setSaving(false);
  }

  async function handleLogout() {
    await signOut(auth);
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-400">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto space-y-8">

        <h1 className="text-3xl font-bold">
          Settings
        </h1>

        {/* Profile Section */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4">
            Profile
          </h2>

          <label className="block mb-2 text-sm text-gray-400">
            Display Name
          </label>

          <input
            className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:outline-none"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-semibold"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Subscription Section */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4">
            Subscription
          </h2>

          <p className="text-gray-400">
            Current Plan:{" "}
            <span className="capitalize font-semibold text-white">
              {subscriptionTier}
            </span>
          </p>

          <div className="mt-4 text-sm text-gray-500">
            Billing and upgrades are currently disabled.
            Future subscription features will be managed inside Rivalis.
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4">
            Account
          </h2>

          <button
            onClick={handleLogout}
            className="bg-zinc-800 hover:bg-zinc-700 px-5 py-2 rounded-lg"
          >
            Log Out
          </button>
        </div>

      </div>
    </div>
  );
}
