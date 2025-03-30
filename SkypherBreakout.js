import { useEffect, useRef, useState } from "react";

const BRICK_WIDTH = 30;
const BRICK_HEIGHT = 15;
const PADDING = 2;
const COLUMNS = 70;
const ROWS = 20;
const CANVAS_WIDTH = BRICK_WIDTH * COLUMNS;
const CANVAS_HEIGHT = BRICK_HEIGHT * ROWS + 200;

const BALL_RADIUS = 6;
const PADDLE_WIDTH = 120;
const PADDLE_HEIGHT = 10;
const PADDLE_Y = CANVAS_HEIGHT - 40;

const BRICKS_LAYOUT = new Array(ROWS).fill(0).map(() => new Array(COLUMNS).fill(0));

function writeWordOnBricks(word, rowStart = 3, colStart = 5) {
  const letterSpacing = 7;
  const LETTERS = {
    S: ["111", "100", "111", "001", "111"],
    K: ["101", "101", "110", "101", "101"],
    Y: ["101", "101", "111", "001", "001"],
    P: ["111", "101", "111", "100", "100"],
    H: ["101", "101", "111", "101", "101"],
    E: ["111", "100", "111", "100", "111"],
    R: ["111", "101", "111", "110", "101"]
  };

  word.split("").forEach((char, idx) => {
    const pattern = LETTERS[char.toUpperCase()];
    pattern.forEach((line, row) => {
      [...line].forEach((cell, col) => {
        if (cell === "1") {
          const y = rowStart + row;
          const x = colStart + idx * letterSpacing + col;
          if (y < ROWS && x < COLUMNS) BRICKS_LAYOUT[y][x] = 1;
        }
      });
    });
  });
}

writeWordOnBricks("SKYPHER");

export default function SkypherBreakout() {
  const canvasRef = useRef(null);
  const [paddleX, setPaddleX] = useState(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [ball, setBall] = useState({ x: CANVAS_WIDTH / 2, y: PADDLE_Y - 10, dx: 3, dy: -3 });
  const [bricks, setBricks] = useState(() => JSON.parse(JSON.stringify(BRICKS_LAYOUT)));
  const [win, setWin] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrame;

    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw bricks
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLUMNS; col++) {
          if (bricks[row][col]) {
            const x = col * BRICK_WIDTH + PADDING;
            const y = row * BRICK_HEIGHT + PADDING;
            ctx.fillStyle = "#141B61";
            ctx.fillRect(x, y, BRICK_WIDTH - PADDING * 2, BRICK_HEIGHT - PADDING * 2);
          }
        }
      }

      // Draw paddle
      ctx.fillStyle = "#161864";
      ctx.fillRect(paddleX, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = "#141B61";
      ctx.fill();
      ctx.closePath();
    };

    const update = () => {
      let { x, y, dx, dy } = ball;

      // Bounce on walls
      if (x + dx < BALL_RADIUS || x + dx > CANVAS_WIDTH - BALL_RADIUS) dx = -dx;
      if (y + dy < BALL_RADIUS) dy = -dy;

      // Paddle collision
      if (y + dy > PADDLE_Y - BALL_RADIUS && x > paddleX && x < paddleX + PADDLE_WIDTH) {
        dy = -dy;
      }

      // Brick collisions
      const brickRow = Math.floor(y / BRICK_HEIGHT);
      const brickCol = Math.floor(x / BRICK_WIDTH);
      if (brickRow >= 0 && brickRow < ROWS && brickCol >= 0 && brickCol < COLUMNS && bricks[brickRow][brickCol]) {
        const newBricks = JSON.parse(JSON.stringify(bricks));
        newBricks[brickRow][brickCol] = 0;
        setBricks(newBricks);
        dy = -dy;
        const remaining = newBricks.flat().some(cell => cell === 1);
        if (!remaining) {
          setWin(true);
        }
      }

      // Game over
      if (y + dy > CANVAS_HEIGHT) {
        setBall({ x: CANVAS_WIDTH / 2, y: PADDLE_Y - 10, dx: 3, dy: -3 });
        setBricks(JSON.parse(JSON.stringify(BRICKS_LAYOUT)));
        return;
      }

      setBall({ x: x + dx, y: y + dy, dx, dy });
    };

    const gameLoop = () => {
      draw();
      update();
      animationFrame = requestAnimationFrame(gameLoop);
    };

    animationFrame = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrame);
  }, [ball, paddleX, bricks]);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;

    setPaddleX(Math.min(Math.max(mouseX - PADDLE_WIDTH / 2, 0), CANVAS_WIDTH - PADDLE_WIDTH));
  };

  return (
    <div onMouseMove={handleMouseMove}>
      <img
          src="https://cdn.prod.website-files.com/5efe96a2310d7d72045afbda/5f11488f28e771493371b1c9_logoskypherblanc.png"
          alt="Skypher Logo"
          style={{ width: '10em', height: 'auto', marginBottom: '0.5rem', padding: '0.5rem', position: 'absolute', top: '0', left: '0', zIndex: '1000', backgroundColor: "#141B61" }}
        />
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        
        <h1>Break the Skypher!</h1>
        <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#555' }}>
          Tired of security questionnaires? Break them down with Skypher! 💥
        </p>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          display: 'block',
          maxWidth: '100%',
          height: 'auto',
          margin: '0 auto',
          border: '1px solid #ccc',
          boxSizing: 'border-box',
        }}
      />
            {win && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h2>🎉 Well done!</h2>
          <p>You’ve broken through the security wall.</p>
          <a
            href="mailto:aurelien.llorca@gmail.com"
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#3B82F6',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Let’s talk!
          </a>
        </div>
      )}
      <p style={{ textAlign: 'center' }}>Use your mouse to move the paddle and break all the letters! 🎯</p>
    </div>
  );
}