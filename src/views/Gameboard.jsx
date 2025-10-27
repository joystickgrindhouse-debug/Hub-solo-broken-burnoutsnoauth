import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Gameboard({ user, userProfile }) {
  const [availableDice, setAvailableDice] = useState(0);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [currentRoll, setCurrentRoll] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [gameMessage, setGameMessage] = useState("Welcome to the Gameboard!");
  const [loading, setLoading] = useState(true);
  const [totalScore, setTotalScore] = useState(0);
  const [specialItems, setSpecialItems] = useState([]);
  const [showEvent, setShowEvent] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  const BOARD_SPACES = 40; // Total spaces on the board

  // Board space types with engaging events
  const spaceTypes = [
    { type: 'start', color: '#00ff00', glow: '#00ff00' },
    { type: 'challenge', color: '#ff3050', glow: '#ff3050' },
    { type: 'reward', color: '#ffd700', glow: '#ffd700' },
    { type: 'mystery', color: '#9d00ff', glow: '#9d00ff' },
    { type: 'boost', color: '#00d4ff', glow: '#00d4ff' },
    { type: 'plot', color: '#ff6600', glow: '#ff6600' },
    { type: 'safe', color: '#ffffff', glow: '#ffffff' }
  ];

  const events = {
    challenge: [
      { title: "PUSH-UP CHALLENGE", message: "The board demands 10 push-ups! Complete them to earn +5 bonus points!", points: 5 },
      { title: "PLANK CHALLENGE", message: "Hold a 30-second plank! Earn +3 bonus points for your dedication!", points: 3 },
      { title: "FITNESS QUIZ", message: "Answer correctly: What muscle do squats target? (Glutes!) +2 points!", points: 2 },
      { title: "BURPEE BLAST", message: "5 burpees, right now! Earn +4 bonus points!", points: 4 }
    ],
    reward: [
      { title: "JACKPOT!", message: "You found a treasure chest! +10 points!", points: 10 },
      { title: "BONUS DICE", message: "You earned a free dice roll! Keep it for later.", item: 'bonus_dice' },
      { title: "DOUBLE POINTS", message: "Your next roll counts double! Save it wisely.", item: 'double_points' },
      { title: "LUCKY FIND", message: "You discovered hidden coins! +7 points!", points: 7 }
    ],
    mystery: [
      { title: "WARP ZONE!", message: "You've been teleported forward 5 spaces!", warp: 5 },
      { title: "TIME PARADOX", message: "Reality shifts... you move back 3 spaces.", warp: -3 },
      { title: "MIRROR DIMENSION", message: "Everything reverses! Swap positions with your past self.", special: 'mirror' },
      { title: "POWER SURGE", message: "Energy overload! Roll again immediately!", item: 'free_roll' }
    ],
    boost: [
      { title: "ENERGY BOOST", message: "You feel pumped! +5 points and roll again!", points: 5, item: 'free_roll' },
      { title: "MOMENTUM", message: "You're on fire! Move forward 3 extra spaces!", warp: 3 },
      { title: "SHIELD UP", message: "Protected! Negative events won't affect you next turn.", item: 'shield' },
      { title: "COMBO BREAKER", message: "Chain bonus! +8 points!", points: 8 }
    ],
    plot: [
      { title: "THE TWIST!", message: "A rival appears! Battle by rolling higher than 4 to win +10 points!", special: 'battle', points: 10 },
      { title: "FORK IN THE ROAD", message: "Choose your path: Risk (move +6) or Safe (move +2)?", special: 'choice' },
      { title: "BOSS BATTLE", message: "Face the fitness boss! Complete 15 reps to earn +15 points!", points: 15 },
      { title: "ALLIANCE", message: "Team up with past champions! +6 points and protection.", points: 6, item: 'shield' }
    ]
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadGameData();
  }, [user]);

  const loadGameData = async () => {
    try {
      // Calculate available dice from total reps across all modes
      const leaderboardRef = collection(db, "leaderboard");
      const userScores = query(leaderboardRef, where("userId", "==", user.uid));
      const snapshot = await getDocs(userScores);
      
      let totalReps = 0;
      snapshot.forEach(doc => {
        totalReps += doc.data().score || 0;
      });

      const totalDice = Math.floor(totalReps / 30);

      // Load saved game progress
      const gameDocRef = doc(db, "gameboards", user.uid);
      const gameDoc = await getDoc(gameDocRef);
      
      if (gameDoc.exists()) {
        const data = gameDoc.data();
        setPlayerPosition(data.position || 0);
        setTotalScore(data.score || 0);
        setSpecialItems(data.items || []);
        // Use saved dice balance, or initialize if not present
        setAvailableDice(data.diceBalance !== undefined ? data.diceBalance : totalDice);
      } else {
        // First time playing - initialize with earned dice
        setAvailableDice(totalDice);
        await setDoc(gameDocRef, {
          userId: user.uid,
          position: 0,
          score: 0,
          items: [],
          diceBalance: totalDice,
          lastPlayed: new Date()
        });
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading game data:", error);
      setLoading(false);
    }
  };

  const saveGameProgress = async (position, score, items, diceBalance) => {
    if (!user) return;
    
    try {
      const gameDocRef = doc(db, "gameboards", user.uid);
      await setDoc(gameDocRef, {
        userId: user.uid,
        position,
        score,
        items,
        diceBalance,
        lastPlayed: new Date()
      }, { merge: true });
    } catch (error) {
      console.error("Error saving game:", error);
    }
  };

  const rollDice = async () => {
    if (availableDice <= 0) {
      setGameMessage("No dice available! Earn more by completing workouts in Solo or Burnouts mode.");
      return;
    }

    if (isRolling) return;

    setIsRolling(true);
    setCurrentRoll(null);
    setGameMessage("Rolling...");

    // Decrement dice immediately and save to Firestore
    const newDiceBalance = availableDice - 1;
    setAvailableDice(newDiceBalance);
    
    // Save dice balance immediately to prevent refresh exploit
    await saveGameProgress(playerPosition, totalScore, specialItems, newDiceBalance);

    // Animate dice roll
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setCurrentRoll(Math.floor(Math.random() * 6) + 1);
      rollCount++;

      if (rollCount > 10) {
        clearInterval(rollInterval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setCurrentRoll(finalRoll);
        handleRollResult(finalRoll, newDiceBalance);
      }
    }, 100);
  };

  const handleRollResult = (roll, diceBalance) => {
    const newPosition = (playerPosition + roll) % BOARD_SPACES;
    setPlayerPosition(newPosition);

    setTimeout(() => {
      const space = getSpaceType(newPosition);
      triggerSpaceEvent(space, newPosition, diceBalance);
      setIsRolling(false);
    }, 500);
  };

  const getSpaceType = (position) => {
    if (position === 0) return 'start';
    if (position % 10 === 0) return 'plot';
    if (position % 7 === 0) return 'mystery';
    if (position % 5 === 0) return 'boost';
    if (position % 3 === 0) return 'reward';
    if (position % 2 === 0) return 'challenge';
    return 'safe';
  };

  const triggerSpaceEvent = (spaceType, position, diceBalance) => {
    if (spaceType === 'safe' || spaceType === 'start') {
      setGameMessage(`Safe space! You're at position ${position}.`);
      saveGameProgress(position, totalScore, specialItems, diceBalance);
      return;
    }

    const eventList = events[spaceType];
    const event = eventList[Math.floor(Math.random() * eventList.length)];
    
    setCurrentEvent({ ...event, spaceType, position, diceBalance });
    setShowEvent(true);
  };

  const handleEventAction = (action) => {
    if (!currentEvent) return;

    let newScore = totalScore;
    let newItems = [...specialItems];
    let finalPosition = currentEvent.position;
    let message = currentEvent.message;

    // Handle choice events with actual branching
    if (currentEvent.special === 'choice') {
      if (action === 'risk') {
        finalPosition = (currentEvent.position + 6) % BOARD_SPACES;
        message = "You chose RISK! Moving +6 spaces forward!";
      } else if (action === 'safe') {
        finalPosition = (currentEvent.position + 2) % BOARD_SPACES;
        message = "You chose SAFE! Moving +2 spaces forward.";
      }
      setPlayerPosition(finalPosition);
    } else {
      // Apply normal event effects
      if (currentEvent.points) {
        newScore += currentEvent.points;
        message += ` Score: +${currentEvent.points}!`;
      }

      if (currentEvent.item) {
        newItems.push(currentEvent.item);
        message += ` Item acquired: ${currentEvent.item.replace('_', ' ')}!`;
      }

      if (currentEvent.warp) {
        finalPosition = Math.max(0, (currentEvent.position + currentEvent.warp) % BOARD_SPACES);
        setPlayerPosition(finalPosition);
        message += ` New position: ${finalPosition}`;
      }

      if (currentEvent.special === 'battle') {
        const battleRoll = Math.floor(Math.random() * 6) + 1;
        if (battleRoll > 4) {
          newScore += currentEvent.points;
          message = `Battle won! You rolled ${battleRoll}. +${currentEvent.points} points!`;
        } else {
          message = `Battle lost. You rolled ${battleRoll}. Try again!`;
        }
      }
    }

    setTotalScore(newScore);
    setSpecialItems(newItems);
    setGameMessage(message);
    setShowEvent(false);
    
    const eventToSave = currentEvent;
    setCurrentEvent(null);

    // Save with correct final position
    saveGameProgress(finalPosition, newScore, newItems, eventToSave.diceBalance);
  };

  const getSpaceColor = (position) => {
    const type = getSpaceType(position);
    const spaceTypeObj = spaceTypes.find(s => s.type === type);
    return spaceTypeObj || spaceTypes[0];
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>LOADING GAMEBOARD...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>GAMEBOARD</h1>
        <div style={styles.subtitle}>ROLL • ADVENTURE • CONQUER</div>
      </div>

      {/* Stats Panel */}
      <div style={styles.statsPanel}>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>DICE</div>
          <div style={styles.statValue}>🎲 {availableDice}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>POSITION</div>
          <div style={styles.statValue}>📍 {playerPosition}/{BOARD_SPACES}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>SCORE</div>
          <div style={styles.statValue}>⭐ {totalScore}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>ITEMS</div>
          <div style={styles.statValue}>🎁 {specialItems.length}</div>
        </div>
      </div>

      {/* Game Message */}
      <div style={styles.messageBox}>
        <div style={styles.messageText}>{gameMessage}</div>
      </div>

      {/* Dice Display */}
      <div style={styles.diceContainer}>
        <div style={{...styles.dice, ...(isRolling ? styles.diceRolling : {})}}>
          <div style={styles.diceValue}>{currentRoll || '?'}</div>
        </div>
        <button 
          onClick={rollDice} 
          style={{
            ...styles.rollButton,
            ...(availableDice <= 0 || isRolling ? styles.rollButtonDisabled : {})
          }}
          disabled={availableDice <= 0 || isRolling}
        >
          {isRolling ? 'ROLLING...' : 'ROLL DICE'}
        </button>
      </div>

      {/* Game Board */}
      <div style={styles.boardContainer}>
        <div style={styles.board}>
          {Array.from({ length: BOARD_SPACES }).map((_, index) => {
            const spaceColor = getSpaceColor(index);
            const isPlayer = index === playerPosition;
            
            return (
              <div
                key={index}
                style={{
                  ...styles.boardSpace,
                  background: isPlayer 
                    ? `radial-gradient(circle, ${spaceColor.glow}, rgba(0,0,0,0.8))`
                    : 'rgba(0, 0, 0, 0.6)',
                  border: `2px solid ${spaceColor.color}`,
                  boxShadow: isPlayer 
                    ? `0 0 30px ${spaceColor.glow}, inset 0 0 20px ${spaceColor.glow}`
                    : `0 0 10px ${spaceColor.color}`,
                }}
              >
                <div style={styles.spaceNumber}>{index}</div>
                {isPlayer && <div style={styles.playerMarker}>👤</div>}
                {index % 10 === 0 && <div style={styles.specialMarker}>🏆</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        <div style={styles.legendTitle}>SPACE TYPES</div>
        <div style={styles.legendGrid}>
          <div style={styles.legendItem}>
            <div style={{...styles.legendDot, background: '#ff3050'}}></div>
            <span>Challenge</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendDot, background: '#ffd700'}}></div>
            <span>Reward</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendDot, background: '#9d00ff'}}></div>
            <span>Mystery</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendDot, background: '#00d4ff'}}></div>
            <span>Boost</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendDot, background: '#ff6600'}}></div>
            <span>Plot Twist</span>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEvent && currentEvent && (
        <div style={styles.eventModal}>
          <div style={styles.eventCard}>
            <div style={styles.eventTitle}>{currentEvent.title}</div>
            <div style={styles.eventMessage}>{currentEvent.message}</div>
            {currentEvent.special === 'choice' ? (
              <div style={styles.choiceButtons}>
                <button 
                  onClick={() => handleEventAction('risk')}
                  style={{...styles.eventButton, ...styles.riskButton}}
                >
                  RISK (+6 spaces)
                </button>
                <button 
                  onClick={() => handleEventAction('safe')}
                  style={{...styles.eventButton, ...styles.safeButton}}
                >
                  SAFE (+2 spaces)
                </button>
              </div>
            ) : (
              <button 
                onClick={() => handleEventAction('accept')}
                style={styles.eventButton}
              >
                CONTINUE
              </button>
            )}
          </div>
        </div>
      )}

      {/* Special Items Display */}
      {specialItems.length > 0 && (
        <div style={styles.itemsPanel}>
          <div style={styles.itemsTitle}>YOUR ITEMS</div>
          <div style={styles.itemsList}>
            {specialItems.map((item, idx) => (
              <div key={idx} style={styles.itemBadge}>
                {item.replace('_', ' ')}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        @keyframes neonPulse {
          0%, 100% { 
            text-shadow: 0 0 10px #ff3050, 0 0 20px #ff3050, 0 0 30px #ff3050;
          }
          50% { 
            text-shadow: 0 0 20px #ff3050, 0 0 40px #ff3050, 0 0 60px #ff3050;
          }
        }

        @keyframes diceRoll {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.2); }
          50% { transform: rotate(180deg) scale(1); }
          75% { transform: rotate(270deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1); }
        }

        @keyframes slideIn {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #000000 0%, #1a0000 50%, #000000 100%)',
    padding: '20px',
    paddingTop: '80px',
    paddingBottom: '60px',
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(180deg, #000000 0%, #1a0000 50%, #000000 100%)',
  },
  loadingText: {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '16px',
    color: '#ff3050',
    textShadow: '0 0 20px #ff3050',
    animation: 'neonPulse 2s infinite'
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  title: {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: 'clamp(24px, 6vw, 48px)',
    color: '#ff3050',
    margin: '0 0 10px 0',
    textShadow: '0 0 20px #ff3050, 0 0 40px #ff3050',
    animation: 'neonPulse 3s infinite',
    letterSpacing: '2px'
  },
  subtitle: {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: 'clamp(8px, 2vw, 12px)',
    color: '#fff',
    textShadow: '0 0 10px #fff',
    letterSpacing: '2px',
    opacity: 0.8
  },
  statsPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '10px',
    maxWidth: '800px',
    margin: '0 auto 20px auto',
    padding: '0 10px'
  },
  statBox: {
    background: 'linear-gradient(135deg, rgba(255, 48, 80, 0.15) 0%, rgba(0, 0, 0, 0.9) 100%)',
    border: '2px solid #ff3050',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
    boxShadow: '0 0 15px rgba(255, 48, 80, 0.2)'
  },
  statLabel: {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: 'clamp(7px, 1.5vw, 9px)',
    color: '#fff',
    marginBottom: '5px',
    opacity: 0.7
  },
  statValue: {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: 'clamp(12px, 2.5vw, 16px)',
    color: '#ff3050',
    textShadow: '0 0 10px #ff3050'
  },
  messageBox: {
    background: 'rgba(0, 0, 0, 0.8)',
    border: '2px solid #ff3050',
    borderRadius: '8px',
    padding: '15px',
    maxWidth: '600px',
    margin: '0 auto 20px auto',
    boxShadow: '0 0 20px rgba(255, 48, 80, 0.3)',
    animation: 'pulse 2s infinite'
  },
  messageText: {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: 'clamp(9px, 2vw, 12px)',
    color: '#fff',
    textAlign: 'center',
    lineHeight: '1.6',
    textShadow: '0 0 5px #ff3050'
  },
  diceContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '30px'
  },
  dice: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #ff3050 0%, #cc0033 100%)',
    border: '3px solid #fff',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 30px rgba(255, 48, 80, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)',
    transition: 'transform 0.3s ease'
  },
  diceRolling: {
    animation: 'diceRoll 0.5s infinite'
  },
  diceValue: {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '32px',
    color: '#fff',
    textShadow: '0 0 10px #000'
  },
  rollButton: {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: 'clamp(10px, 2.5vw, 14px)',
    padding: '15px 30px',
    background: 'linear-gradient(135deg, #ff3050 0%, #cc0033 100%)',
    border: '2px solid #fff',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 0 20px rgba(255, 48, 80, 0.6)',
    transition: 'all 0.3s ease',
    textShadow: '0 0 10px #000'
  },
  rollButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    boxShadow: 'none'
  },
  boardContainer: {
    maxWidth: '900px',
    margin: '0 auto 30px auto',
    padding: '0 10px'
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    gap: '8px',
    background: 'rgba(0, 0, 0, 0.8)',
    padding: '15px',
    borderRadius: '12px',
    border: '3px solid #ff3050',
    boxShadow: '0 0 30px rgba(255, 48, 80, 0.4)'
  },
  boardSpace: {
    aspectRatio: '1',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  spaceNumber: {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: 'clamp(8px, 1.5vw, 10px)',
    color: '#fff',
    opacity: 0.6,
    position: 'absolute',
    top: '2px',
    left: '2px'
  },
  playerMarker: {
    fontSize: 'clamp(16px, 3vw, 24px)',
    filter: 'drop-shadow(0 0 10px #00ff00)',
    animation: 'pulse 1s infinite'
  },
  specialMarker: {
    fontSize: 'clamp(12px, 2.5vw, 16px)',
    position: 'absolute',
    bottom: '2px',
    right: '2px'
  },
  legend: {
    maxWidth: '600px',
    margin: '0 auto 20px auto',
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.6)',
    border: '2px solid #ff3050',
    borderRadius: '8px'
  },
  legendTitle: {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: 'clamp(9px, 2vw, 12px)',
    color: '#ff3050',
    marginBottom: '10px',
    textAlign: 'center',
    textShadow: '0 0 10px #ff3050'
  },
  legendGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '10px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontFamily: "'Press Start 2P', cursive",
    fontSize: 'clamp(7px, 1.5vw, 9px)',
    color: '#fff'
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    boxShadow: '0 0 10px currentColor'
  },
  eventModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  eventCard: {
    background: 'linear-gradient(135deg, rgba(255, 48, 80, 0.2) 0%, rgba(0, 0, 0, 0.95) 100%)',
    border: '3px solid #ff3050',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '500px',
    boxShadow: '0 0 50px rgba(255, 48, 80, 0.8)',
    animation: 'slideIn 0.5s ease'
  },
  eventTitle: {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: 'clamp(14px, 3vw, 20px)',
    color: '#ff3050',
    marginBottom: '20px',
    textAlign: 'center',
    textShadow: '0 0 20px #ff3050',
    letterSpacing: '2px'
  },
  eventMessage: {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: 'clamp(10px, 2vw, 12px)',
    color: '#fff',
    marginBottom: '25px',
    lineHeight: '1.8',
    textAlign: 'center'
  },
  eventButton: {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: 'clamp(10px, 2.5vw, 14px)',
    padding: '15px 30px',
    background: 'linear-gradient(135deg, #ff3050 0%, #cc0033 100%)',
    border: '2px solid #fff',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    width: '100%',
    boxShadow: '0 0 20px rgba(255, 48, 80, 0.6)',
    transition: 'all 0.3s ease'
  },
  choiceButtons: {
    display: 'flex',
    gap: '15px',
    width: '100%',
    flexDirection: 'column'
  },
  riskButton: {
    background: 'linear-gradient(135deg, #ff6600 0%, #cc4400 100%)',
    boxShadow: '0 0 20px rgba(255, 102, 0, 0.6)'
  },
  safeButton: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
    boxShadow: '0 0 20px rgba(0, 212, 255, 0.6)'
  },
  itemsPanel: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.6)',
    border: '2px solid #00d4ff',
    borderRadius: '8px',
    boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)'
  },
  itemsTitle: {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: 'clamp(9px, 2vw, 12px)',
    color: '#00d4ff',
    marginBottom: '10px',
    textAlign: 'center',
    textShadow: '0 0 10px #00d4ff'
  },
  itemsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center'
  },
  itemBadge: {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: 'clamp(7px, 1.5vw, 9px)',
    padding: '8px 12px',
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
    border: '2px solid #fff',
    borderRadius: '6px',
    color: '#000',
    textTransform: 'uppercase',
    boxShadow: '0 0 15px rgba(0, 212, 255, 0.6)'
  }
};
