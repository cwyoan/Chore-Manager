import React, { useRef, useEffect, useState } from "react";
import Logic from "../../../backend/games/flappy/Logic";

const GamePlay = ({onExit}) => {
    const canvasRef = useRef(null);
    const logicRef = useRef(null);
    const flapRef = useRef(false);

    const [score, setScore] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const [hasStarted, setHasStarted] = useState(false);

    const spriteWidth = 0.05;
    const spriteHeight = 0.1;
    const pipeWidth = 0.1;

    useEffect(() => {
        if (!hasStarted) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        logicRef.current = new Logic(spriteWidth, spriteHeight, pipeWidth);

        const flapHandler = (e) => {
            if (e.code === "Space") {
                flapRef.current = true;
            }
        };
        window.addEventListener("keydown", flapHandler);
        window.addEventListener("mousedown", flapHandler);

        let animationFrameId;

        const render = () => {
            const logic = logicRef.current;
            const continueGame = logic.Update(flapRef.current);
            flapRef.current = false;

            ctx.fillStyle = "#3ac9ff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const [x, y] = logic.GetPlayer();
            const playerX = x * canvas.width;
            const playerY = y * canvas.height;
            const playerWidth = spriteWidth * canvas.width;
            const playerHeight = spriteHeight * canvas.height;

            ctx.fillStyle = "purple";
            ctx.beginPath();
            ctx.ellipse(playerX, playerY, playerWidth / 2, playerHeight / 2, 0, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = "green";
            for (const pipe of logic.GetPipes()) {
                const pipeX = pipe.pos[0] * canvas.width;
                const pipeY = pipe.pos[1] * canvas.height;
                const gap = pipe.gap * canvas.height;
                const pipeW = pipeWidth * canvas.width;

                // Top pipe
                ctx.fillRect(pipeX - pipeW / 2, 0, pipeW, pipeY - gap / 2);
                // Bottom pipe
                ctx.fillRect(pipeX - pipeW / 2, pipeY + gap / 2, pipeW, canvas.height - pipeY);
            }

            setScore(logic.GetScore());

            if (continueGame) {
                ctx.fillStyle = "white";
                ctx.font = "bold 48px sans-serif";
                ctx.fillText(`Score: ${logic.GetScore()}`, 50, 60);
                animationFrameId = requestAnimationFrame(render);
            } else {
                setIsRunning(false);
            }
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("keydown", flapHandler);
            window.removeEventListener("mousedown", flapHandler);
        };
    }, [hasStarted]);

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "#3ac9ff",
                zIndex: 999,
            }}
        >
            {!hasStarted && (
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    zIndex: 1000,
                    color: "white"
                }}>
                    <h1>Flappy</h1>
                    <button onClick={() => setHasStarted(true)} className="play-game-button">Start Game</button>
                </div>
            )}

            {hasStarted && <canvas ref={canvasRef} style={{ display: "block" }} />}
            {!isRunning && hasStarted && (
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "red",
                    fontSize: "32px",
                    fontWeight: "bold",
                    textAlign: "center",
                    zIndex: 1000
                }}>
                    <h1>Game Over</h1>
                    <p>Score: {score}</p>
                    <button onClick={() => onExit(score)} className="play-game-button">Exit to Dashboard</button>
                </div>
            )}
        </div>
    );
};

export default GamePlay;
