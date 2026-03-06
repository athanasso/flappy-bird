/**
 * Generates retro-style WAV sound effects for Derpy Disk.
 * Run: node scripts/generate-sounds.js
 * 
 * Outputs 16-bit PCM WAV at 44100Hz (standard, widely supported).
 */
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const outDir = path.join(__dirname, '..', 'assets', 'sounds');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function createWav(samples, sampleRate) {
  const numSamples = samples.length;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = numSamples * (bitsPerSample / 8);
  const fileSize = 36 + dataSize;

  const buffer = Buffer.alloc(44 + dataSize);
  let offset = 0;

  // RIFF chunk descriptor
  buffer.write('RIFF', offset); offset += 4;
  buffer.writeUInt32LE(fileSize, offset); offset += 4;
  buffer.write('WAVE', offset); offset += 4;

  // "fmt " sub-chunk
  buffer.write('fmt ', offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4;          // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, offset); offset += 2;           // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, offset); offset += 2; // NumChannels
  buffer.writeUInt32LE(sampleRate, offset); offset += 4;  // SampleRate
  buffer.writeUInt32LE(byteRate, offset); offset += 4;    // ByteRate
  buffer.writeUInt16LE(blockAlign, offset); offset += 2;  // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, offset); offset += 2; // BitsPerSample

  // "data" sub-chunk
  buffer.write('data', offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;

  // Write samples
  for (let i = 0; i < numSamples; i++) {
    const val = Math.max(-1, Math.min(1, samples[i]));
    const intVal = Math.round(val * 32767);
    buffer.writeInt16LE(intVal, offset); offset += 2;
  }

  return buffer;
}

// ─── FLAP SOUND ───
// Quick upward chirp, ~80ms
function generateFlap() {
  const duration = 0.08;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    // Rising frequency from 500Hz to 1200Hz
    const freq = 500 + progress * 700;
    const envelope = Math.pow(1 - progress, 0.5) * 0.6;
    samples[i] = Math.sin(2 * Math.PI * freq * t) * envelope;
  }

  return createWav(samples, SAMPLE_RATE);
}

// ─── SCORE SOUND ───
// Pleasant double-ding, ~180ms
function generateScore() {
  const duration = 0.18;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    const half = numSamples / 2;
    // Two quick notes: E5 (659Hz) then B5 (988Hz) 
    const freq = i < half ? 659 : 988;
    const localProg = i < half ? i / half : (i - half) / half;
    const envelope = Math.pow(1 - localProg, 0.4) * 0.5;
    samples[i] = Math.sin(2 * Math.PI * freq * t) * envelope;
  }

  return createWav(samples, SAMPLE_RATE);
}

// ─── HIT / COLLISION SOUND ───
// Short harsh buzz + falling tone, ~120ms
function generateHit() {
  const duration = 0.12;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    // Falling frequency from 350Hz to 100Hz
    const freq = 350 - progress * 250;
    const envelope = Math.pow(1 - progress, 0.3) * 0.7;
    const sine = Math.sin(2 * Math.PI * freq * t);
    // Add some crunch with noise
    const noise = (Math.random() * 2 - 1) * 0.25;
    samples[i] = (sine * 0.7 + noise) * envelope;
  }

  return createWav(samples, SAMPLE_RATE);
}

// ─── DIE / GAME OVER SOUND ───
// Sad descending tone, ~250ms
function generateDie() {
  const duration = 0.25;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    // Descending from 500Hz to 180Hz
    const freq = 500 - progress * 320;
    const envelope = Math.pow(1 - progress * 0.8, 0.6) * 0.55;
    const sine = Math.sin(2 * Math.PI * freq * t);
    // Subtle vibrato
    const vibrato = Math.sin(2 * Math.PI * 7 * t) * 0.1;
    samples[i] = sine * (1 + vibrato) * envelope;
  }

  return createWav(samples, SAMPLE_RATE);
}

// Write all sound files
const sounds = {
  'flap.wav': generateFlap(),
  'score.wav': generateScore(),
  'hit.wav': generateHit(),
  'die.wav': generateDie(),
};

for (const [name, data] of Object.entries(sounds)) {
  const filePath = path.join(outDir, name);
  fs.writeFileSync(filePath, data);
  console.log(`  ✓ ${name} (${data.length} bytes)`);
}

console.log(`\n✅ Generated ${Object.keys(sounds).length} sounds in: ${outDir}`);
