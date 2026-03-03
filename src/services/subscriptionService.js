// Stripe-free subscription service
// Production safe
// Firebase-based entitlement model

import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: "free",
  PRO: "pro",
  ADMIN: "admin"
};

/**
 * Fetch user subscription tier from Firestore
 * Expected user document structure:
 *
 * users/{uid} {
 *   subscriptionTier: "free" | "pro" | "admin"
 * }
 */
export async function getUserSubscription(uid) {
  if (!uid) return SUBSCRIPTION_TIERS.FREE;

  try {
    const snap = await getDoc(doc(db, "users", uid));

    if (!snap.exists()) return SUBSCRIPTION_TIERS.FREE;

    const data = snap.data();

    return data.subscriptionTier || SUBSCRIPTION_TIERS.FREE;
  } catch (error) {
    console.error("Subscription fetch failed:", error);
    return SUBSCRIPTION_TIERS.FREE;
  }
}

/**
 * Check if user has Pro access
 */
export async function hasProAccess(uid) {
  const tier = await getUserSubscription(uid);
  return tier === SUBSCRIPTION_TIERS.PRO || tier === SUBSCRIPTION_TIERS.ADMIN;
}

/**
 * Check if user is admin
 */
export async function isAdmin(uid) {
  const tier = await getUserSubscription(uid);
  return tier === SUBSCRIPTION_TIERS.ADMIN;
}
