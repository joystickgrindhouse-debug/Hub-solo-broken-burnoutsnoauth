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
    - **Solo Mode (Merged):** Fully integrated into the Hub. Component in `src/components/Solo/SoloSession.jsx`. Uses card deck system with all 16 exercises distributed across 52 cards (no muscle group selection). Uses `shuffleSoloDeck` from `burnoutsHelpers.js`. Styles in `src/styles/Solo.css`.
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
- **Feb 2026:** Built complete Live Mode (`/live` route). Consolidated into single `src/views/Live.jsx` with full 4-phase game flow (select → lobby → match → results). Features: 4 showdown categories (Arms, Legs, Core, Full Body) using approved bodyweight exercises, 5 game modes (Classic, Chaos, Speed Demon, Endurance, Pure Grind), 6 Joker cards (Double Down, Point Thief, Rep Shield, Freeze Tag, Jackpot, Uno Reverse), 8 Trick cards (Speed Demon, Mystery Move, Double or Nothing, Mirror Match, Hot Potato, Combo Breaker, Rival Challenge, Breather). Deck generator in `src/logic/liveDeck.js`. Real-time multiplayer via Firestore with `src/services/liveService.js`. Room creation/joining, ready system, lobby chat, live scoreboard, ticket earning, effect banners, and results screen with rankings.
- **Feb 2026:** AI cost optimization: Free users use `gpt-5-nano` (10 msg/day, 1024 token cap, last 6 messages context). Pro users get `gpt-5` unlimited. Free training plan generation uses static template (zero AI cost). Enhanced Pro upsell messaging across Profile and Fitness Dashboard.
- **Feb 2026:** Daily wellness check-in system in ChatbotTour. On open, chatbot greets user by nickname and prompts for mood (5 options) and physical feeling (6 options). Check-ins logged to Firestore `users/{uid}/checkInLogs` subcollection with dedup via both localStorage and Firestore query. `/trends` command renders real data-driven mood and physical bar graphs via updated LogsGraph component. `/checkin` command allows manual re-check-in. Check-in gated behind tour completion.
- **Feb 2026:** AI Training Plan generation: Expanded "Seeking in Rivalis" dropdown to 14 options. Added `/api/generate-plan` endpoint (auth-protected, server-side Pro verification) that generates personalized AI training plans via OpenAI. Free users see a short preview with upgrade CTA; Pro users get full detailed plans with weekly splits, nutrition, recovery, and milestones. Plan preview section renders on Profile after goals are saved.
- **Feb 2026:** Added login streak tracking system. `updateLoginStreak()` in userService tracks consecutive daily logins via `loginStreak`, `longestLoginStreak`, `lastLoginDate` fields in Firestore. Called on auth state change in App.jsx. Profile displays login streak and best streak. "Streak Keeper" achievement uses login streak.
- **Feb 2026:** Profile biometric privacy: height, weight, BMI, gender, fitness level, workout frequency, and injuries are hidden from profile view mode. Only age is displayed publicly. All biometric data remains editable and saved to Firestore.
- **Feb 2026:** Fixed login persistence to always use `browserLocalPersistence` — users stay logged in until they explicitly sign out. Removed Remember Me toggle from Login page.
- **Feb 2026:** Redesigned Merch Shop: replaced broken iframe with product card grid using real Printful product photos (tee, hoodie, bottle). Each card opens Printful shop in new tab. Theme-aware styling. Images in `public/merch/`.
- **Feb 2026:** Removed white-theme image filter that turned dashboard tile PNGs into white boxes. Images now display normally in both themes.
- **Feb 2026:** Implemented fully functional theme toggle system. Created `src/context/ThemeContext.jsx` with ThemeProvider and useTheme hook. Two themes: red-black (original) and white-black (all accents white). Updated `assets/styles/main.css` to use CSS custom properties throughout. Updated all 25+ components to use theme-aware colors via useTheme hook or CSS variables. Theme persists via localStorage.
- **Feb 2026:** Added Fitness Dashboard (`/fitness` route, `src/views/FitnessDashboard.jsx`) with BMI gauge, biometric stats, objectives display, and Pro-locked AI Training Plan section. Enhanced chatbot tour intake to collect height (ft/in), weight (lbs), fitness level, workout frequency, injuries, and auto-calculate BMI. Updated Profile Identity Details to display and edit all biometric fields with live BMI recalculation on save.
- **Feb 2026:** Merged Solo mode into the Hub, eliminating iframe/Vercel dependency. Created shared exercise engine (`src/logic/exerciseEngine.js`) used by both Solo and Burnouts. Optimized PoseVisualizer camera initialization with parallel script loading and concurrent camera permissions.
- **Feb 2026:** Merged Burnouts app directly into the Hub, eliminating iframe/external app dependency and resolving cross-origin authentication issues. Components live in `src/components/Burnouts/`.
- **Feb 2026:** Implemented Stripe subscription system (Rivalis Pro) with monthly/annual plans, ad-free experience, and AI Personal Trainer enhancements gated behind subscription.