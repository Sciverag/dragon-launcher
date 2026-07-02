import { useRef, useState, useEffect, useCallback } from "react";
import Hls from "hls.js";
import "./video_player.css";

interface videoPlayerProps {
  videoUrl: string;
  videoPoster: string | undefined;
  gameBackground: string;
  accentColor?: string;
}

export default function VideoPlayer({
  videoUrl,
  videoPoster,
  gameBackground,
  accentColor = "#8B4513",
}: videoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.01);
  const [isMuted, setIsMuted] = useState(false);
  const [, setFrameAccentColor] = useState(accentColor);
  const [haloAccentColor, setHaloAccentColor] = useState(accentColor);
  const [haloBackdropUrl, setHaloBackdropUrl] = useState<string | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const lastColorSampleRef = useRef(0);
  const accentColorRef = useRef(accentColor);
  const volumeRef = useRef(volume);
  const haloTransitionRef = useRef<number | null>(null);

  const toRgba = useCallback((hex: string, alpha: number) => {
    const color = hex.trim();

    if (!color.startsWith("#")) {
      return `rgba(255, 255, 255, ${alpha})`;
    }

    const normalizedHex = color.slice(1);
    const parsedHex =
      normalizedHex.length === 3
        ? normalizedHex
            .split("")
            .map((value) => value + value)
            .join("")
        : normalizedHex;

    if (parsedHex.length !== 6) {
      return `rgba(255, 255, 255, ${alpha})`;
    }

    const red = Number.parseInt(parsedHex.slice(0, 2), 16);
    const green = Number.parseInt(parsedHex.slice(2, 4), 16);
    const blue = Number.parseInt(parsedHex.slice(4, 6), 16);

    if ([red, green, blue].some(Number.isNaN)) {
      return `rgba(255, 255, 255, ${alpha})`;
    }

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }, []);

  const accentRgba = useCallback(
    (alpha: number) => {
      const hex = haloAccentColor.trim();

      if (!hex.startsWith("#")) {
        return `rgba(255, 255, 255, ${alpha})`;
      }

      return toRgba(hex, alpha);
    },
    [haloAccentColor, toRgba],
  );

  const getProgressFill = useCallback(
    (progress: number) => {
      const clampedProgress = Math.max(0, Math.min(100, progress));

      return `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${clampedProgress}%, rgba(255, 255, 255, 0.18) ${clampedProgress}%, rgba(255, 255, 255, 0.18) 100%)`;
    },
    [accentColor],
  );

  const interpolateColor = useCallback(
    (from: string, to: string, factor: number) => {
      const parseHex = (color: string) => {
        const normalized = color.trim().replace("#", "");
        const hex =
          normalized.length === 3
            ? normalized
                .split("")
                .map((value) => value + value)
                .join("")
            : normalized;

        if (hex.length !== 6) {
          return [255, 255, 255] as const;
        }

        return [
          Number.parseInt(hex.slice(0, 2), 16),
          Number.parseInt(hex.slice(2, 4), 16),
          Number.parseInt(hex.slice(4, 6), 16),
        ] as const;
      };

      const [fromRed, fromGreen, fromBlue] = parseHex(from);
      const [toRed, toGreen, toBlue] = parseHex(to);
      const red = Math.round(fromRed + (toRed - fromRed) * factor);
      const green = Math.round(fromGreen + (toGreen - fromGreen) * factor);
      const blue = Math.round(fromBlue + (toBlue - fromBlue) * factor);
      const toHex = (value: number) => value.toString(16).padStart(2, "0");

      return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
    },
    [],
  );

  const sampleFrameColor = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      setFrameAccentColor(accentColorRef.current);
      return;
    }

    const now = Date.now();
    if (now - lastColorSampleRef.current < 250) return;
    lastColorSampleRef.current = now;

    const canvas = document.createElement("canvas");
    const width = 80;
    const height = 45;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, width, height);
    const { data } = context.getImageData(0, 0, width, height);
    const buckets = new Map<
      string,
      { count: number; r: number; g: number; b: number }
    >();

    for (let index = 0; index < data.length; index += 16) {
      const alpha = data[index + 3];
      if (alpha < 120) continue;

      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const quantizedRed = Math.round(red / 32) * 32;
      const quantizedGreen = Math.round(green / 32) * 32;
      const quantizedBlue = Math.round(blue / 32) * 32;
      const key = `${quantizedRed}-${quantizedGreen}-${quantizedBlue}`;
      const existingBucket = buckets.get(key);

      if (existingBucket) {
        existingBucket.count += 1;
        existingBucket.r += red;
        existingBucket.g += green;
        existingBucket.b += blue;
      } else {
        buckets.set(key, { count: 1, r: red, g: green, b: blue });
      }
    }

    if (buckets.size === 0) return;

    const dominantBucket = [...buckets.values()].sort((left, right) => {
      const leftBrightness = left.r * 0.299 + left.g * 0.587 + left.b * 0.114;
      const rightBrightness =
        right.r * 0.299 + right.g * 0.587 + right.b * 0.114;
      return right.count - left.count || rightBrightness - leftBrightness;
    })[0];

    const red = Math.round(dominantBucket.r / dominantBucket.count);
    const green = Math.round(dominantBucket.g / dominantBucket.count);
    const blue = Math.round(dominantBucket.b / dominantBucket.count);

    const toHex = (value: number) => value.toString(16).padStart(2, "0");
    const sampledColor = `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
    setFrameAccentColor(sampledColor);

    const backdropCanvas = document.createElement("canvas");
    backdropCanvas.width = 320;
    backdropCanvas.height = 180;
    const backdropContext = backdropCanvas.getContext("2d");
    if (backdropContext) {
      backdropContext.filter = "blur(20px) saturate(1.35) brightness(1.2)";
      backdropContext.drawImage(
        video,
        0,
        0,
        backdropCanvas.width,
        backdropCanvas.height,
      );
      setHaloBackdropUrl(backdropCanvas.toDataURL("image/png"));
    }

    if (haloTransitionRef.current) {
      window.clearTimeout(haloTransitionRef.current);
    }

    const previousColor = haloAccentColor;
    const steps = 10;
    let step = 0;

    const animateHaloColor = () => {
      if (step > steps) return;
      const factor = step / steps;
      const nextColor = interpolateColor(previousColor, sampledColor, factor);
      setHaloAccentColor(nextColor);
      step += 1;
      haloTransitionRef.current = window.setTimeout(animateHaloColor, 30);
    };

    animateHaloColor();
  }, [haloAccentColor, interpolateColor]);

  useEffect(() => {
    accentColorRef.current = accentColor;
  }, [accentColor]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

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
      video.volume = volumeRef.current;
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
      sampleFrameColor();
    }
  }, [sampleFrameColor]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      sampleFrameColor();
    }
  }, [sampleFrameColor]);

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

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="video-container"
      ref={videoContainerRef}
      style={{
        ["--video-accent" as never]: accentColor,
        ["--video-accent-soft" as never]: accentRgba(0.62),
        ["--video-accent-strong" as never]: accentRgba(0.95),
        ["--video-halo-background" as never]: haloBackdropUrl
          ? `url("${haloBackdropUrl}")`
          : "none",
      }}
    >
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
        onPlaying={sampleFrameColor}
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
            step="0.001"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="progress-slider"
            style={{
              background: getProgressFill(
                duration > 0 ? (currentTime / duration) * 100 : 0,
              ),
            }}
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
                style={{
                  background: getProgressFill(volume * 100),
                }}
              />
            </div>

            <span className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
