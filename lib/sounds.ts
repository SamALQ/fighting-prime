let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function playTone(
  freq: number,
  type: OscillatorType,
  gain: number,
  duration: number,
  delay = 0,
) {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ac.currentTime + delay);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(ac.currentTime + delay);
  osc.stop(ac.currentTime + delay + duration + 0.05);
}

const audioCache = new Map<string, AudioBuffer>();

async function playSample(path: string, volume = 0.5) {
  const ac = getCtx();
  let buffer = audioCache.get(path);
  if (!buffer) {
    try {
      const res = await fetch(path);
      const arrayBuf = await res.arrayBuffer();
      buffer = await ac.decodeAudioData(arrayBuf);
      audioCache.set(path, buffer);
    } catch {
      return;
    }
  }
  const source = ac.createBufferSource();
  const gain = ac.createGain();
  gain.gain.value = volume;
  source.buffer = buffer;
  source.connect(gain).connect(ac.destination);
  source.start();
}

export function playPointsSound() {
  playTone(880, "sine", 0.12, 0.15);
  playTone(1100, "sine", 0.08, 0.12, 0.06);
}

export function playLevelUpSound() {
  playSample("/sounds/level-up.wav", 0.6);
}

export function playTierSound() {
  playSample("/sounds/tier-achieve.wav", 0.7);
}

export function playAchievementSound() {
  playTone(392, "square", 0.08, 0.15, 0);
  playTone(523, "square", 0.1, 0.2, 0.1);
}
