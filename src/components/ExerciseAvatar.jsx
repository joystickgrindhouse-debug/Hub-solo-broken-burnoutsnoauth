import React from 'react';

const ExerciseAvatar = ({ exercise, animationKey }) => {
  const styles = {
    container: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#000",
      position: "relative"
    },
    svg: {
      width: "200px",
      height: "300px"
    }
  };

  // Simple stick figure exercises with CSS animations
  const getExerciseAnimation = () => {
    switch(exercise?.toLowerCase()) {
      case "pushups":
      case "push ups":
        return (
          <svg style={styles.svg} viewBox="0 0 100 150" key={animationKey}>
            <defs>
              <style>{`
                @keyframes pushup {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(20px); }
                }
                .pushup-body { animation: pushup 1.5s infinite; }
              `}</style>
            </defs>
            <g className="pushup-body">
              {/* Head */}
              <circle cx="50" cy="15" r="8" stroke="#00ff00" strokeWidth="2" fill="none"/>
              {/* Body */}
              <line x1="50" y1="23" x2="50" y2="50" stroke="#00ff00" strokeWidth="2"/>
              {/* Arms */}
              <line x1="50" y1="30" x2="25" y2="45" stroke="#00ff00" strokeWidth="2"/>
              <line x1="50" y1="30" x2="75" y2="45" stroke="#00ff00" strokeWidth="2"/>
              {/* Legs */}
              <line x1="50" y1="50" x2="35" y2="70" stroke="#00ff00" strokeWidth="2"/>
              <line x1="50" y1="50" x2="65" y2="70" stroke="#00ff00" strokeWidth="2"/>
            </g>
          </svg>
        );

      case "squats":
      case "squat":
        return (
          <svg style={styles.svg} viewBox="0 0 100 150" key={animationKey}>
            <defs>
              <style>{`
                @keyframes squat {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(30px); }
                }
                .squat-body { animation: squat 1.5s infinite; }
              `}</style>
            </defs>
            <g className="squat-body">
              {/* Head */}
              <circle cx="50" cy="15" r="8" stroke="#00ff00" strokeWidth="2" fill="none"/>
              {/* Body */}
              <line x1="50" y1="23" x2="50" y2="50" stroke="#00ff00" strokeWidth="2"/>
              {/* Arms */}
              <line x1="50" y1="30" x2="25" y2="35" stroke="#00ff00" strokeWidth="2"/>
              <line x1="50" y1="30" x2="75" y2="35" stroke="#00ff00" strokeWidth="2"/>
              {/* Legs */}
              <line x1="50" y1="50" x2="35" y2="80" stroke="#00ff00" strokeWidth="2"/>
              <line x1="50" y1="50" x2="65" y2="80" stroke="#00ff00" strokeWidth="2"/>
            </g>
          </svg>
        );

      case "burpees":
      case "burpee":
        return (
          <svg style={styles.svg} viewBox="0 0 100 150" key={animationKey}>
            <defs>
              <style>{`
                @keyframes burpee {
                  0%, 100% { transform: translateY(0px); }
                  25% { transform: translateY(50px); }
                  50% { transform: translateY(0px) scaleY(0.7); }
                  75% { transform: translateY(-30px); }
                }
                .burpee-body { animation: burpee 2s infinite; }
              `}</style>
            </defs>
            <g className="burpee-body">
              {/* Head */}
              <circle cx="50" cy="15" r="8" stroke="#00ff00" strokeWidth="2" fill="none"/>
              {/* Body */}
              <line x1="50" y1="23" x2="50" y2="50" stroke="#00ff00" strokeWidth="2"/>
              {/* Arms */}
              <line x1="50" y1="30" x2="20" y2="50" stroke="#00ff00" strokeWidth="2"/>
              <line x1="50" y1="30" x2="80" y2="50" stroke="#00ff00" strokeWidth="2"/>
              {/* Legs */}
              <line x1="50" y1="50" x2="40" y2="75" stroke="#00ff00" strokeWidth="2"/>
              <line x1="50" y1="50" x2="60" y2="75" stroke="#00ff00" strokeWidth="2"/>
            </g>
          </svg>
        );

      case "lunges":
      case "lunge":
        return (
          <svg style={styles.svg} viewBox="0 0 100 150" key={animationKey}>
            <defs>
              <style>{`
                @keyframes lunge {
                  0%, 100% { transform: translateX(0px); }
                  50% { transform: translateX(25px); }
                }
                .lunge-body { animation: lunge 1.8s infinite; }
              `}</style>
            </defs>
            <g className="lunge-body">
              {/* Head */}
              <circle cx="50" cy="15" r="8" stroke="#00ff00" strokeWidth="2" fill="none"/>
              {/* Body */}
              <line x1="50" y1="23" x2="50" y2="50" stroke="#00ff00" strokeWidth="2"/>
              {/* Arms */}
              <line x1="50" y1="30" x2="30" y2="40" stroke="#00ff00" strokeWidth="2"/>
              <line x1="50" y1="30" x2="70" y2="40" stroke="#00ff00" strokeWidth="2"/>
              {/* Legs */}
              <line x1="50" y1="50" x2="40" y2="80" stroke="#00ff00" strokeWidth="2"/>
              <line x1="50" y1="50" x2="65" y2="75" stroke="#00ff00" strokeWidth="2"/>
            </g>
          </svg>
        );

      case "crunches":
      case "crunch":
        return (
          <svg style={styles.svg} viewBox="0 0 100 150" key={animationKey}>
            <defs>
              <style>{`
                @keyframes crunch {
                  0%, 100% { transform: rotateZ(0deg); }
                  50% { transform: rotateZ(-15deg); }
                }
                .crunch-body { animation: crunch 1.2s infinite; transform-origin: 50% 50%; }
              `}</style>
            </defs>
            <g className="crunch-body">
              {/* Head */}
              <circle cx="50" cy="25" r="8" stroke="#00ff00" strokeWidth="2" fill="none"/>
              {/* Body */}
              <line x1="50" y1="33" x2="50" y2="60" stroke="#00ff00" strokeWidth="2"/>
              {/* Arms */}
              <line x1="50" y1="40" x2="30" y2="35" stroke="#00ff00" strokeWidth="2"/>
              <line x1="50" y1="40" x2="70" y2="35" stroke="#00ff00" strokeWidth="2"/>
              {/* Legs */}
              <line x1="50" y1="60" x2="40" y2="80" stroke="#00ff00" strokeWidth="2"/>
              <line x1="50" y1="60" x2="60" y2="80" stroke="#00ff00" strokeWidth="2"/>
            </g>
          </svg>
        );

      case "jumping jacks":
      case "jumping jack":
        return (
          <svg style={styles.svg} viewBox="0 0 100 150" key={animationKey}>
            <defs>
              <style>{`
                @keyframes jumpingjack {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-15px); }
                }
                .jack-body { animation: jumpingjack 1s infinite; }
                @keyframes jacklegs {
                  0%, 100% { transform: translateX(0px); }
                  50% { transform: translateX(20px); }
                }
                .jack-leg-left { animation: jacklegs 1s infinite reverse; }
                .jack-leg-right { animation: jacklegs 1s infinite; }
              `}</style>
            </defs>
            <g className="jack-body">
              {/* Head */}
              <circle cx="50" cy="15" r="8" stroke="#00ff00" strokeWidth="2" fill="none"/>
              {/* Body */}
              <line x1="50" y1="23" x2="50" y2="50" stroke="#00ff00" strokeWidth="2"/>
              {/* Arms */}
              <line x1="50" y1="30" x2="20" y2="15" stroke="#00ff00" strokeWidth="2"/>
              <line x1="50" y1="30" x2="80" y2="15" stroke="#00ff00" strokeWidth="2"/>
            </g>
            {/* Legs */}
            <line x1="50" y1="50" x2="35" y2="75" stroke="#00ff00" strokeWidth="2" className="jack-leg-left"/>
            <line x1="50" y1="50" x2="65" y2="75" stroke="#00ff00" strokeWidth="2" className="jack-leg-right"/>
          </svg>
        );

      case "planks":
      case "plank":
        return (
          <svg style={styles.svg} viewBox="0 0 100 150" key={animationKey}>
            <defs>
              <style>{`
                @keyframes plank {
                  0%, 100% { transform: rotateZ(-10deg); }
                  50% { transform: rotateZ(10deg); }
                }
                .plank-body { animation: plank 2s infinite; transform-origin: 30% 80%; }
              `}</style>
            </defs>
            <g className="plank-body">
              {/* Head */}
              <circle cx="50" cy="40" r="8" stroke="#00ff00" strokeWidth="2" fill="none"/>
              {/* Body */}
              <line x1="50" y1="48" x2="50" y2="75" stroke="#00ff00" strokeWidth="2"/>
              {/* Arms */}
              <line x1="50" y1="50" x2="25" y2="65" stroke="#00ff00" strokeWidth="2"/>
              <line x1="50" y1="50" x2="75" y2="65" stroke="#00ff00" strokeWidth="2"/>
              {/* Legs */}
              <line x1="50" y1="75" x2="35" y2="85" stroke="#00ff00" strokeWidth="2"/>
              <line x1="50" y1="75" x2="65" y2="85" stroke="#00ff00" strokeWidth="2"/>
            </g>
          </svg>
        );

      default:
        return (
          <svg style={styles.svg} viewBox="0 0 100 150" key={animationKey}>
            {/* Neutral stance */}
            <circle cx="50" cy="15" r="8" stroke="#00ff00" strokeWidth="2" fill="none"/>
            <line x1="50" y1="23" x2="50" y2="50" stroke="#00ff00" strokeWidth="2"/>
            <line x1="50" y1="30" x2="30" y2="45" stroke="#00ff00" strokeWidth="2"/>
            <line x1="50" y1="30" x2="70" y2="45" stroke="#00ff00" strokeWidth="2"/>
            <line x1="50" y1="50" x2="35" y2="75" stroke="#00ff00" strokeWidth="2"/>
            <line x1="50" y1="50" x2="65" y2="75" stroke="#00ff00" strokeWidth="2"/>
          </svg>
        );
    }
  };

  return (
    <div style={styles.container}>
      {getExerciseAnimation()}
    </div>
  );
};

export default ExerciseAvatar;
