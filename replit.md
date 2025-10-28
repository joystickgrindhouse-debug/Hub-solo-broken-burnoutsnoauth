# Rivalis Hub

## Overview
Rivalis Hub is a mobile-friendly, React-based fitness and gaming dashboard. Its purpose is to gamify fitness through features like Firebase authentication, user profiles with nicknames and avatar creation, achievements tracking, real-time global and direct message chat with Firestore persistence, and a comprehensive leaderboard that integrates all game modes, including camera-based workout modes (Solo, Burnouts) and an interactive Gameboard. The project aims to provide an engaging and social fitness experience, combining exercise with gaming elements and community interaction.

## User Preferences
I prefer simple, clear explanations and want the agent to adopt an iterative development approach. Before making any major architectural changes or implementing significant new features, please ask for confirmation. Do not make changes to the `assets/` folder.

## System Architecture

**UI/UX Decisions:**
- Mobile-friendly, responsive design.
- Red/black gaming theme with neon effects, utilizing the "Press Start 2P" font for a retro aesthetic.
- Interactive event modals with themed buttons and animations.
- Clean and modern UI for avatar creation with gradients and smooth animations.
- Initial loading screen features "RIVALIS FITNESS REIMAGINED" with neon glow and crossing screen animation.
- Onboarding system with 3-slide feature highlights after login/signup.

**Technical Implementations:**
- **Frontend:** React 18 with Vite 4, React Router v6.
- **Backend/Database:** Firebase (Authentication, Firestore).
- **Chat System:** Real-time global and direct messaging with Firestore persistence (last 50 messages). Displays user avatars and nicknames.
- **Workout Modes (Solo & Burnouts):**
    - Camera-based workout modes using MediaPipe Pose detection for automatic rep counting.
    - 16 exercises across 4 categories (Arms, Legs, Core, Cardio).
    - **Burnouts Mode:** Selection screen for workout type (Arms, Legs, Core, Full Body) with proper game logic filtering exercises by selected category.
    - **Playing Card UI:** Workout cards designed to look like authentic playing cards with corner values, center suit icons, and clear exercise names.
    - **Avatar Background System:** User's avatar displays as a blurred background (40% opacity) with green pose skeleton overlay on transparent canvas, providing visual feedback without showing actual camera feed.
    - Dice reward system (1 dice per 30 reps).
    - Wake lock support to prevent screen sleep.
    - Enhanced camera permission handling with specific error messages for different failure types.
- **Gameboard Mode:**
    - Interactive 40-space board game where users spend earned dice to roll and move.
    - 6 unique space types (Challenge, Reward, Mystery, Boost, Plot Twist, Safe) with diverse events.
    - Choice mechanics (Risk vs. Safe paths) and battle system (roll dice to defeat rivals).
    - Special items (bonus dice, shields, free rolls, double points).
    - Game progress (position, score, items, dice balance) tracked via Firestore.
    - Dice balance saved immediately upon spending to prevent exploits.
- **Leaderboard:** Aggregates scores across all game modes, filterable by mode or combined totals.
- **User Profile & Avatar:**
    - Forced avatar and nickname creation for first-time users.
    - DiceBear avatar system (10 styles) with customization, randomizer, and custom seed.
    - Nickname generation with validation.
    - Profile page for bio editing, achievements, and streaks.

**System Design Choices:**
- **Authentication:** Firebase Authentication with `ProtectedRoute` component for route-level access control. New users are redirected through avatar creation flow.
- **State Management:** Assumed React's internal state management and context API for simplicity.
- **Data Persistence:** Firestore is the primary database for user profiles, chat messages, leaderboard scores, and game states.
- **Modularity:** Services (userService, chatService, leaderboardService) abstract Firebase interactions.
- **Routing:** Dedicated routes for login, dashboard, profile, avatar creation, and various game modes.

## External Dependencies
- **Firebase:** For Authentication and Firestore (database).
- **Vite:** As the development server and build tool.
- **React Router:** For client-side routing.
- **Emoji Mart:** For emoji support in the chat system.
- **@mediapipe/pose, @mediapipe/camera_utils, @mediapipe/drawing_utils:** For camera-based pose detection and visualization in workout modes.
- **DiceBear API (v7.x):** For avatar generation and customization.