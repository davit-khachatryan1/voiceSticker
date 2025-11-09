import { Viseme, Mood } from '@voicesticker/types';
import { applyEmotionToVisemes } from './emotion';

// ASR stub - in production, this would call a real ASR service
async function performASR(audioUrl: string): Promise<{ phonemes: Phoneme[] }> {
  // Stub: return mock phonemes
  // In production: call Whisper, Google Speech-to-Text, or similar
  console.log(`[ASR] Processing audio: ${audioUrl}`);
  
  // Mock phoneme sequence
  const mockPhonemes: Phoneme[] = [
    { t: 0, phoneme: 'HH' },    // "hello"
    { t: 100, phoneme: 'EH' },
    { t: 200, phoneme: 'L' },
    { t: 300, phoneme: 'OW' },
    { t: 500, phoneme: 'W' },    // "world"
    { t: 600, phoneme: 'ER' },
    { t: 700, phoneme: 'L' },
    { t: 800, phoneme: 'D' },
  ];

  return { phonemes: mockPhonemes };
}

interface Phoneme {
  t: number; // time in milliseconds
  phoneme: string; // IPA or ARPABET phoneme code
}

// Phoneme to viseme mapping
const PHONEME_TO_VISEME: Record<string, Viseme['shape']> = {
  // Vowels
  'AA': 'A', 'AE': 'A', 'AH': 'A', 'AO': 'O', 'AW': 'A', 'AY': 'A',
  'EH': 'E', 'ER': 'E', 'EY': 'E',
  'IH': 'I', 'IY': 'I',
  'OW': 'O', 'OY': 'O',
  'UH': 'U', 'UW': 'U',
  
  // Consonants
  'B': 'M', 'P': 'M', 'M': 'M',
  'F': 'U', 'V': 'U',
  'TH': 'U',
  'D': 'L', 'T': 'L', 'N': 'L', 'L': 'L',
  'S': 'E', 'Z': 'E',
  'SH': 'E', 'ZH': 'E',
  'CH': 'E', 'JH': 'E',
  'K': 'A', 'G': 'A', 'NG': 'A',
  'R': 'E',
  'W': 'W', 'Y': 'I',
  'HH': 'A', // breathy sounds
};

function phonemeToViseme(phoneme: string): Viseme['shape'] {
  // Remove stress markers and convert to uppercase
  const normalized = phoneme.replace(/[0-9]/g, '').toUpperCase();
  return PHONEME_TO_VISEME[normalized] || 'A'; // Default to 'A' (neutral)
}

// Convert phonemes to visemes
export function phonemesToVisemes(phonemes: Phoneme[]): Viseme[] {
  return phonemes.map((p) => ({
    t: p.t,
    shape: phonemeToViseme(p.phoneme),
  }));
}

// Re-export emotion functions
export { applyEmotionToVisemes } from './emotion';

// Main processing function
export async function processLipSync(
  audioUrl: string,
  mood: Mood,
  durationMs: number
): Promise<Viseme[]> {
  console.log(`[LipSync] Starting processing: ${audioUrl}, mood: ${mood}, duration: ${durationMs}ms`);

  // Step 1: ASR
  const { phonemes } = await performASR(audioUrl);
  console.log(`[LipSync] Extracted ${phonemes.length} phonemes`);

  // Step 2: Convert to visemes
  let visemes = phonemesToVisemes(phonemes);
  console.log(`[LipSync] Generated ${visemes.length} visemes`);

  // Step 3: Apply emotion curves
  visemes = applyEmotionToVisemes(visemes, mood, durationMs);
  console.log(`[LipSync] Applied ${mood} emotion curves`);

  return visemes;
}

// Worker entry point (for queue processing)
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('[LipSync Worker] Starting...');
  
  // In production, this would:
  // 1. Connect to Redis queue
  // 2. Listen for jobs
  // 3. Process each job
  // 4. Update job status
  // 5. Trigger next stage (render)
  
  console.log('[LipSync Worker] Ready (stub mode)');
}

