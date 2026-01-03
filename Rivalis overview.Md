# Rivalis Overview

## App Purpose
Rivalis is a high-octane, mobile-first fitness ecosystem designed to turn physical training into a competitive gaming experience. It leverages real-time pose tracking and a "neon-circuit" aesthetic to motivate users through gamification, social interaction, and high-stakes performance tracking.

## App Structure
The project is architected as a React-based hub ("Rivalis Hub") that serves as the central gateway to various specialized fitness modes:

- **Rivalis Hub (Core)**: Central dashboard for navigation, global social features (Global Chat, DMs), and profile management (Achievements, Leaderboards).
- **Burnouts Mode**: A card-based high-intensity interval training (HIIT) mode using 52-card decks with randomized exercises.
- **Solo Mode**: A dedicated single-player fitness experience with structured progression.
- **Run Mode**: GPS and motion-based tracking for outdoor or treadmill cardio.
- **Live Mode**: Real-time interactive sessions.
- **Gameboard**: A gamified progression system where fitness metrics translate to board game movement.

## Game Logic
The core "loop" of Rivalis converts physical effort into digital currency and status:

1. **Exercise Conversion**: In modes like Burnouts, every 30 repetitions completed in a session earns the user **1 Dice**.
2. **Multipliers**: Completing a full "deck" or session unlocks **Replay Mode**, offering a 2x rewards multiplier for subsequent efforts.
3. **Real-Time Verification**: Uses MediaPipe for 33-point body landmark detection, ensuring "Reps" are only counted when full range of motion is achieved.
4. **Gameboard Integration**: Dice earned during workouts are used in the Gameboard mode to progress through a neon-landscape, unlocking further rewards.

## Competitiveness
Competitiveness is baked into every layer of the experience to drive retention:

- **Aggregated Leaderboards**: A unified ranking system that tracks performance across all modes (Solo, Burnouts, Live, Run, and Gameboard). Users are ranked by total reps, miles, and overall "Dice" wealth.
- **Streak System**: Tracks consecutive days of activity. Maintaining a 7-day streak is a major milestone and a core component of the "Streak Keeper" achievement.
- **Achievement System**: A tiered milestone system including:
    - *First Steps*: Complete first workout.
    - *Century Club*: 100 total reps.
    - *Rep Master*: 500 total reps.
    - *Elite Athlete*: 1,000 total reps.
    - *Road Warrior*: 50 total miles run.
- **Social Pressure**: Integrated Global Chat and Direct Messaging allow for "trash talk," challenge invitations, and community motivation.
- **Visual Status**: Custom avatars (via Dicebear) and unlocked badges display a user's dedication and rank to the rest of the community.

## Ad-Economy & Monetization
Rivalis implements a dual-tier monetization strategy designed for high retention:

### Free Tier (Ad-Supported)
Free users can "earn" their way into the high-stakes economy by engaging with rewarded ads. This allows them to unlock raffle tickets, double their earnings, or skip cooldowns without financial cost, generating roughly $6/mo in ad revenue per user.

### Premium Tier (Subscription)
For $14.99/mo (Founding price: $9.99), users unlock the full Rivalis experience:
- **Zero Ads**: Seamless, uninterrupted training and navigation.
- **Unlimited Earning**: No caps on raffle ticket generation.
- **Exclusive Access**: Priority entry into the biggest raffles and exclusive ticket mini-games.
- **Multipliers**: Passive boosts to all ticket and reward earnings.