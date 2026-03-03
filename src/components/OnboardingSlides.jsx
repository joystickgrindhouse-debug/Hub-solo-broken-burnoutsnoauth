import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Login from "../views/Login";

export default function OnboardingSlides() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [showLogin, setShowLogin] = useState(false);

  const slides = [
    {
      title: "Welcome to Rivalis",
      description: "Compete. Train. Dominate."
    },
    {
      title: "Real-Time Competitive Fitness",
      description: "Live multiplayer workout battles."
    },
    {
      title: "Take On The Rivalis Challenge",
      description: "Get-Hooked Out-Train Out-Last Out-Rival"
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
    }, 2500); // 2.5 seconds per slide

    return () => clearTimeout(timer);
  }, [slideIndex, showLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-white">

      <AnimatePresence mode="wait">

        {!showLogin ? (
          <motion.div
            key={slideIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl text-center space-y-6"
          >
            <h1 className="text-4xl font-bold tracking-wide">
              {slides[slideIndex].title}
            </h1>

            <p className="text-gray-400 text-lg">
              {slides[slideIndex].description}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <Login />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
