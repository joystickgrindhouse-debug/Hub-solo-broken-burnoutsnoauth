import React, { useEffect, useRef, useState } from 'react';

const SCRIPT_URLS = [
    'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js'
];

let scriptsLoaded = false;
let scriptsLoadingPromise = null;

function loadScripts() {
    if (scriptsLoaded) return Promise.resolve();
    if (scriptsLoadingPromise) return scriptsLoadingPromise;

    scriptsLoadingPromise = Promise.all(
        SCRIPT_URLS.map(src => {
            if (document.querySelector(`script[src="${src}"]`)) return Promise.resolve();
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        })
    ).then(() => {
        scriptsLoaded = true;
    });

    return scriptsLoadingPromise;
}

function requestCamera() {
    return navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
}

export default function PoseVisualizer({ onPoseResults, currentExercise }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [loadingMsg, setLoadingMsg] = useState('REQUESTING CAMERA...');

    const onPoseResultsRef = useRef(onPoseResults);
    useEffect(() => {
        onPoseResultsRef.current = onPoseResults;
    }, [onPoseResults]);

    useEffect(() => {
        let pose;
        let camera;
        let isMounted = true;
        let lastFrameTime = 0;
        const targetFPS = 20;
        const frameInterval = 1000 / targetFPS;

        const init = async () => {
            try {
                const [, cameraStream] = await Promise.all([
                    loadScripts().then(() => {
                        if (isMounted) setLoadingMsg('LOADING AI MODEL...');
                    }),
                    requestCamera()
                ]);

                if (!isMounted) {
                    cameraStream.getTracks().forEach(t => t.stop());
                    return;
                }

                if (videoRef.current) {
                    videoRef.current.srcObject = cameraStream;
                    await videoRef.current.play();
                }

                if (!window.Pose) {
                    console.error("MediaPipe Pose not available");
                    return;
                }

                pose = new window.Pose({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
                });

                pose.setOptions({
                    modelComplexity: 1,
                    smoothLandmarks: true,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5
                });

                pose.onResults((results) => {
                    if (!isMounted || !results.image || !canvasRef.current) return;

                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');

                    canvas.width = videoRef.current.videoWidth || 640;
                    canvas.height = videoRef.current.videoHeight || 480;

                    ctx.save();
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

                    if (results.poseLandmarks) {
                        const connections = [
                            [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
                            [11, 23], [12, 24], [23, 24],
                            [23, 25], [25, 27], [24, 26], [26, 28]
                        ];

                        const skeletonColor = '#00ff88';
                        ctx.strokeStyle = skeletonColor;
                        ctx.lineWidth = 3;
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';

                        ctx.beginPath();
                        connections.forEach(([i, j]) => {
                            const p1 = results.poseLandmarks[i];
                            const p2 = results.poseLandmarks[j];
                            if (p1 && p2 && p1.visibility > 0.1 && p2.visibility > 0.1) {
                                ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
                                ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
                            }
                        });
                        ctx.stroke();

                        if (window.drawLandmarks) {
                            window.drawLandmarks(ctx, results.poseLandmarks, {
                                color: '#ffffff',
                                fillColor: skeletonColor,
                                lineWidth: 1,
                                radius: 2
                            });
                        }

                        if (onPoseResultsRef.current) {
                            onPoseResultsRef.current(results.poseLandmarks);
                        }
                    }
                    ctx.restore();
                });

                await pose.initialize();

                if (!isMounted) return;
                setLoading(false);

                if (window.Camera && videoRef.current) {
                    camera = new window.Camera(videoRef.current, {
                        onFrame: async () => {
                            if (!isMounted) return;
                            const now = Date.now();
                            if (now - lastFrameTime < frameInterval) return;
                            lastFrameTime = now;
                            if (pose) await pose.send({ image: videoRef.current });
                        },
                        width: 640,
                        height: 480
                    });
                    await camera.start();
                }
            } catch (error) {
                console.error("Pose tracker initialization failed:", error);
                if (isMounted) {
                    setLoadingMsg('CAMERA ACCESS DENIED');
                }
            }
        };

        init();

        return () => {
            isMounted = false;
            if (camera) camera.stop();
            if (pose) pose.close();
        };
    }, []);

    return (
        <div className="pose-visualizer-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
            {loading && (
                <div className="pose-loading" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#ff4444',
                    zIndex: 10,
                    fontWeight: '900',
                    letterSpacing: '2px'
                }}>
                    {loadingMsg}
                </div>
            )}
            <video ref={videoRef} className="input-video" playsInline style={{ display: 'none' }} />
            <canvas ref={canvasRef} className="output-canvas" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
    );
}
