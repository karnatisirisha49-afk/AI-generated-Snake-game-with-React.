import React, { useState, useEffect } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  const [score, setScore] = useState(0);
  const [sysCode, setSysCode] = useState('0x0000');

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        setSysCode(`0x${Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0')}`);
      }
    }, 500);
    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-cyan font-mono relative flex flex-col items-center justify-center p-4 screen-tear">
      <div className="scanlines"></div>
      <div className="static-noise"></div>
      <div className="crt-flicker absolute inset-0 bg-magenta/5 mix-blend-overlay"></div>

      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-end border-b-4 border-magenta pb-4 mb-6 z-10">
        <div>
          <h1 className="text-5xl md:text-7xl font-bold glitch" data-text="NEURO_SNAKE_OS">NEURO_SNAKE_OS</h1>
          <p className="text-lg md:text-xl text-magenta mt-2 bg-cyan text-black inline-block px-2 font-bold">
            SYS_CODE: {sysCode} // UPLINK_ESTABLISHED
          </p>
        </div>
        <div className="text-right border-l-4 border-cyan pl-4">
          <p className="text-xl md:text-2xl text-magenta">PACKETS_CONSUMED</p>
          <p className="text-5xl md:text-6xl font-bold glitch text-cyan" data-text={score.toString().padStart(4, '0')}>
            {score.toString().padStart(4, '0')}
          </p>
        </div>
      </header>

      {/* Main Interface */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-6 z-10">
        {/* Left Panel: Audio Subsystem */}
        <div className="col-span-1 lg:col-span-1 border-4 border-magenta bg-black shadow-[8px_8px_0px_#00ffff] p-4 h-fit relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-cyan animate-pulse"></div>
          <h2 className="text-2xl border-b-2 border-cyan pb-2 mb-4 text-magenta glitch font-bold" data-text="AUDIO_CTRL">AUDIO_CTRL</h2>
          <MusicPlayer />
        </div>

        {/* Center/Right Panel: Game Canvas */}
        <div className="col-span-1 lg:col-span-3 border-4 border-cyan bg-black shadow-[8px_8px_0px_#ff00ff] p-2 flex justify-center items-center relative group">
          <div className="absolute top-0 right-0 w-2 h-full bg-magenta animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-magenta animate-pulse"></div>
          <SnakeGame onScoreChange={setScore} />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mt-8 text-center text-sm text-magenta bg-cyan/10 border border-magenta p-2 z-10 uppercase tracking-widest">
        <span className="glitch" data-text="WARNING: SYNAPTIC OVERLOAD IMMINENT.">WARNING: SYNAPTIC OVERLOAD IMMINENT.</span>
      </footer>
    </div>
  );
}
