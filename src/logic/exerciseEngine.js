function calculateAngle(a, b, c) {
    if (!a || !b || !c) return -1;
    const threshold = 0.2;
    if (a.visibility < threshold || b.visibility < threshold || c.visibility < threshold) {
        return -1;
    }
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
}

function calculateDistance(a, b) {
    if (!a || !b) return 0;
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export function processExercise(exerciseId, landmarks, stateRefs) {
    if (!landmarks) return null;

    const id = exerciseId.toLowerCase().replace(/[\s_-]/g, '');
    let repIncrement = 0;
    let feedback = '';
    let state = '';

    switch (id) {
        case 'pushups':
        case 'plankupdowns':
        case 'pikepushups': {
            const leftAngle = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
            const rightAngle = calculateAngle(landmarks[12], landmarks[14], landmarks[16]);
            const angle = leftAngle !== -1 && rightAngle !== -1
                ? Math.max(leftAngle, rightAngle)
                : (leftAngle !== -1 ? leftAngle : rightAngle);

            if (angle === -1) {
                feedback = 'Align side to camera';
            } else if (angle > 140) {
                if (stateRefs.exerciseState === 'DOWN') {
                    stateRefs.exerciseState = 'UP';
                    state = 'UP';
                    repIncrement = 1;
                    feedback = 'Good rep!';
                } else {
                    stateRefs.exerciseState = 'UP';
                    state = 'UP';
                    feedback = 'Go down';
                }
            } else if (angle < 110) {
                stateRefs.exerciseState = 'DOWN';
                state = 'DOWN';
                feedback = 'Push up!';
            }
            break;
        }
        case 'squats':
        case 'glutebridges': {
            const leftAngle = calculateAngle(landmarks[23], landmarks[25], landmarks[27]);
            const rightAngle = calculateAngle(landmarks[24], landmarks[26], landmarks[28]);
            const angle = leftAngle !== -1 && rightAngle !== -1
                ? Math.min(leftAngle, rightAngle)
                : (leftAngle !== -1 ? leftAngle : rightAngle);

            if (angle === -1) {
                feedback = 'Legs out of view';
            } else if (angle > 145) {
                if (stateRefs.exerciseState === 'DOWN') {
                    stateRefs.exerciseState = 'UP';
                    state = 'UP';
                    repIncrement = 1;
                    feedback = 'Good!';
                } else {
                    stateRefs.exerciseState = 'UP';
                    state = 'UP';
                    feedback = 'Squat down';
                }
            } else if (angle < 110) {
                stateRefs.exerciseState = 'DOWN';
                state = 'DOWN';
                feedback = 'Drive up!';
            }
            break;
        }
        case 'plank': {
            const hipAngle = calculateAngle(landmarks[11], landmarks[23], landmarks[27]);
            if (hipAngle === -1) {
                feedback = 'Body out of view';
            } else if (hipAngle > 165) {
                if (!stateRefs.plankStartTime) stateRefs.plankStartTime = Date.now();
                const seconds = Math.floor((Date.now() - stateRefs.plankStartTime) / 1000);
                if (seconds > (stateRefs.currentReps || 0)) {
                    repIncrement = seconds - (stateRefs.currentReps || 0);
                }
                stateRefs.exerciseState = 'HOLD';
                state = 'HOLD';
                feedback = 'Hold it!';
            } else {
                stateRefs.plankStartTime = null;
                stateRefs.exerciseState = 'FORM';
                state = 'FORM';
                feedback = 'Lower hips';
            }
            break;
        }
        case 'jumpingjacks': {
            const nose = landmarks[0];
            const lWrist = landmarks[15];
            const rWrist = landmarks[16];
            const leftAnkle = landmarks[27];
            const rightAnkle = landmarks[28];

            const handsUp = lWrist.y < nose.y && rWrist.y < nose.y;
            const feetWide = calculateDistance(leftAnkle, rightAnkle) > 0.4;
            if (handsUp && feetWide) {
                stateRefs.exerciseState = 'UP';
                state = 'OPEN';
                feedback = 'Back in';
            } else if (!handsUp && !feetWide) {
                if (stateRefs.exerciseState === 'UP') {
                    stateRefs.exerciseState = 'DOWN';
                    state = 'CLOSED';
                    repIncrement = 1;
                    feedback = 'Nice!';
                } else {
                    stateRefs.exerciseState = 'DOWN';
                    state = 'CLOSED';
                    feedback = 'Jump!';
                }
            }
            break;
        }
        case 'lunges': {
            const lKnee = calculateAngle(landmarks[23], landmarks[25], landmarks[27]);
            const rKnee = calculateAngle(landmarks[24], landmarks[26], landmarks[28]);
            if (lKnee === -1 || rKnee === -1) {
                feedback = 'Show legs';
            } else if (lKnee < 115 || rKnee < 115) {
                stateRefs.exerciseState = 'DOWN';
                state = 'DOWN';
                feedback = 'Up';
            } else if (lKnee > 145 && rKnee > 145) {
                if (stateRefs.exerciseState === 'DOWN') {
                    stateRefs.exerciseState = 'UP';
                    state = 'UP';
                    repIncrement = 1;
                    feedback = 'Good!';
                } else {
                    stateRefs.exerciseState = 'UP';
                    state = 'UP';
                    feedback = 'Lunge down';
                }
            }
            break;
        }
        case 'crunches':
        case 'legraises': {
            const shoulder = landmarks[11];
            const knee = landmarks[25];
            const hip = landmarks[23];
            const dist = calculateDistance(shoulder, knee);
            const ref = calculateDistance(hip, knee);
            if (dist < ref * 1.3) {
                stateRefs.exerciseState = 'IN';
                state = 'CRUNCH';
                feedback = 'Down';
            } else if (dist > ref * 1.5 && stateRefs.exerciseState === 'IN') {
                stateRefs.exerciseState = 'OUT';
                state = 'OUT';
                repIncrement = 1;
                feedback = 'Crunch!';
            }
            break;
        }
        case 'highknees':
        case 'mountainclimbers': {
            const lUp = landmarks[25].y < landmarks[23].y - 0.08;
            const rUp = landmarks[26].y < landmarks[24].y - 0.08;
            if (lUp && stateRefs.lastHighKneeLeg !== 'left') {
                stateRefs.lastHighKneeLeg = 'left';
                state = 'LEFT';
                repIncrement = 0.5;
                feedback = 'Next!';
            } else if (rUp && stateRefs.lastHighKneeLeg !== 'right') {
                stateRefs.lastHighKneeLeg = 'right';
                state = 'RIGHT';
                repIncrement = 0.5;
                feedback = 'Next!';
            } else {
                state = 'RUN';
                feedback = 'Knees high';
            }
            break;
        }
        case 'burpees': {
            const shoulder = landmarks[11];
            const ankle = landmarks[27];
            const isHorizontal = Math.abs(shoulder.y - ankle.y) < 0.25;
            const isVertical = shoulder.y < landmarks[23].y && Math.abs(shoulder.x - ankle.x) < 0.25;
            if (isHorizontal && stateRefs.burpeeStep === 0) {
                stateRefs.burpeeStep = 1;
                state = 'PLANK';
                feedback = 'Up!';
            } else if (isVertical && stateRefs.burpeeStep === 1) {
                stateRefs.burpeeStep = 0;
                state = 'STAND';
                repIncrement = 1;
                feedback = 'Down!';
            }
            break;
        }
        case 'shouldertaps': {
            const lTap = calculateDistance(landmarks[15], landmarks[12]) < 0.25;
            const rTap = calculateDistance(landmarks[16], landmarks[11]) < 0.25;
            if ((lTap || rTap) && stateRefs.exerciseState !== 'TAP') {
                stateRefs.exerciseState = 'TAP';
                state = 'TAP';
                repIncrement = 0.5;
                feedback = 'Tap!';
            } else if (!lTap && !rTap) {
                stateRefs.exerciseState = 'IDLE';
                state = 'IDLE';
                feedback = 'Tap shoulders';
            }
            break;
        }
        case 'calfraises': {
            const ankle = landmarks[27];
            if (stateRefs.baseY === null || stateRefs.baseY === undefined) stateRefs.baseY = ankle.y;
            if (ankle.y < stateRefs.baseY - 0.03) {
                stateRefs.exerciseState = 'UP';
                state = 'UP';
                feedback = 'Down';
            } else if (stateRefs.exerciseState === 'UP' && ankle.y > stateRefs.baseY - 0.01) {
                stateRefs.exerciseState = 'DOWN';
                state = 'DOWN';
                repIncrement = 1;
                feedback = 'Up';
            } else {
                feedback = 'Rise';
            }
            break;
        }
        case 'russiantwists': {
            const lShoulder = landmarks[11];
            const rShoulder = landmarks[12];
            if (lShoulder.x > rShoulder.x + 0.05 && stateRefs.exerciseState !== 'LEFT') {
                stateRefs.exerciseState = 'LEFT';
                state = 'LEFT';
                repIncrement = 0.5;
                feedback = 'Right';
            } else if (rShoulder.x > lShoulder.x + 0.05 && stateRefs.exerciseState !== 'RIGHT') {
                stateRefs.exerciseState = 'RIGHT';
                state = 'RIGHT';
                repIncrement = 0.5;
                feedback = 'Left';
            } else {
                feedback = 'Twist';
            }
            break;
        }
        default:
            break;
    }

    return { repIncrement, feedback, state };
}

export function createStateRefs() {
    return {
        exerciseState: 'UP',
        lastHighKneeLeg: null,
        burpeeStep: 0,
        baseY: null,
        plankStartTime: null,
        currentReps: 0
    };
}

export function resetStateRefs(stateRefs) {
    stateRefs.exerciseState = 'UP';
    stateRefs.lastHighKneeLeg = null;
    stateRefs.burpeeStep = 0;
    stateRefs.baseY = null;
    stateRefs.plankStartTime = null;
    stateRefs.currentReps = 0;
}

export const EXERCISE_LIST = [
    { id: 'pushups', name: 'Push-Ups', category: 'Arms' },
    { id: 'plankupdowns', name: 'Plank Up-Downs', category: 'Arms' },
    { id: 'pikepushups', name: 'Pike Push-Ups', category: 'Arms' },
    { id: 'shouldertaps', name: 'Shoulder Taps', category: 'Arms' },
    { id: 'squats', name: 'Squats', category: 'Legs' },
    { id: 'lunges', name: 'Lunges', category: 'Legs' },
    { id: 'glutebridges', name: 'Glute Bridges', category: 'Legs' },
    { id: 'calfraises', name: 'Calf Raises', category: 'Legs' },
    { id: 'crunches', name: 'Crunches', category: 'Core' },
    { id: 'plank', name: 'Plank', category: 'Core' },
    { id: 'russiantwists', name: 'Russian Twists', category: 'Core' },
    { id: 'legraises', name: 'Leg Raises', category: 'Core' },
    { id: 'jumpingjacks', name: 'Jumping Jacks', category: 'Cardio' },
    { id: 'highknees', name: 'High Knees', category: 'Cardio' },
    { id: 'burpees', name: 'Burpees', category: 'Cardio' },
    { id: 'mountainclimbers', name: 'Mountain Climbers', category: 'Cardio' },
];

export const CATEGORIES = ['Arms', 'Legs', 'Core', 'Cardio'];
