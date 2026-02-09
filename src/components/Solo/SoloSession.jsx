import { useState, useEffect, useRef, useCallback } from 'react';
import PoseVisualizer from '../Burnouts/PoseVisualizer';
import { processExercise, createStateRefs } from '../../logic/exerciseEngine';

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}

export default function SoloSession({ userId, exercise, onSessionEnd }) {
    const [reps, setReps] = useState(0);
    const [feedback, setFeedback] = useState('Get Ready');
    const [movementState, setMovementState] = useState('IDLE');
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [sessionActive, setSessionActive] = useState(true);

    const stateRefs = useRef(createStateRefs());
    const repsRef = useRef(0);

    useEffect(() => {
        if (!isMuted) {
            speak(`Starting ${exercise.name}. Let's go!`);
        }
    }, []);

    useEffect(() => {
        let interval;
        if (sessionActive) {
            interval = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [sessionActive]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const processPose = useCallback((landmarks) => {
        if (!sessionActive || !landmarks) return;

        stateRefs.current.currentReps = repsRef.current;

        const result = processExercise(exercise.id, landmarks, stateRefs.current);
        if (!result) return;

        if (result.repIncrement > 0) {
            const newReps = repsRef.current + result.repIncrement;
            repsRef.current = newReps;
            setReps(newReps);

            if (Math.floor(newReps) > Math.floor(newReps - result.repIncrement) && !isMuted) {
                speak(Math.floor(newReps).toString());
            }
        }
        if (result.feedback) setFeedback(result.feedback);
        if (result.state) setMovementState(result.state);
    }, [sessionActive, exercise.id, isMuted]);

    const handleStopSession = useCallback(() => {
        setSessionActive(false);
        if (onSessionEnd) {
            onSessionEnd({
                reps: Math.floor(repsRef.current),
                duration: timeElapsed,
                exercise: exercise.name,
                exerciseId: exercise.id,
                category: exercise.category,
                type: 'solo'
            });
        }
    }, [onSessionEnd, timeElapsed, exercise]);

    return (
        <div className="solo-session-container">
            <div className="solo-ui-layer">
                <div className="solo-top-bar">
                    <div className="solo-session-stats">
                        <button
                            className="solo-mute-toggle"
                            onClick={() => setIsMuted(!isMuted)}
                        >
                            {isMuted ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                    <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                    <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                                </svg>
                            )}
                        </button>
                        <div className="solo-stat-item">
                            <span className="solo-stat-label">REPS</span>
                            <span className="solo-stat-value">{Math.floor(reps)}</span>
                        </div>
                        <div className="solo-stat-item">
                            <span className="solo-stat-label">TIME</span>
                            <span className="solo-stat-value">{formatTime(timeElapsed)}</span>
                        </div>
                        <div className="solo-stat-item">
                            <span className="solo-stat-label">TICKETS</span>
                            <span className="solo-stat-value">{Math.floor(reps / 30)}</span>
                        </div>
                    </div>
                    <div className="solo-status-badge">LIVE</div>
                </div>

                <div className="solo-video-area">
                    <PoseVisualizer
                        onPoseResults={processPose}
                        currentExercise={exercise.id}
                    />
                </div>

                <div className="solo-bottom-panel">
                    <div className="solo-exercise-info">
                        <h2 className="solo-current-exercise">{exercise.name.toUpperCase()}</h2>
                        <div className="solo-feedback-state">{movementState}</div>
                        <div className="solo-feedback-msg">{feedback}</div>
                    </div>
                    <div className="solo-big-reps">{Math.floor(reps)}</div>
                    <button className="solo-stop-btn" onClick={handleStopSession}>
                        STOP SESSION
                    </button>
                </div>
            </div>
        </div>
    );
}
