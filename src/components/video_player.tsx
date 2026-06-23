import { useRef, useState, useEffect, useCallback } from "react";
import Hls from "hls.js";
import "./video_player.css";

interface videoPlayerProps {
  videoUrl: string;
  videoPoster: string | undefined;
  gameBackground: string;
}

export default function VideoPlayer({
  videoUrl,
  videoPoster,
  gameBackground,
}: videoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.01);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    if (Hls.isSupported()) {
      const hls = new Hls({
        autoStartLoad: true,
        startLevel: -1,
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      video.volume = volume;
      return () => {
        hls.destroy();
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
      };
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      video.play().catch(() => {});
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      return () => {
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
      };
    }

    video.src = videoUrl;
    video.play().catch(() => {});
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [videoUrl]);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleProgressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = parseFloat(e.target.value);
      setCurrentTime(time);
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    [],
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const vol = parseFloat(e.target.value);
      setVolume(vol);
      if (videoRef.current) {
        videoRef.current.volume = vol;
      }
    },
    [],
  );

  const handleMuteChange = () => {
    if (isMuted) {
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  };

  const handleFullscreen = useCallback(() => {
    if (videoContainerRef.current) {
      if (!isFullscreen) {
        videoContainerRef.current.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    }
  }, [isFullscreen]);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="video-container" ref={videoContainerRef}>
      <video
        ref={videoRef}
        autoPlay
        muted={isMuted}
        loop
        playsInline
        poster={videoPoster || gameBackground}
        className="game-trailer"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      >
        {videoUrl ? (
          <source src={videoUrl} type="application/x-mpegURL" />
        ) : null}
        Tu navegador no soporta este reproductor de video.
      </video>

      <div className="video-controls">
        <div className="progress-container">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="progress-slider"
          />
        </div>

        <div className="controls-bottom">
          <div className="left-controls">
            <button
              className="control-button"
              onClick={handlePlayPause}
              title={isPlaying ? "Pausar" : "Reproducir"}
            >
              <span className="material-symbols-outlined">
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>

            <div className="volume-control">
              <span
                onClick={handleMuteChange}
                className="material-symbols-outlined volume-icon"
              >
                {isMuted ? "volume_off" : "volume_up"}
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
            </div>

            <span className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button
            className="control-button fullscreen-btn"
            onClick={handleFullscreen}
            title={
              isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
            }
          >
            <span className="material-symbols-outlined">
              {isFullscreen ? "fullscreen_exit" : "fullscreen"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
