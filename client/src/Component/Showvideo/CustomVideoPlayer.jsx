import React, { useRef, useEffect, useState } from 'react';
import './CustomVideoPlayer.css';

const CustomVideoPlayer = ({
  src,
  onNextVideo,
  onShowComments,
  onClose,
  ...props
}) => {
  const containerRef = useRef();
  const videoRef = useRef();

  // Tap logic
  const [tapCount, setTapCount] = useState(0);
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

  // Prevent native dblclick fullscreen
  const handleDoubleClick = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Tap handler (1×,2×,3×)
  const handleTap = e => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // Divide the area into 3 equal zones: left, middle, right
    const leftZone = rect.width * (1 / 3);
    const rightZone = rect.width * (2 / 3);
    let zone = '';
    if (x < leftZone) zone = 'left';
    else if (x > rightZone) zone = 'right';
    else zone = 'middle';
    const now = Date.now();
    if (now - lastTap < 400) setTapCount(c => c + 1);
    else setTapCount(1);
    setLastTap(now);

    clearTimeout(tapTimeout.current);
    tapTimeout.current = setTimeout(() => {
      const v = videoRef.current;
      if (tapCount === 1 && zone === 'middle') {
        v.paused ? v.play() : v.pause();
        setShowOverlay('pause');
      } else if (tapCount === 2) {
        if (zone === 'right') {
          v.currentTime = Math.min(v.duration, v.currentTime + 10);
          setShowOverlay('forward');
        } else if (zone === 'left') {
          v.currentTime = Math.max(0, v.currentTime - 10);
          setShowOverlay('backward');
        }
      } else if (tapCount === 3) {
        if (zone === 'middle') onNextVideo?.();
        if (zone === 'left')   onShowComments?.();
        if (zone === 'right')  onClose?.();
        setShowOverlay(
          zone === 'middle' ? 'next'
          : zone === 'left'   ? 'comments'
          : 'close'
        );
      }
      setTapCount(0);
      setTimeout(() => setShowOverlay(''), 300);
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

  return (
    <div
      ref={containerRef}
      className="custom-video-player"
      onClick={handleTap}
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