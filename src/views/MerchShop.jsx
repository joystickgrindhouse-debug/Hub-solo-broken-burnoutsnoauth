import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SHOP_URL = "https://rivalis.printful.me";

export default function MerchShop() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [blocked, setBlocked] = useState(false);

  // If the iframe doesn't load quickly, assume embedding is blocked.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!loaded) setBlocked(true);
    }, 4500);
    return () => clearTimeout(t);
  }, [loaded]);

  const openShop = () => {
    window.location.href = SHOP_URL;
  };

  return (
    <div className="px-3 sm:px-4 py-6 pb-[calc(18px+env(safe-area-inset-bottom))]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-extrabold tracking-wide">
              Rivalis Merch Shop
            </div>
            <div className="text-white/70 text-sm sm:text-base">
              Official merch store — real purchases (Printful).
            </div>
          </div>

          <div className="flex items-center gap-2 flex-none">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-3 py-2 rounded-xl border border-white/10 text-white/80 hover:text-white hover:border-white/20 transition"
            >
              Back
            </button>
            <button
              onClick={openShop}
              className="px-3 py-2 rounded-xl border border-red-500/30 bg-black/40 text-red-100 hover:border-red-400/60 hover:shadow-[0_0_28px_rgba(255,0,60,0.22)] transition"
            >
              Open Shop
            </button>
          </div>
        </div>

        {/* Container */}
        <div className="relative rounded-2xl overflow-hidden border border-red-500/20 bg-black/30">
          {/* Loading state */}
          {!loaded && !blocked && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="rounded-2xl border border-white/10 bg-black/70 backdrop-blur-md px-4 py-3">
                <div className="text-sm font-semibold">Loading shop…</div>
                <div className="text-[12px] text-white/60 mt-1">
                  If it stays blank, Printful is blocking iframe embeds.
                </div>
              </div>
            </div>
          )}

          {/* Blocked fallback */}
          {blocked && !loaded && (
            <div className="p-6">
              <div className="text-lg font-bold">Can’t embed this shop</div>
              <div className="text-white/70 text-sm mt-2">
                Printful Quick Stores may block being shown inside an iframe for security (X-Frame-Options/CSP).
                Use the button below to open the store normally.
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={openShop}
                  className="px-4 py-2 rounded-xl border border-red-500/30 bg-black/40 text-red-100 hover:border-red-400/60 hover:shadow-[0_0_28px_rgba(255,0,60,0.22)] transition"
                >
                  Open Rivalis Shop
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-4 py-2 rounded-xl border border-white/10 text-white/80 hover:text-white hover:border-white/20 transition"
                >
                  Back to Dashboard
                </button>
              </div>

              <div className="mt-4 text-[12px] text-white/55">
                If you want a fully in-app embedded checkout, you’ll need a storefront that explicitly supports embedding.
              </div>
            </div>
          )}

          {/* Iframe attempt */}
          <iframe
            title="Rivalis Printful Shop"
            src={SHOP_URL}
            className="w-full"
            style={{ height: "calc(100vh - 210px)" }}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            // If the page is allowed to render, this will fire.
            onLoad={() => setLoaded(true)}
          />
        </div>
      </div>
    </div>
  );
}
