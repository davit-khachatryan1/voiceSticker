'use client';

import { useState, useEffect, useRef } from 'react';
import { RecordButton } from '@/components/RecordButton';
import { CanvasRecorder } from '@/lib/canvas-recorder';
import { processClientLipSync } from '@/lib/client-lipsync';
import { uploadToWorker } from '@/lib/api';
import { Mood, Viseme } from '@voicesticker/types';

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

      // Store audio separately for processing
      const audioRecorder = new MediaRecorder(micStream);
      const audioChunks: Blob[] = [];
      
      audioRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };
      
      audioRecorder.onstop = () => {
        audioBlobRef.current = new Blob(audioChunks, { type: 'audio/webm' });
      };

      audioRecorder.start();

      // Start canvas animation with placeholder visemes
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
        audioRecorder.stop();
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
      
      // Upload to Cloudflare Worker (R2)
      const videoUrl = await uploadToWorker(videoBlob);
      
      // Convert to File for sharing
      const file = new File([videoBlob], 'voicesticker.webm', { type: 'video/webm' });

      // Use Web Share API
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Voice Sticker',
          text: 'Check out this voice sticker!',
        });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(videoBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'voicesticker.webm';
        a.click();
        URL.revokeObjectURL(url);
        
        alert('Video downloaded! Please attach it in WhatsApp manually.');
      }
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
              border: selectedStyle === style.id ? '2px solid #25D366' : '2px solid #e5e7eb',
              backgroundColor: selectedStyle === style.id ? '#dcfce7' : 'white',
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
              border: selectedMood === mood ? '2px solid #25D366' : '1px solid #e5e7eb',
              backgroundColor: selectedMood === mood ? '#dcfce7' : 'white',
              color: selectedMood === mood ? '#25D366' : '#374151',
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
            Processing and sharing...
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fee', borderRadius: '8px' }}>
          <div style={{ color: '#ef4444' }}>❌ {error}</div>
        </div>
      )}

      <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#6b7280', textAlign: 'center' }}>
        Tap record, hold to record, release to share to WhatsApp
      </div>
    </div>
  );
}
