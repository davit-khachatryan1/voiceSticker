// Audio recording utilities

export interface RecordingState {
  isRecording: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private state: RecordingState = {
    isRecording: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
  };
  private onStateChange?: (state: RecordingState) => void;

  constructor(onStateChange?: (state: RecordingState) => void) {
    this.onStateChange = onStateChange;
  }

  async start(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Use Opus codec if available, fallback to default
      const options: MediaRecorderOptions = {
        mimeType: 'audio/webm;codecs=opus',
      };

      // Fallback options
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options.mimeType = 'audio/webm';
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options.mimeType = 'audio/mp4';
      }

      this.mediaRecorder = new MediaRecorder(stream, options);
      this.audioChunks = [];
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        this.state = {
          isRecording: false,
          duration: Date.now() - this.startTime,
          audioBlob,
          audioUrl,
        };

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        this.onStateChange?.(this.state);
      };

      this.mediaRecorder.start();
      this.state.isRecording = true;
      this.onStateChange?.(this.state);

      // Update duration every 100ms
      const interval = setInterval(() => {
        if (this.state.isRecording) {
          this.state.duration = Date.now() - this.startTime;
          this.onStateChange?.(this.state);
        } else {
          clearInterval(interval);
        }
      }, 100);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to start recording. Please check microphone permissions.');
    }
  }

  stop(): void {
    if (this.mediaRecorder && this.state.isRecording) {
      this.mediaRecorder.stop();
    }
  }

  getState(): RecordingState {
    return { ...this.state };
  }

  reset(): void {
    if (this.state.audioUrl) {
      URL.revokeObjectURL(this.state.audioUrl);
    }
    this.state = {
      isRecording: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
    };
    this.onStateChange?.(this.state);
  }
}

