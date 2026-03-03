import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Login from "../views/Login";

export default function OnboardingSlides() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [showLogin, setShowLogin] = useState(false);

  const slides = [
    {
      title: "COMPETE & CONNECT",
      description:
        "Global leaderboards, achievements, and real-time chat."
    },
    {
      title: "LIVE COMPETITIONS",
      description:
        "Real-time multiplayer fitness battles."
    },
    {
      title: "PRECISION TRACKING",
      description:
        "AI Tracking (Cheat-Proof-System) ."
    }
  ];

  useEffect(() => {
    if (showLogin) return;

    const timer = setTimeout(() => {
      if (slideIndex < slides.length - 1) {
        setSlideIndex((prev) => prev + 1);
      } else {
        setShowLogin(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [slideIndex, showLogin]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4">

      <AnimatePresence mode="wait">

        {!showLogin ? (
          <motion.div
            key={slideIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-2xl bg-black/60 backdrop-blur-lg border border-red-500 rounded-2xl p-10 text-center shadow-2xl"
          >
            <h1 className="text-3xl font-bold mb-6 tracking-wide text-red-500">
              {slides[slideIndex].title}
            </h1>

            <p className="text-gray-300 text-lg">
              {slides[slideIndex].description}
            </p>

            <div className="flex justify-center mt-6 space-x-2">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-6 rounded-full ${
                    i === slideIndex
                      ? "bg-red-500"
                      : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md bg-black/70 backdrop-blur-lg border border-red-500 rounded-2xl p-8 shadow-2xl"
          >
            <Login />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
