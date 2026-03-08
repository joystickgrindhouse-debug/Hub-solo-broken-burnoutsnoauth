# Rivalis Hub – Global Features & System Architecture

This document defines the global systems and architecture of Rivalis Hub.

AI agents must read this before modifying any files.

This repository is NOT a starter template.
The core systems are already implemented.

AI tools must focus on **repairing UI/UX issues only** unless explicitly instructed otherwise.

---

# Application Overview

Rivalis Hub is a competitive fitness platform featuring real-time rep detection, live competitions, leaderboards, and AI coaching.

Core technologies:

Frontend
• React
• Vite

Backend
• Firebase Authentication
• Firestore Database

AI & Motion Tracking
• MediaPipe pose detection
• Custom rep validation engine

---

# Global Systems

These systems are already implemented and must remain intact.

## Firebase Authentication

User authentication and session management are handled by Firebase.

Do NOT:
• Replace authentication provider
• Modify login architecture
• Change user document schema

Relevant Files:
src/firebase.js
src/services/userService.js

---

## MediaPipe Rep Detection Engine

Exercise rep detection uses custom MediaPipe reference JSON files.

Do NOT:
• Modify pose detection math
• Change frame comparison logic
• Replace MediaPipe integration

Relevant Directories:
src/repDetection
src/mediapipe

---

## Leaderboards

Global leaderboard system stores scores in Firestore.

Do NOT modify:
• ranking logic
• leaderboard schema

Relevant Files:
src/services/leaderboardService.js

---

## AI Coach System

The AI coach is a floating assistant used for guidance and onboarding.

Correct Behavior:

• Floating circular button
• Bottom right corner of screen
• Icon: 💪

When clicked:

• Opens collapsible chat window
• Chat window appears above the button
• Chat window must never render as a horizontal bar

Relevant Files:
src/components/AICoach.jsx
src/components/ChatbotTour/

---

## Voice Control & Text To Speech

The application includes global voice interaction.

Activation Gesture:

User taps the **top LEFT corner of the screen 5 times quickly**.

Once activated:

• Voice recognition initializes
• Text-to-speech responses enabled
• Voice commands control navigation and AI coach

Voice Commands Examples:

start workout
open leaderboard
start solo mode
open profile

Implementation should use the Web Speech API.

Voice system must be global and not tied to a single page.

---

# Navigation Layout

Correct layout hierarchy:

Navbar
↓
Page Content
↓
Floating Systems

Floating systems include:

• AI coach widget
• voice indicators
• chat systems

Navbar must always remain at the top of the page.

Relevant File:
src/App.jsx

---

# Dashboard UI

The dashboard displays navigation tiles.

Tiles must appear in a centered grid layout.

Tiles must not render as plain text above the navbar.

Relevant File:
src/views/Dashboard.jsx

---

# Loading & Onboarding Experience

Loading screen must:

• display Rivalis branding
• use smooth fade animation
• transition smoothly to onboarding

Onboarding must transition smoothly into the login screen.

No abrupt screen switching.

Relevant Files:

src/components/LoadingScreen.jsx
src/components/OnboardingSlides.jsx
src/views/Login.jsx

---

# Navbar

Navbar must include:

• Rivalis logo
• navigation controls
• user avatar (top right)

Clicking avatar opens dropdown menu.

Dropdown menu must never be covered by ad banners.

Relevant File:
src/components/Navbar.jsx

---

# Advertisement System

Ad banners may appear on screen.

Rules:

• Ads must never cover navigation
• Ads must never cover dropdown menus
• Ads must remain behind navigation layers

Relevant File:
src/components/AdBanner.jsx

---

# Allowed Modifications

AI agents may modify:

• CSS
• component layout
• animation transitions
• z-index layering
• UI styling
• interaction handlers

---

# Forbidden Modifications

AI agents must NOT modify:

• Firebase authentication
• MediaPipe rep detection
• Firestore schemas
• backend services
• leaderboard logic

---

# Goal

Repair UI and interaction issues while preserving the Rivalis architecture.
