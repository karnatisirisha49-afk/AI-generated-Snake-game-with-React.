import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';

const TRACKS = [
  { id: '0x01', title: 'AI_GEN_DIRGE_v1.wav', src: 'https://actions.google.com/sounds/v1/science_fiction/sci_fi_drone.ogg' },
  { id: '0x02', title: 'SYNTHETIC_PULSE.mp3', src: 'https://actions.google.com/sounds/v1/science_fiction/alien_breath.ogg' },
  { id: '0x03', title: 'VOID_RESONANCE.flac', src: 'https://actions.google.com/sounds/v1/science_fiction/space_wind.ogg' }
];

export default function MusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Audio play blocked by browser:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack, volume]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  
  const handleSkip = (dir: number) => {
    setCurrentTrack((prev) => {
      let next = prev + dir;
      if (next >= TRACKS.length) next = 0;
      if (next < 0) next = TRACKS.length - 1;
      return next;
    });
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col gap-6 font-mono">
      {/* Current Track Display */}
      <div className="bg-magenta text-black p-4 border-4 border-cyan relative overflow-hidden">
        <div className="absolute top-0 right-0 w-8 h-full bg-black/20 skew-x-12 transform translate-x-4"></div>
        <p className="text-sm font-bold mb-1 uppercase tracking-widest">ACTIVE_STREAM_ID: {TRACKS[currentTrack].id}</p>
        <p className="text-2xl font-bold truncate">
          {TRACKS[currentTrack].title}
        </p>
        <div className="w-full h-2 bg-black mt-4 relative">
          <div className={`absolute top-0 left-0 h-full bg-cyan ${isPlaying ? 'animate-pulse w-full' : 'w-0'} transition-all duration-1000`}></div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center border-4 border-magenta bg-black p-2">
        <button onClick={() => handleSkip(-1)} className="text-magenta hover:text-cyan hover:bg-magenta/20 p-2 transition-colors focus:outline-none cursor-pointer">
          <SkipBack size={32} />
        </button>
        <button onClick={handlePlayPause} className="text-black bg-cyan hover:bg-magenta transition-colors focus:outline-none p-4 cursor-pointer shadow-[4px_4px_0px_#ff00ff] hover:shadow-[4px_4px_0px_#00ffff] active:translate-y-1 active:shadow-none">
          {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </button>
        <button onClick={() => handleSkip(1)} className="text-magenta hover:text-cyan hover:bg-magenta/20 p-2 transition-colors focus:outline-none cursor-pointer">
          <SkipForward size={32} />
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-4 bg-black border-2 border-cyan p-3">
        <Volume2 size={24} className="text-cyan" />
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.05" 
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full h-4 bg-magenta/20 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-cyan [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black"
        />
      </div>

      {/* Tracklist */}
      <div className="mt-2 text-base">
        <p className="bg-cyan text-black font-bold px-2 py-1 inline-block mb-3">AVAILABLE_STREAMS:</p>
        <ul className="space-y-3 border-l-2 border-magenta pl-4">
          {TRACKS.map((t, idx) => (
            <li 
              key={t.id} 
              className={`cursor-pointer transition-colors flex items-center gap-2 ${idx === currentTrack ? 'text-cyan font-bold text-lg' : 'text-magenta/70 hover:text-magenta'}`} 
              onClick={() => { setCurrentTrack(idx); setIsPlaying(true); }}
            >
              <span className="text-xs opacity-50">[{t.id}]</span> 
              {idx === currentTrack && <span className="animate-pulse">►</span>}
              {t.title}
            </li>
          ))}
        </ul>
      </div>

      <audio 
        ref={audioRef} 
        src={TRACKS[currentTrack].src} 
        onEnded={() => handleSkip(1)}
        loop={false}
      />
    </div>
  );
}
