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
    - **Shared Exercise Engine:** `src/logic/exerciseEngine.js` — centralized rep detection logic used by both Solo and Burnouts modes.
    - **Burnouts Mode (Merged):** Fully integrated into the Hub. Components in `src/components/Burnouts/` (BurnoutsSession, BurnoutsSelection, PoseVisualizer). Styles in `src/styles/Burnouts.css`.
    - **Solo Mode (Merged):** Fully integrated into the Hub. Components in `src/components/Solo/` (SoloSelection, SoloSession). Uses card deck system — users pick a muscle group, then work through a shuffled deck of playing cards with exercises and rep targets. Reuses `shuffleDeck` from `burnoutsHelpers.js`. Styles in `src/styles/Solo.css`.
    - **PoseVisualizer:** Shared camera component with optimized initialization — parallel script loading, concurrent camera permission request, and cached script loading across sessions.
    - **Playing Card UI:** Workout cards designed to look like authentic playing cards with corner values, center suit icons, and clear exercise names.
    - Raffle ticket reward system (1 ticket per 30 reps).
    - Enhanced camera permission handling with specific error messages for different failure types.
- **Monetization (Ads):**
    - Integrated a responsive `AdBanner` component at the root level (`App.jsx`).
    - Standard banner sizes documented for future expansion:
        - Desktop: 728x90 (Leaderboard), 300x250 (Medium Rectangle), 300x600 (Half-Page).
        - Mobile: 320x100 (Large Mobile Banner), 320x50 (Standard Mobile Leaderboard).
    - Recommended AdSense settings: "Responsive" mode for automatic optimization.
- **Raffle System:**
    - Interactive raffle room where users can view their entries and prizes.
    - Progress (position, score, items, tickets balance) tracked via Firestore.
    - Tickets earned immediately upon workout completion.
    - Weekly prize draws for high-performing Rivals.
- **Leaderboard:** Aggregates scores across all game modes, filterable by mode or combined totals.
- **User Profile & Avatar:**
    - Forced avatar and nickname creation for first-time users.
    - DiceBear avatar system (10 styles) with customization, randomizer, and custom seed.
    - Nickname generation with validation.
    - Profile page for bio editing, achievements, and streaks.

- **Stripe Subscription (Rivalis Pro):**
    - Two plans: Monthly ($9.99/month) and Annual ($79.99/year, ~33% savings).
    - Stripe Checkout for payment, Billing Portal for subscription management.
    - Subscription status synced to Firestore user profiles (`subscriptionStatus: 'active'|'inactive'`).
    - Webhook handler processes subscription events and updates Firestore.
    - Stripe data synced to PostgreSQL (`stripe` schema) via `stripe-replit-sync`.
    - Ad-free experience: `AdBanner` hidden when `userProfile.subscriptionStatus === 'active'`.
    - AI Personal Trainer: Pro subscribers get enhanced AI system prompt with custom meal plans, workout builder, goal tracking, advanced analytics, and injury prevention guidance. Quick-action buttons in chatbot for Pro users.
    - Free users still get basic AI coaching with a subtle upgrade prompt.
    - Subscription page at `/subscription` with monthly/annual toggle, feature list, and Stripe checkout redirect.

**System Design Choices:**
- **Authentication:** Firebase Authentication with `ProtectedRoute` component for route-level access control. New users are redirected through avatar creation flow.
- **State Management:** Assumed React's internal state management and context API for simplicity.
- **Data Persistence:** Firestore is the primary database for user profiles, chat messages, leaderboard scores, and game states. PostgreSQL used for Stripe subscription data sync.
- **Modularity:** Services (userService, chatService, leaderboardService, subscriptionService) abstract Firebase and Stripe interactions.
- **Routing:** Dedicated routes for login, dashboard, profile, avatar creation, subscription, and various game modes.
- **Backend:** Express.js server on port 3000 with Vite proxy (`/api` forwarded). Stripe webhook route registered before `express.json()` for raw body access. Firebase Admin SDK for server-side auth verification.

## External Dependencies
- **Firebase:** For Authentication and Firestore (database).
- **Stripe:** For subscription payment processing, checkout, and billing portal.
- **PostgreSQL (Neon):** For Stripe data sync via `stripe-replit-sync`.
- **OpenAI:** For AI Fitness Coach chatbot (via Replit AI integration).
- **Vite:** As the development server and build tool.
- **React Router:** For client-side routing.
- **Emoji Mart:** For emoji support in the chat system.
- **@mediapipe/pose, @mediapipe/camera_utils, @mediapipe/drawing_utils:** For camera-based pose detection and visualization in workout modes.
- **DiceBear API (v7.x):** For avatar generation and customization.

## Recent Changes
- **Feb 2026:** Merged Solo mode into the Hub, eliminating iframe/Vercel dependency. Created shared exercise engine (`src/logic/exerciseEngine.js`) used by both Solo and Burnouts. Optimized PoseVisualizer camera initialization with parallel script loading and concurrent camera permissions.
- **Feb 2026:** Merged Burnouts app directly into the Hub, eliminating iframe/external app dependency and resolving cross-origin authentication issues. Components live in `src/components/Burnouts/`.
- **Feb 2026:** Implemented Stripe subscription system (Rivalis Pro) with monthly/annual plans, ad-free experience, and AI Personal Trainer enhancements gated behind subscription.