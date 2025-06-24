import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomVideoPlayer.css';

const getTapZone = (x, width) => {
  // 0-39%: left, 40-59%: center, 60-100%: right
  if (x < width * 0.4) return 'left';
  if (x > width * 0.6) return 'right';
  return 'middle';
};

const CustomVideoPlayer = ({
  src,
  onNextVideo,
  onShowComments,
  onClose,
  ...props
}) => {
  const containerRef = useRef();
  const videoRef = useRef();
  const navigate = useNavigate();

  // Tap logic
  const [tapCount, setTapCount] = useState(0);
  const tapCountRef = useRef(0);
  const [lastTap, setLastTap] = useState(0);
  const [showOverlay, setShowOverlay] = useState('');
  const tapTimeout = useRef();

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Playback / progress states
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Show/hide play button overlay
  const [showPlayBtn, setShowPlayBtn] = useState(false);

  // Show play button when paused, hide after tap when playing
  useEffect(() => {
    if (!playing) {
      setShowPlayBtn(true);
    } else {
      // Hide after 1s when playing
      const t = setTimeout(() => setShowPlayBtn(false), 1000);
      return () => clearTimeout(t);
    }
  }, [playing]);

  // --- Improved Tap/Click/Touch Handler for Mobile/Desktop ---
  // Use a single tapCount/tapTimeout for both mouse and touch
  const touchData = useRef({ x: 0, y: 0, time: 0 });

  const handleTouchStart = e => {
    if (e.touches && e.touches.length === 1) {
      const touch = e.touches[0];
      touchData.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    }
  };

  const handleTouchEnd = e => {
    if (e.changedTouches && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const dx = Math.abs(touch.clientX - touchData.current.x);
      const dy = Math.abs(touch.clientY - touchData.current.y);
      const dt = Date.now() - touchData.current.time;
      if (dx < 20 && dy < 20 && dt < 500) {
        // Use tapCount for touch as well
        const now = Date.now();
        if (now - lastTap < 400) {
          setTapCount(c => {
            tapCountRef.current = c + 1;
            return c + 1;
          });
        } else {
          setTapCount(1);
          tapCountRef.current = 1;
        }
        setLastTap(now);
        clearTimeout(tapTimeout.current);
        tapTimeout.current = setTimeout(() => {
          const v = videoRef.current;
          const count = tapCountRef.current;
          const rect = containerRef.current.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const zone = getTapZone(x, rect.width);
          if (count === 1) {
            if (zone === 'middle') {
              v.paused ? v.play() : v.pause();
              setShowOverlay(v.paused ? 'pause' : 'play');
            }
          } else if (count === 2) {
            if (zone === 'right') {
              v.currentTime = Math.min(v.duration, v.currentTime + 10);
              setShowOverlay('forward');
            } else if (zone === 'left') {
              v.currentTime = Math.max(0, v.currentTime - 10);
              setShowOverlay('backward');
            }
          } else if (count === 3) {
            if (zone === 'middle') onNextVideo?.();
            if (zone === 'left')   onShowComments?.();
            if (zone === 'right')  navigate('/');
            setShowOverlay(
              zone === 'middle' ? 'next'
              : zone === 'left'   ? 'comments'
              : 'close'
            );
          }
          setTapCount(0);
          tapCountRef.current = 0;
          setTimeout(() => setShowOverlay(''), 350);
        }, 400);
      }
    }
  };

  // --- Improved Tap/Click/Touch Handler ---
  const handleTapEvent = e => {
    let clientX;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const zone = getTapZone(x, rect.width);
    // Mobile: use e.triple/e.double for tap type
    if (e.triple) {
      // Triple tap
      if (zone === 'middle') onNextVideo?.();
      if (zone === 'left')   onShowComments?.();
      if (zone === 'right')  navigate('/');
      setShowOverlay(
        zone === 'middle' ? 'next'
        : zone === 'left'   ? 'comments'
        : 'close'
      );
      setTimeout(() => setShowOverlay(''), 350);
      return;
    }
    if (e.double) {
      // Double tap
      const v = videoRef.current;
      if (zone === 'right') {
        v.currentTime = Math.min(v.duration, v.currentTime + 10);
        setShowOverlay('forward');
      } else if (zone === 'left') {
        v.currentTime = Math.max(0, v.currentTime - 10);
        setShowOverlay('backward');
      }
      setTimeout(() => setShowOverlay(''), 350);
      return;
    }
    // Single tap (desktop or mobile)
    const now = Date.now();
    if (now - lastTap < 400) {
      setTapCount(c => {
        tapCountRef.current = c + 1;
        return c + 1;
      });
    } else {
      setTapCount(1);
      tapCountRef.current = 1;
    }
    setLastTap(now);
    clearTimeout(tapTimeout.current);
    tapTimeout.current = setTimeout(() => {
      const v = videoRef.current;
      const count = tapCountRef.current;
      if (count === 1) {
        if (zone === 'middle') {
          v.paused ? v.play() : v.pause();
          setShowOverlay(v.paused ? 'pause' : 'play');
        }
      } else if (count === 2) {
        if (zone === 'right') {
          v.currentTime = Math.min(v.duration, v.currentTime + 10);
          setShowOverlay('forward');
        } else if (zone === 'left') {
          v.currentTime = Math.max(0, v.currentTime - 10);
          setShowOverlay('backward');
        }
      } else if (count === 3) {
        if (zone === 'middle') onNextVideo?.();
        if (zone === 'left')   onShowComments?.();
        if (zone === 'right')  navigate('/');
        setShowOverlay(
          zone === 'middle' ? 'next'
          : zone === 'left'   ? 'comments'
          : 'close'
        );
      }
      setTapCount(0);
      tapCountRef.current = 0;
      setTimeout(() => setShowOverlay(''), 350);
    }, 400);
  };

  // Video event listeners
  useEffect(() => {
    const v = videoRef.current;
    const onLoaded = () => setDuration(v.duration);
    const onTimeUpdate = () => setCurrentTime(v.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    v.addEventListener('loadedmetadata', onLoaded);
    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    return () => {
      v.removeEventListener('loadedmetadata', onLoaded);
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
    };
  }, []);

  // Seek via progress bar click
  const handleProgressClick = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    videoRef.current.currentTime = (clickX / rect.width) * duration;
  };

  // Volume change
  const handleVolumeChange = e => {
    const v = parseFloat(e.target.value);
    videoRef.current.volume = v;
    setVolume(v);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) containerRef.current.requestFullscreen?.();
    else document.exitFullscreen?.();
  };
  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // Cleanup
  useEffect(() => () => clearTimeout(tapTimeout.current), []);

  // Format time mm:ss
  const fmt = t => {
    const m = Math.floor(t/60).toString().padStart(2,'0');
    const s = Math.floor(t%60).toString().padStart(2,'0');
    return `${m}:${s}`;
  };

  // Prevent native dblclick fullscreen
  const handleDoubleClick = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      ref={containerRef}
      className="custom-video-player"
      onClick={handleTapEvent}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
    >
      <video
        ref={videoRef}
        src={src}
        className="custom-video"
        playsInline
        disablePictureInPicture
        {...props}
      />

      {/* Center Play/Pause Button Overlay */}
      {showPlayBtn && (
        <button
          className="center-play-btn"
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            if (playing) {
              videoRef.current.pause();
            } else {
              videoRef.current.play();
            }
          }}
        >
          {playing ? '❚❚' : '►'}
        </button>
      )}

      {showOverlay && <div className={`overlay ${showOverlay}`} />}

      {/* Controls bar */}
      <div className="controls-bar">
        <button
          className="ctrl-btn"
          onClick={() => {
            playing ? videoRef.current.pause() : videoRef.current.play();
          }}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? '❚❚' : '►'}
        </button>

        <div className="time-display">
          {fmt(currentTime)} / {fmt(duration)}
        </div>

        <div
          className="progress-container"
          onClick={handleProgressClick}
        >
          <div
            className="progress"
            style={{ width: `${(currentTime/duration)*100}%` }}
          />
        </div>

        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
          aria-label="Volume"
        />

        <button
          className="fs-btn"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? '🡸' : '🡺'}
        </button>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;