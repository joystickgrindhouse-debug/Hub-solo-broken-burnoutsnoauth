import React from 'react';

const ExerciseAvatar = ({ exercise, animationKey }) => {
  const styles = {
    container: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#1a1a1a",
      position: "relative",
      overflow: "hidden"
    },
    svg: {
      width: "160px",
      height: "280px",
      filter: "drop-shadow(0 0 10px rgba(0, 255, 0, 0.3))"
    }
  };

  // Realistic human figure with proper proportions
  const RealisticFigure = ({ animation }) => (
    <svg style={styles.svg} viewBox="0 0 100 160" key={animationKey}>
      <defs>
        <style>{animation}</style>
        <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#d4a574', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#b8945f', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Group for body animations */}
      <g className="figure-group">
        {/* Head */}
        <circle cx="50" cy="18" r="10" fill="url(#skinGradient)" stroke="#00ff00" strokeWidth="1"/>
        
        {/* Neck */}
        <line x1="50" y1="28" x2="50" y2="35" stroke="#d4a574" strokeWidth="3"/>
        
        {/* Torso/Chest */}
        <ellipse cx="50" cy="50" rx="13" ry="18" fill="url(#skinGradient)" stroke="#00ff00" strokeWidth="1" opacity="0.9"/>
        
        {/* Waist */}
        <ellipse cx="50" cy="65" rx="10" ry="10" fill="url(#skinGradient)" stroke="#00ff00" strokeWidth="1" opacity="0.8"/>

        {/* Left shoulder joint */}
        <circle cx="37" cy="38" r="2.5" fill="#00ff00" opacity="0.6"/>
        {/* Right shoulder joint */}
        <circle cx="63" cy="38" r="2.5" fill="#00ff00" opacity="0.6"/>
        
        {/* Left hip joint */}
        <circle cx="42" cy="70" r="2.5" fill="#00ff00" opacity="0.6"/>
        {/* Right hip joint */}
        <circle cx="58" cy="70" r="2.5" fill="#00ff00" opacity="0.6"/>

        {/* Left arm */}
        <line x1="37" y1="38" x2="25" y2="55" stroke="#d4a574" strokeWidth="3.5" strokeLinecap="round" className="left-arm"/>
        {/* Left forearm */}
        <line x1="25" y1="55" x2="20" y2="75" stroke="#c99a5c" strokeWidth="3" strokeLinecap="round" className="left-forearm"/>
        
        {/* Right arm */}
        <line x1="63" y1="38" x2="75" y2="55" stroke="#d4a574" strokeWidth="3.5" strokeLinecap="round" className="right-arm"/>
        {/* Right forearm */}
        <line x1="75" y1="55" x2="80" y2="75" stroke="#c99a5c" strokeWidth="3" strokeLinecap="round" className="right-forearm"/>

        {/* Left thigh */}
        <line x1="42" y1="70" x2="38" y2="100" stroke="#8b6f47" strokeWidth="4" strokeLinecap="round" className="left-thigh"/>
        {/* Left calf */}
        <line x1="38" y1="100" x2="36" y2="130" stroke="#7a5c3d" strokeWidth="3.5" strokeLinecap="round" className="left-calf"/>
        
        {/* Right thigh */}
        <line x1="58" y1="70" x2="62" y2="100" stroke="#8b6f47" strokeWidth="4" strokeLinecap="round" className="right-thigh"/>
        {/* Right calf */}
        <line x1="62" y1="100" x2="64" y2="130" stroke="#7a5c3d" strokeWidth="3.5" strokeLinecap="round" className="right-calf"/>

        {/* Feet */}
        <ellipse cx="36" cy="133" rx="3" ry="4" fill="#7a5c3d"/>
        <ellipse cx="64" cy="133" rx="3" ry="4" fill="#7a5c3d"/>
      </g>
    </svg>
  );

  // Exercise animations
  const getExerciseAnimation = () => {
    switch(exercise?.toLowerCase()) {
      case "pushups":
      case "push ups":
      case "push-ups":
        return (
          <>
            <style>{`
              @keyframes pushup {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(30px); }
              }
              .figure-group { animation: pushup 1.5s ease-in-out infinite; transform-origin: 50% 130px; }
              @keyframes pushup-arms {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(45deg); }
              }
              .left-arm { animation: pushup-arms 1.5s ease-in-out infinite; transform-origin: 37px 38px; }
              @keyframes pushup-arms-right {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(-45deg); }
              }
              .right-arm { animation: pushup-arms-right 1.5s ease-in-out infinite; transform-origin: 63px 38px; }
            `}</style>
            <RealisticFigure animation={null} />
          </>
        );

      case "squats":
      case "squat":
        return (
          <>
            <style>{`
              @keyframes squat {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(0.7); }
              }
              .figure-group { animation: squat 1.6s ease-in-out infinite; transform-origin: 50% 70px; }
              @keyframes squat-legs {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(50deg); }
              }
              .left-thigh { animation: squat-legs 1.6s ease-in-out infinite; transform-origin: 42px 70px; }
              @keyframes squat-legs-right {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(-50deg); }
              }
              .right-thigh { animation: squat-legs-right 1.6s ease-in-out infinite; transform-origin: 58px 70px; }
            `}</style>
            <RealisticFigure animation={null} />
          </>
        );

      case "lunges":
      case "lunge":
        return (
          <>
            <style>{`
              @keyframes lunge {
                0%, 100% { transform: translateX(0px) scaleY(1); }
                50% { transform: translateX(20px) scaleY(0.95); }
              }
              .figure-group { animation: lunge 1.8s ease-in-out infinite; transform-origin: 50% 100px; }
              @keyframes lunge-left-leg {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(60deg); }
              }
              .left-thigh { animation: lunge-left-leg 1.8s ease-in-out infinite; transform-origin: 42px 70px; }
              @keyframes lunge-right-leg {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(-20deg); }
              }
              .right-thigh { animation: lunge-right-leg 1.8s ease-in-out infinite; transform-origin: 58px 70px; }
            `}</style>
            <RealisticFigure animation={null} />
          </>
        );

      case "crunches":
      case "crunch":
        return (
          <>
            <style>{`
              @keyframes crunch-body {
                0%, 100% { transform: rotateZ(0deg); }
                50% { transform: rotateZ(-25deg); }
              }
              .figure-group { animation: crunch-body 1.3s ease-in-out infinite; transform-origin: 50% 70px; }
              @keyframes crunch-arms {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(60deg); }
              }
              .left-arm { animation: crunch-arms 1.3s ease-in-out infinite; transform-origin: 37px 38px; }
              @keyframes crunch-arms-right {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(-60deg); }
              }
              .right-arm { animation: crunch-arms-right 1.3s ease-in-out infinite; transform-origin: 63px 38px; }
            `}</style>
            <RealisticFigure animation={null} />
          </>
        );

      case "jumping jacks":
      case "jumping jack":
        return (
          <>
            <style>{`
              @keyframes jumping {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-25px); }
              }
              .figure-group { animation: jumping 1s ease-in-out infinite; transform-origin: 50% 130px; }
              @keyframes jacks-arm-spread {
                0%, 100% { transform: rotate(-20deg); }
                50% { transform: rotate(-120deg); }
              }
              .left-arm { animation: jacks-arm-spread 1s ease-in-out infinite; transform-origin: 37px 38px; }
              @keyframes jacks-arm-spread-right {
                0%, 100% { transform: rotate(20deg); }
                50% { transform: rotate(120deg); }
              }
              .right-arm { animation: jacks-arm-spread-right 1s ease-in-out infinite; transform-origin: 63px 38px; }
              @keyframes jacks-legs {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(-35deg); }
              }
              .left-thigh { animation: jacks-legs 1s ease-in-out infinite; transform-origin: 42px 70px; }
              @keyframes jacks-legs-right {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(35deg); }
              }
              .right-thigh { animation: jacks-legs-right 1s ease-in-out infinite; transform-origin: 58px 70px; }
            `}</style>
            <RealisticFigure animation={null} />
          </>
        );

      case "plank":
      case "planks":
        return (
          <>
            <style>{`
              @keyframes plank {
                0%, 100% { transform: rotateZ(0deg); }
                50% { transform: rotateZ(-15deg); }
              }
              .figure-group { animation: plank 2s ease-in-out infinite; transform-origin: 20% 130px; }
              @keyframes plank-arms {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(-25deg); }
              }
              .left-arm { animation: plank-arms 2s ease-in-out infinite; transform-origin: 37px 38px; }
              @keyframes plank-arms-right {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(25deg); }
              }
              .right-arm { animation: plank-arms-right 2s ease-in-out infinite; transform-origin: 63px 38px; }
            `}</style>
            <RealisticFigure animation={null} />
          </>
        );

      case "burpees":
      case "burpee":
        return (
          <>
            <style>{`
              @keyframes burpee-sequence {
                0%, 100% { transform: translateY(0px) scaleY(1); }
                25% { transform: translateY(20px) scaleY(0.8); }
                50% { transform: translateY(-20px) scaleY(1.1); }
                75% { transform: translateY(10px) scaleY(0.9); }
              }
              .figure-group { animation: burpee-sequence 2.2s ease-in-out infinite; transform-origin: 50% 130px; }
              @keyframes burpee-arms {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(90deg); }
                50% { transform: rotate(-120deg); }
                75% { transform: rotate(30deg); }
              }
              .left-arm { animation: burpee-arms 2.2s ease-in-out infinite; transform-origin: 37px 38px; }
              @keyframes burpee-arms-right {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-90deg); }
                50% { transform: rotate(120deg); }
                75% { transform: rotate(-30deg); }
              }
              .right-arm { animation: burpee-arms-right 2.2s ease-in-out infinite; transform-origin: 63px 38px; }
            `}</style>
            <RealisticFigure animation={null} />
          </>
        );

      case "pike push ups":
      case "pike pushups":
        return (
          <>
            <style>{`
              @keyframes pike {
                0%, 100% { transform: translateY(0px) scaleY(1); }
                50% { transform: translateY(15px) scaleY(0.85); }
              }
              .figure-group { animation: pike 1.7s ease-in-out infinite; transform-origin: 50% 130px; }
              @keyframes pike-arms {
                0%, 100% { transform: rotate(-30deg); }
                50% { transform: rotate(50deg); }
              }
              .left-arm { animation: pike-arms 1.7s ease-in-out infinite; transform-origin: 37px 38px; }
              @keyframes pike-arms-right {
                0%, 100% { transform: rotate(30deg); }
                50% { transform: rotate(-50deg); }
              }
              .right-arm { animation: pike-arms-right 1.7s ease-in-out infinite; transform-origin: 63px 38px; }
            `}</style>
            <RealisticFigure animation={null} />
          </>
        );

      default:
        return (
          <>
            <style>{``}</style>
            <RealisticFigure animation={null} />
          </>
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
