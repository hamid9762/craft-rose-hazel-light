let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
let musicBus: GainNode | null = null;
let musicNodes: AudioNode[] = [];
let musicTimer: number | null = null;
let muted = false;
let musicBase = 0.2;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new C({ latencyHint: "interactive" });
    master = ctx.createGain();
    sfxBus = ctx.createGain();
    musicBus = ctx.createGain();
    sfxBus.gain.value = 0.7;
    musicBus.gain.value = musicBase;
    master.gain.value = muted ? 0 : 1;
    sfxBus.connect(master);
    musicBus.connect(master);
    master.connect(ctx.destination);
  }
  return ctx;
}

function warmVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.getVoices();
}

export function unlockAudio() {
  const c = ac();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  warmVoices();
}

export function setMuted(next: boolean) {
  muted = next;
  if (master && ctx) {
    master.gain.setTargetAtTime(next ? 0 : 1, ctx.currentTime, 0.03);
  }
  if (next) cancelAnnounce();
}

export function isMuted() {
  return muted;
}

function envGain(duration: number, peak: number, bus: GainNode) {
  const c = ac();
  if (!c) return null;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(peak, c.currentTime + 0.018);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  g.connect(bus);
  return g;
}

export function playCoin() {
  const c = ac();
  if (!c || !sfxBus) return;
  const freqs = [880, 1174, 1568];
  freqs.forEach((f, i) => {
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.value = f;
    const g = envGain(0.18, 0.12, sfxBus!);
    if (!g) return;
    o.connect(g);
    o.start(c.currentTime + i * 0.04);
    o.stop(c.currentTime + 0.2 + i * 0.04);
  });
}

export function playJump() {
  const c = ac();
  if (!c || !sfxBus) return;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(240, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(520, c.currentTime + 0.12);
  const g = envGain(0.16, 0.18, sfxBus);
  if (!g) return;
  o.connect(g);
  o.start();
  o.stop(c.currentTime + 0.18);
}

export function playSlide() {
  const c = ac();
  if (!c || !sfxBus) return;
  const o = c.createOscillator();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(180, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(70, c.currentTime + 0.2);
  const g = envGain(0.22, 0.08, sfxBus);
  if (!g) return;
  o.connect(g);
  o.start();
  o.stop(c.currentTime + 0.22);
}

export function playHit() {
  const c = ac();
  if (!c || !sfxBus) return;
  cancelAnnounce();
  const buffer = c.createBuffer(1, c.sampleRate * 0.25, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.6);
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  const g = envGain(0.3, 0.55, sfxBus);
  if (!g) return;
  src.connect(filter);
  filter.connect(g);
  src.start();
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(110, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.28);
  const g2 = envGain(0.32, 0.35, sfxBus);
  if (!g2) return;
  o.connect(g2);
  o.start();
  o.stop(c.currentTime + 0.32);
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const score = (v: SpeechSynthesisVoice) => {
    const lang = v.lang.toLowerCase();
    if (lang.startsWith("ur")) return 5;
    if (lang.startsWith("hi")) return 4;
    if (lang.startsWith("pa")) return 3;
    if (lang.startsWith("en-in") || lang.startsWith("en-pk")) return 2;
    if (lang.startsWith("en")) return 1;
    return 0;
  };
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -1;
  for (const v of voices) {
    const s = score(v);
    if (s > bestScore) {
      best = v;
      bestScore = s;
    }
  }
  return best;
}

function duckMusic(seconds = 2.1) {
  if (!musicBus || !ctx) return;
  const now = ctx.currentTime;
  musicBus.gain.cancelScheduledValues(now);
  musicBus.gain.setTargetAtTime(0.07, now, 0.06);
  musicBus.gain.setTargetAtTime(musicBase, now + seconds, 0.25);
}

export function cancelAnnounce() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function pauseAnnounce() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.pause();
}

export function resumeAnnounce() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.resume();
}

function whenVoicesReady(cb: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  if (synth.getVoices().length > 0) {
    cb();
    return;
  }
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    synth.removeEventListener("voiceschanged", run);
    cb();
  };
  synth.addEventListener("voiceschanged", run);
  window.setTimeout(run, 450);
}

export function announceLine(line: string, cancel = true) {
  if (muted || typeof window === "undefined" || !window.speechSynthesis) return;
  duckMusic(Math.min(4.2, 1.4 + line.length * 0.035));
  const speak = () => {
    if (muted) return;
    const utter = new SpeechSynthesisUtterance(line);
    const voice = pickVoice();
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang;
    } else {
      utter.lang = "hi-IN";
    }
    utter.rate = 0.88;
    utter.pitch = 1;
    utter.volume = 1;
    if (cancel) window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };
  whenVoicesReady(speak);
}

export function announceVillage(name: string, start = false) {
  const line = start
    ? `${name} gaon se game start ho rahi hai`
    : `${name} aa gaya`;
  announceLine(line, true);
}

export function playVillage(name?: string, start = false) {
  const c = ac();
  if (c && sfxBus) {
    const notes = [392, 494, 587];
    notes.forEach((f, i) => {
      const o = c.createOscillator();
      o.type = "triangle";
      o.frequency.value = f;
      const g = envGain(0.28, 0.08, sfxBus!);
      if (!g) return;
      o.connect(g);
      o.start(c.currentTime + i * 0.08);
      o.stop(c.currentTime + 0.32 + i * 0.08);
    });
  }
  if (name) announceVillage(name, start);
}

export function playStep(rate = 1) {
  const c = ac();
  if (!c || !sfxBus) return;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.value = 90 + Math.random() * 30;
  const g = envGain(0.06, 0.05 * rate, sfxBus);
  if (!g) return;
  o.connect(g);
  o.start();
  o.stop(c.currentTime + 0.07);
}

function stopMusicNodes() {
  for (const n of musicNodes) {
    try {
      if ("stop" in n && typeof (n as OscillatorNode).stop === "function") {
        (n as OscillatorNode).stop();
      }
      n.disconnect();
    } catch {
      /* already stopped */
    }
  }
  musicNodes = [];
  if (musicTimer != null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
}

export function startMusic() {
  const c = ac();
  if (!c || !musicBus) return;
  stopMusicNodes();
  musicBus.gain.setTargetAtTime(musicBase, c.currentTime, 0.05);

  const drones: Array<[number, number]> = [
    [73, 0.18],
    [110, 0.1],
    [147, 0.06],
  ];
  for (const [freq, vol] of drones) {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = freq;
    const g = c.createGain();
    g.gain.value = vol;
    o.connect(g);
    g.connect(musicBus);
    o.start();
    musicNodes.push(o, g);
  }

  const scale = [196, 220, 262, 294, 330, 294, 262, 220];
  let step = 0;
  const tick = () => {
    if (!ctx || !musicBus) return;
    const f = scale[step % scale.length]!;
    step += 1;
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = f;
    const pg = envGain(0.62, 0.16, musicBus);
    if (!pg) return;
    o.connect(pg);
    o.start();
    o.stop(ctx.currentTime + 0.65);
  };
  tick();
  musicTimer = window.setInterval(tick, 720);
}

export function stopMusic() {
  stopMusicNodes();
}

export function resumeAudio() {
  const c = ac();
  if (c && c.state === "suspended") void c.resume();
}
