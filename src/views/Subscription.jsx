import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import {
  getUserSubscription,
  SUBSCRIPTION_TIERS
} from "../services/subscriptionService";

export default function Subscription() {
  const [tier, setTier] = useState(SUBSCRIPTION_TIERS.FREE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTier() {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      const result = await getUserSubscription(auth.currentUser.uid);
      setTier(result);
      setLoading(false);
    }

    loadTier();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-400">
        Loading subscription details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Rivalis Subscription
        </h1>

        {/* Current Tier */}
        <div className="bg-zinc-900 p-6 rounded-xl mb-8 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-2">
            Current Plan
          </h2>
          <p className="text-lg capitalize">
            {tier}
          </p>
        </div>

        {/* Feature Overview */}
        <div className="grid gap-6">

          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <h3 className="text-lg font-semibold mb-3">
              Free Tier Includes
            </h3>
            <ul className="space-y-2 text-gray-400">
              <li>• Solo workouts</li>
              <li>• Leaderboards</li>
              <li>• Basic achievements</li>
              <li>• Global chat</li>
            </ul>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <h3 className="text-lg font-semibold mb-3">
              Pro Tier Includes
            </h3>
            <ul className="space-y-2 text-gray-400">
              <li>• Live competitions</li>
              <li>• Advanced analytics</li>
              <li>• Exclusive achievements</li>
              <li>• Custom avatars</li>
              <li>• Priority matchmaking</li>
            </ul>
          </div>

        </div>

        {/* Upgrade Notice */}
        {tier === SUBSCRIPTION_TIERS.FREE && (
          <div className="mt-8 bg-red-900/20 border border-red-700 p-4 rounded-lg text-red-400">
            Upgrade functionality is currently disabled.
            <br />
            Future subscription upgrades will be available inside the Rivalis ecosystem.
          </div>
        )}

      </div>
    </div>
  );
}
