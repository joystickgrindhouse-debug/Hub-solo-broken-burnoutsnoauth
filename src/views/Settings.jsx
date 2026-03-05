import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  getUserSubscription,
  SUBSCRIPTION_TIERS
} from "../services/subscriptionService";

// ✅ FIX: Added inline style fallbacks on all elements.
// Pure Tailwind classes render as unstyled if Tailwind CSS is not compiled/loaded.

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
      await updateDoc(doc(db, "users", user.uid), { displayName });
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
      <div
        className="p-6 text-center text-gray-400"
        style={{ padding: "24px", textAlign: "center", color: "#9ca3af" }}
      >
        Loading settings...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black text-white p-6"
      style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: "24px" }}
    >
      <div
        className="max-w-3xl mx-auto space-y-8"
        style={{ maxWidth: "768px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}
      >
        <h1
          className="text-3xl font-bold"
          style={{ fontSize: "30px", fontWeight: "bold" }}
        >
          Settings
        </h1>

        {/* Profile Section */}
        <div
          className="bg-zinc-900 p-6 rounded-xl border border-zinc-800"
          style={{ background: "#18181b", padding: "24px", borderRadius: "12px", border: "1px solid #27272a" }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px" }}
          >
            Profile
          </h2>

          <label
            className="block mb-2 text-sm text-gray-400"
            style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#9ca3af" }}
          >
            Display Name
          </label>

          <input
            className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:outline-none"
            style={{
              width: "100%",
              padding: "12px",
              background: "#000",
              border: "1px solid #3f3f46",
              borderRadius: "8px",
              color: "#fff",
              outline: "none",
              boxSizing: "border-box",
            }}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-semibold"
            style={{
              marginTop: "16px",
              background: saving ? "#7f1d1d" : "#dc2626",
              color: "#fff",
              padding: "8px 20px",
              borderRadius: "8px",
              fontWeight: "600",
              border: "none",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Subscription Section */}
        <div
          className="bg-zinc-900 p-6 rounded-xl border border-zinc-800"
          style={{ background: "#18181b", padding: "24px", borderRadius: "12px", border: "1px solid #27272a" }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px" }}
          >
            Subscription
          </h2>

          <p
            className="text-gray-400"
            style={{ color: "#9ca3af" }}
          >
            Current Plan:{" "}
            <span
              className="capitalize font-semibold text-white"
              style={{ textTransform: "capitalize", fontWeight: "600", color: "#fff" }}
            >
              {subscriptionTier}
            </span>
          </p>

          <div
            className="mt-4 text-sm text-gray-500"
            style={{ marginTop: "16px", fontSize: "14px", color: "#6b7280" }}
          >
            Billing and upgrades are currently disabled.
            Future subscription features will be managed inside Rivalis.
          </div>
        </div>

        {/* Account Section */}
        <div
          className="bg-zinc-900 p-6 rounded-xl border border-zinc-800"
          style={{ background: "#18181b", padding: "24px", borderRadius: "12px", border: "1px solid #27272a" }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px" }}
          >
            Account
          </h2>

          <button
            onClick={handleLogout}
            className="bg-zinc-800 hover:bg-zinc-700 px-5 py-2 rounded-lg"
            style={{
              background: "#27272a",
              color: "#fff",
              padding: "8px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Log Out
          </button>
        </div>

      </div>
    </div>
  );
}
