'use client';

import { useState, useEffect, useRef } from 'react';
import { RecordButton } from '@/components/RecordButton';
import { initTelegramWebApp, getTelegramWebApp } from '@/lib/telegram';
import { CanvasRecorder } from '@/lib/canvas-recorder';
import { processClientLipSync } from '@/lib/client-lipsync';
import { uploadToWorker, answerTelegramQuery } from '@/lib/api';
import { Mood, Viseme } from '@/types';

const STYLES = [
  { id: 'bear', name: 'Bear', emoji: '🐻' },
  { id: 'cat', name: 'Cat', emoji: '🐱' },
];

const MOODS: Mood[] = ['neutral', 'happy', 'angry', 'sad', 'sarcastic'];

export default function Home() {
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);
  const [selectedMood, setSelectedMood] = useState<Mood>('neutral');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const canvasRecorderRef = useRef<CanvasRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);

  useEffect(() => {
    // Initialize Telegram WebApp
    const webApp = initTelegramWebApp();
    if (webApp) {
      webApp.ready();
      webApp.expand();
    }

    // Setup canvas
    if (canvasRef.current) {
      canvasRef.current.width = 512;
      canvasRef.current.height = 512;
    }

    return () => {
      // Cleanup
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      if (canvasRecorderRef.current) {
        canvasRecorderRef.current.stopRecording();
      }
    };
  }, []);

  const handleRecordStart = async () => {
    try {
      setError(null);
      setIsRecording(true);
      chunksRef.current = [];
      audioBlobRef.current = null;

      if (!canvasRef.current) {
        throw new Error('Canvas not initialized');
      }

      // Initialize canvas recorder
      const canvasRecorder = new CanvasRecorder({
        canvas: canvasRef.current,
        fps: 15,
        styleId: selectedStyle,
        mood: selectedMood,
      });
      canvasRecorderRef.current = canvasRecorder;

      // Get microphone
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Get canvas stream
      const canvasStream = canvasRef.current.captureStream(15);
      
      // Combine streams
      const mixedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...micStream.getAudioTracks(),
      ]);

      // Create MediaRecorder
      const options: MediaRecorderOptions = {
        mimeType: 'video/webm;codecs=vp9,opus',
      };

      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options.mimeType = 'video/webm;codecs=vp8,opus';
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options.mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(mixedStream, options);
      recorderRef.current = recorder;

      // Process audio for lip-sync (estimate visemes)
      // Note: We'll use a simple estimation for MVP
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(micStream);
      // Store audio for later processing
      const mediaRecorder = new MediaRecorder(micStream);
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        audioBlobRef.current = new Blob(audioChunks, { type: 'audio/webm' });
      };

      mediaRecorder.start();

      // Start canvas animation with placeholder visemes
      // We'll generate visemes based on duration estimate
      const placeholderVisemes: Viseme[] = [];
      for (let i = 0; i < 100; i++) {
        placeholderVisemes.push({
          t: i * 100,
          shape: ['A', 'E', 'I', 'O', 'U', 'M'][i % 6] as Viseme['shape'],
        });
      }
      
      await canvasRecorder.startRecording(placeholderVisemes);

      // Start video recording
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        mediaRecorder.stop();
        await handleRecordingComplete();
      };

      recorder.start();
    } catch (err) {
      console.error('Recording error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const handleRecordStop = () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
    if (canvasRecorderRef.current) {
      canvasRecorderRef.current.stopRecording();
    }
    setIsRecording(false);
  };

  const handleRecordingComplete = async () => {
    setIsProcessing(true);
    
    try {
      // Create final video blob
      const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
      
      // Process lip-sync if we have audio
      let visemes: Viseme[] = [];
      if (audioBlobRef.current) {
        const durationMs = chunksRef.current.length * 100; // Estimate
        visemes = await processClientLipSync(
          audioBlobRef.current,
          selectedMood,
          durationMs
        );
      }

      // Upload to Cloudflare Worker (R2)
      const videoUrl = await uploadToWorker(videoBlob);
      
      // Answer Telegram query
      const webApp = getTelegramWebApp();
      const queryId = webApp?.initDataUnsafe.query_id;
      
      if (!queryId) {
        throw new Error('No query ID found');
      }

      await answerTelegramQuery({
        queryId,
        videoUrl,
        thumbnailUrl: videoUrl, // Use same URL for thumbnail
        title: 'Voice Sticker',
        duration: Math.floor(videoBlob.size / 1000), // Estimate duration
      });

      // Close WebApp
      webApp?.close();
    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process recording');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: '#f9fafb',
      }}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        Voice Sticker
      </h1>

      {/* Hidden canvas for recording */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width={512}
        height={512}
      />

      {/* Style Picker */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        {STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => setSelectedStyle(style.id)}
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border: selectedStyle === style.id ? '2px solid #3b82f6' : '2px solid #e5e7eb',
              backgroundColor: selectedStyle === style.id ? '#eff6ff' : 'white',
              cursor: 'pointer',
              fontSize: '2rem',
            }}
          >
            {style.emoji}
          </button>
        ))}
      </div>

      {/* Mood Picker */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {MOODS.map((mood) => (
          <button
            key={mood}
            onClick={() => setSelectedMood(mood)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: selectedMood === mood ? '2px solid #3b82f6' : '1px solid #e5e7eb',
              backgroundColor: selectedMood === mood ? '#eff6ff' : 'white',
              color: selectedMood === mood ? '#3b82f6' : '#374151',
              cursor: 'pointer',
              fontSize: '0.875rem',
              textTransform: 'capitalize',
            }}
          >
            {mood}
          </button>
        ))}
      </div>

      {/* Record Button */}
      <RecordButton
        onRecordStart={handleRecordStart}
        onRecordStop={handleRecordStop}
        disabled={isProcessing}
      />

      {/* Status */}
      {isProcessing && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', color: '#6b7280' }}>
            Processing and uploading...
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fee', borderRadius: '8px' }}>
          <div style={{ color: '#ef4444' }}>❌ {error}</div>
        </div>
      )}
    </div>
  );
}
