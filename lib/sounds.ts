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

export function playPointsSound() {
  playTone(880, "sine", 0.12, 0.15);
  playTone(1100, "sine", 0.08, 0.12, 0.06);
}

export function playLevelUpSound() {
  playTone(523, "sine", 0.14, 0.25, 0);
  playTone(659, "sine", 0.14, 0.25, 0.1);
  playTone(784, "sine", 0.14, 0.35, 0.2);
}

export function playTierSound() {
  playTone(262, "sine", 0.12, 0.6, 0);
  playTone(330, "sine", 0.12, 0.6, 0.05);
  playTone(392, "sine", 0.12, 0.6, 0.1);
  playTone(523, "sine", 0.14, 0.7, 0.15);
}

export function playAchievementSound() {
  playTone(392, "square", 0.08, 0.15, 0);
  playTone(523, "square", 0.1, 0.2, 0.1);
}
