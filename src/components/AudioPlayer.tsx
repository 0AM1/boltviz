import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { initVisualizer } from '../utils/visualizer';

const songs = [
  {
    title: "astrix - git",
    url: "https://github.com/0AM1/boltviz/raw/refs/heads/main/src/public/track1.mp3"
  },
  {
    title: "track - drive",
    url: "https://drive.google.com/file/d/1vcD7P1o6-3NcgcdmQTNfYuf5UwDHPY64/view?usp=share_link"
  }
];

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaElementSource(audioRef.current);
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    
    source.connect(analyzer);
    analyzer.connect(audioContext.destination);
    analyzerRef.current = analyzer;

    initVisualizer(canvasRef.current, analyzer);

    return () => {
      audioContext.close();
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    
    const updateProgress = () => {
      if (!audioRef.current) return;
      const value = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(value || 0);
    };

    audioRef.current.addEventListener('timeupdate', updateProgress);
    return () => audioRef.current?.removeEventListener('timeupdate', updateProgress);
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentSong((prev) => (prev + 1) % songs.length);
  };

  const handlePrev = () => {
    setCurrentSong((prev) => (prev - 1 + songs.length) % songs.length);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = (parseInt(e.target.value) / 100) * audioRef.current.duration;
    audioRef.current.currentTime = time;
    setProgress(parseInt(e.target.value));
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl">
      <canvas 
        ref={canvasRef} 
        className="w-full h-48 mb-6 rounded-lg bg-black/20"
      />
      
      <audio
        ref={audioRef}
        src={songs[currentSong].url}
        onEnded={handleNext}
      />

      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white">{songs[currentSong].title}</h2>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="range"
          value={progress}
          onChange={handleProgressChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="flex justify-center items-center gap-6">
        <button
          onClick={handlePrev}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <SkipBack className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={togglePlay}
          className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <Play className="w-8 h-8 text-white" />
          )}
        </button>

        <button
          onClick={handleNext}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <SkipForward className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
