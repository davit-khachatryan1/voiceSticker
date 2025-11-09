'use client';

import { useState, useRef, useEffect } from 'react';
import { AudioRecorder, RecordingState } from '@/lib/recorder';

interface RecordButtonProps {
  onRecordStart: () => void;
  onRecordStop: (state: RecordingState) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export function RecordButton({
  onRecordStart,
  onRecordStop,
  onCancel,
  disabled = false,
}: RecordButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const touchStartY = useRef<number>(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.stop();
        recorderRef.current.reset();
      }
    };
  }, []);

  const handleStart = async () => {
    if (disabled) return;

    try {
      cancelledRef.current = false;
      setIsPressed(true);
      setIsRecording(true);
      setDuration(0);

      const recorder = new AudioRecorder((state) => {
        setIsRecording(state.isRecording);
        setDuration(state.duration);
        
        if (!state.isRecording && state.audioBlob && !cancelledRef.current) {
          onRecordStop(state);
        }
      });

      recorderRef.current = recorder;
      await recorder.start();
      onRecordStart();
    } catch (error) {
      console.error('Recording error:', error);
      setIsPressed(false);
      setIsRecording(false);
      alert(error instanceof Error ? error.message : 'Failed to start recording');
    }
  };

  const handleStop = () => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stop();
    }
    setIsPressed(false);
  };

  const handleCancel = () => {
    cancelledRef.current = true;
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current.reset();
    }
    setIsPressed(false);
    setIsRecording(false);
    setDuration(0);
    onCancel?.();
  };

  // Handle touch events for swipe-up to cancel
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isRecording) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = touchStartY.current - currentY;
    
    // Swipe up more than 50px to cancel
    if (deltaY > 50) {
      handleCancel();
    }
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <button
        onMouseDown={handleStart}
        onMouseUp={handleStop}
        onMouseLeave={handleStop}
        onTouchStart={(e) => {
          handleTouchStart(e);
          handleStart();
        }}
        onTouchEnd={handleStop}
        onTouchMove={handleTouchMove}
        disabled={disabled}
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: isRecording ? '#ef4444' : '#3b82f6',
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          cursor: disabled ? 'not-allowed' : isRecording ? 'pointer' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.2s',
          boxShadow: isRecording
            ? '0 0 0 8px rgba(239, 68, 68, 0.3)'
            : '0 4px 6px rgba(0, 0, 0, 0.1)',
          transform: isPressed ? 'scale(0.95)' : 'scale(1)',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {isRecording ? '⏹' : '🎤'}
      </button>
      
      {isRecording && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
            {formatDuration(duration)}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Swipe up to cancel
          </div>
        </div>
      )}
    </div>
  );
}

