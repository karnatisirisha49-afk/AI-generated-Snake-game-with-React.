import React, { useEffect, useRef, useState, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20; // Internal resolution multiplier
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const MOVE_INTERVAL = 100; // ms per tick

type Point = { x: number; y: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string };

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
}

export default function SnakeGame({ onScoreChange }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(0);

  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Mutable game state for requestAnimationFrame loop
  const gameState = useRef({
    snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
    dir: { x: 0, y: -1 },
    nextDir: { x: 0, y: -1 },
    food: { x: 5, y: 5 },
    particles: [] as Particle[],
    shake: 0,
    score: 0
  });

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      isOccupied = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }
    return newFood!;
  }, []);

  const spawnParticles = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        maxLife: 0.5 + Math.random() * 0.5,
        color
      });
    }
    gameState.current.particles.push(...newParticles);
  };

  const resetProtocol = useCallback(() => {
    gameState.current = {
      snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
      dir: { x: 0, y: -1 },
      nextDir: { x: 0, y: -1 },
      food: generateFood([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]),
      particles: [],
      shake: 0,
      score: 0
    };
    onScoreChange(0);
    setGameOver(false);
    setIsPaused(false);
    setHasStarted(true);
    lastMoveTimeRef.current = performance.now();
  }, [generateFood, onScoreChange]);

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ') {
        if (gameOver) resetProtocol();
        else if (!hasStarted) resetProtocol();
        else setIsPaused(p => !p);
        return;
      }

      if (gameOver || isPaused || !hasStarted) return;

      const { dir } = gameState.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (dir.y !== 1) gameState.current.nextDir = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (dir.y !== -1) gameState.current.nextDir = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (dir.x !== 1) gameState.current.nextDir = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (dir.x !== -1) gameState.current.nextDir = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused, hasStarted, resetProtocol]);

  // Game Loop
  const update = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const deltaTime = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    const state = gameState.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!ctx || !canvas) return;

    // Update Particles
    state.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= deltaTime;
    });
    state.particles = state.particles.filter(p => p.life > 0);

    // Update Shake
    if (state.shake > 0) {
      state.shake -= deltaTime * 30;
      if (state.shake < 0) state.shake = 0;
    }

    // Update Snake (Physics tick)
    if (hasStarted && !isPaused && !gameOver && time - lastMoveTimeRef.current > MOVE_INTERVAL) {
      lastMoveTimeRef.current = time;
      
      state.dir = state.nextDir;
      const head = state.snake[0];
      const newHead = { x: head.x + state.dir.x, y: head.y + state.dir.y };

      // Collision detection
      if (
        newHead.x < 0 || newHead.x >= GRID_SIZE ||
        newHead.y < 0 || newHead.y >= GRID_SIZE ||
        state.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setGameOver(true);
        state.shake = 15; // Trigger massive screen shake
        spawnParticles(head.x, head.y, '#ff00ff');
      } else {
        state.snake.unshift(newHead);

        // Food detection
        if (newHead.x === state.food.x && newHead.y === state.food.y) {
          state.score += 10;
          onScoreChange(state.score);
          spawnParticles(state.food.x, state.food.y, '#00ffff');
          state.food = generateFood(state.snake);
          state.shake = 3; // Small shake on eat
        } else {
          state.snake.pop();
        }
      }
    }

    // Render
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.save();
    
    // Apply Shake
    if (state.shake > 0) {
      const dx = (Math.random() - 0.5) * state.shake;
      const dy = (Math.random() - 0.5) * state.shake;
      ctx.translate(dx, dy);
    }

    // Draw Grid
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_SIZE, i); ctx.stroke();
    }

    // Draw Food
    ctx.fillStyle = '#ff00ff';
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 15;
    ctx.fillRect(state.food.x * CELL_SIZE + 2, state.food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    ctx.shadowBlur = 0;

    // Draw Snake
    state.snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#00ffff' : '#00aaaa';
      if (index === 0) {
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
    ctx.shadowBlur = 0;

    // Draw Particles
    state.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillRect(p.x, p.y, 4, 4);
    });
    ctx.globalAlpha = 1.0;

    ctx.restore();

    requestRef.current = requestAnimationFrame(update);
  }, [gameOver, isPaused, hasStarted, generateFood, onScoreChange]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update]);

  return (
    <div className="relative w-full aspect-square max-w-[800px] bg-black border-4 border-magenta outline-none focus:border-cyan transition-colors" tabIndex={0}>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="w-full h-full block"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Overlays */}
      {!hasStarted && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
          <h3 className="text-5xl text-cyan glitch mb-6 font-bold" data-text="AWAITING_INPUT">AWAITING_INPUT</h3>
          <p className="text-magenta text-2xl animate-pulse">PRESS [SPACE] TO INITIATE</p>
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-red-900/40 flex flex-col items-center justify-center z-20 backdrop-blur-md border-8 border-red-500">
          <h3 className="text-6xl text-white glitch mb-4 font-bold" data-text="SYSTEM_FAILURE">SYSTEM_FAILURE</h3>
          <p className="text-cyan mb-8 text-2xl bg-black px-4 py-2 border border-cyan">DATA_CORRUPTION_DETECTED</p>
          <button 
            onClick={resetProtocol}
            className="px-8 py-4 bg-magenta text-black hover:bg-cyan transition-colors font-bold uppercase tracking-widest text-2xl border-4 border-black shadow-[4px_4px_0px_#000]"
          >
            EXECUTE_REBOOT
          </button>
        </div>
      )}

      {isPaused && !gameOver && hasStarted && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
          <h3 className="text-5xl text-magenta bg-black px-6 py-2 border-4 border-magenta animate-pulse font-bold tracking-widest">
            STASIS_MODE
          </h3>
        </div>
      )}
    </div>
  );
}
