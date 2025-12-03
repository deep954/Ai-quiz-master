let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

// Base64 decoding helper
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// PCM Audio Decoding helper (from raw PCM to AudioBuffer)
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function getAudioContext(): AudioContext {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
    }
    return audioContext;
}

export const playClickSound = () => {
    try {
        const ctx = getAudioContext();
        
        // Resume context if suspended (common in browsers before user interaction)
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Create a short, high-pitched "pop" sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);

        // Quick fade out
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
    } catch (error) {
        // Silently fail if audio is not allowed or supported
        console.warn("Could not play click sound", error);
    }
};

export const playAudio = async (base64Audio: string): Promise<void> => {
  try {
    const ctx = getAudioContext();

    // Stop currently playing audio
    if (currentSource) {
      try {
        currentSource.stop();
      } catch (e) {
        // Ignore errors if source already stopped
      }
      currentSource = null;
    }

    // Resume context if suspended
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const audioBytes = decode(base64Audio);
    const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    
    // Set playback speed to 1.25x (faster)
    source.playbackRate.value = 1.25;

    source.connect(ctx.destination);
    
    currentSource = source;
    
    return new Promise((resolve) => {
      source.onended = () => {
        if (currentSource === source) {
          currentSource = null;
        }
        resolve();
      };
      source.start();
    });

  } catch (error) {
    console.error("Audio playback error:", error);
    throw error;
  }
};

export const stopAudio = () => {
  if (currentSource) {
    try {
      currentSource.stop();
    } catch (e) {}
    currentSource = null;
  }
};