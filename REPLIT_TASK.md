# REPLIT TASK – RIVALIS HUB UI FIXES

This repository already has a working architecture.

DO NOT rebuild or restructure the application.

Your job is to repair UI, routing, and interaction issues only.

Core architecture must remain intact.

---

# CRITICAL RULES

Do NOT modify:

• Firebase authentication
• MediaPipe rep detection engine
• leaderboard logic
• backend services
• database schemas

Allowed modifications:

• CSS
• component layout
• animation transitions
• React Router layout
• UI interactions

---

# ISSUES TO FIX

## 1. Dashboard Tiles Rendering Incorrectly

Problem:
Dashboard tiles are appearing as text above the navbar.

Expected behavior:

• Tiles render in a centered dashboard grid
• Tiles are clickable navigation cards
• Tiles navigate using React Router
• Tiles must NEVER render above the navbar

Relevant file:
src/views/Dashboard.jsx

---

## 2. Routing Layout Broken

Problem:
Page content is rendering above the navbar.

Correct layout must always be:

Navbar
↓
Page Content

Navbar must remain fixed at the top of the application.

Relevant file:
src/App.jsx

---

## 3. AI Coach Widget

Problem:
AI coach is rendering as a horizontal bar.

Correct behavior:

• Floating circular button
• bottom right corner of screen
• icon = flexed bicep 💪

When clicked:

• opens floating chat window
• chat window appears above button
• chat window must be collapsible
• chat window must never appear as a horizontal bar

Relevant files:

src/components/AICoach.jsx
src/components/ChatbotTour/

---

## 4. Loading Screen

Problem:
Loading screen is visually rough and transitions abruptly.

Expected behavior:

• smooth fade animation
• Rivalis branding visible
• seamless transition to onboarding

Relevant file:

src/components/LoadingScreen.jsx

---

## 5. Onboarding → Login Transition

Problem:
Transition from onboarding slides to login screen is abrupt.

Expected behavior:

• smooth fade or slide animation
• no hard page switching
• visually polished transition

Relevant files:

src/components/OnboardingSlides.jsx
src/views/Login.jsx

---

## 6. Voice Control + Text To Speech

The app must support voice interaction.

Hidden activation gesture:

User taps the **top LEFT corner of the screen 5 times quickly**.

Once activated:

• voice recognition initializes
• text-to-speech becomes active
• voice commands can control navigation

Example commands:

start workout
open leaderboard
start solo mode
open profile

Implementation should use:

Web Speech API

Voice system must be global and not tied to a single page.

---

## 7. Avatar Missing From Navbar

Problem:
User avatar is missing from the navigation bar.

Expected behavior:

• avatar visible in top right corner
• clicking avatar opens dropdown menu

Relevant file:

src/components/Navbar.jsx

---

## 8. Dropdown Menu Covered By Ads

Problem:
Ad banners overlap the navbar dropdown menu.

Expected behavior:

• dropdown menu must appear above ads
• correct z-index layering
• ads must never block navigation

Relevant files:

src/components/Navbar.jsx
src/components/AdBanner.jsx

---

# GOAL

Restore Rivalis Hub UI functionality and improve user experience without modifying the core architecture.
