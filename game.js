/**
 * Fly Bird - Royal Flight 👑
 * High-Speed Arcade Engine, Tree Takeoff Start, Scenic Rolling Hills,
 * Surprises & Power-ups at Higher Levels, 100% Mobile Lag-Free Optimization
 */

// Canvas roundRect polyfill
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
    const r = typeof radii === 'number' ? radii : (Array.isArray(radii) ? (radii[0] || 4) : 4);
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

// Robust color parsing (never falls back to pure white!)
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return [30, 60, 100];
  if (hex.startsWith('rgb')) {
    const parts = hex.match(/\d+/g);
    if (parts && parts.length >= 3) {
      return [parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2], 10)];
    }
  }
  const clean = hex.replace('#', '');
  if (clean.length === 6) {
    const bigint = parseInt(clean, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  } else if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return [r, g, b];
  }
  return [35, 75, 125];
}

function lerpColor(c1, c2, t) {
  const rgb1 = hexToRgb(c1);
  const rgb2 = hexToRgb(c2);
  const r = Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * t);
  const g = Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * t);
  const b = Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

// ==========================================
// ZERO-ALLOCATION PARTICLE POOL (Mobile Performance Fix)
// ==========================================
class ParticlePool {
  constructor(size = 140) {
    this.pool = new Array(size);
    for (let i = 0; i < size; i++) {
      this.pool[i] = {
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 0,
        color: '#ffffff',
        alpha: 1,
        life: 1,
        maxLife: 1,
        type: 'circle', // 'circle', 'leaf', 'feather', 'confetti', 'ring'
        rot: 0,
        vrot: 0
      };
    }
  }

  spawn(x, y, vx, vy, size, color, life, type = 'circle') {
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (!p.active) {
        p.active = true;
        p.x = x;
        p.y = y;
        p.vx = vx;
        p.vy = vy;
        p.size = size;
        p.color = color;
        p.alpha = 1;
        p.life = life;
        p.maxLife = life;
        p.type = type;
        p.rot = Math.random() * Math.PI * 2;
        p.vrot = (Math.random() - 0.5) * 0.25;
        return p;
      }
    }
    return null;
  }

  update(dt = 1) {
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (p.active) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vrot * dt;
        if (p.type === 'leaf') {
          p.vy += 0.05 * dt; // gentle gravity for falling leaves
          p.vx += Math.sin(p.rot) * 0.1 * dt;
        }
        p.life -= dt;
        p.alpha = Math.max(0, p.life / p.maxLife);
        p.size *= Math.pow(0.965, dt);
        if (p.life <= 0 || p.size <= 0.4) {
          p.active = false;
        }
      }
    }
  }

  draw(ctx) {
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (p.active && p.alpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.type === 'leaf') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 1.6, p.size * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'feather') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 1.8, p.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'confetti') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        } else if (p.type === 'ring') {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1.8 - p.alpha * 0.8), 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Fast circle (zero shadowBlur for high performance)
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }
  }

  clear() {
    for (let i = 0; i < this.pool.length; i++) {
      this.pool[i].active = false;
    }
  }
}

// ==========================================
// HIGH-ENERGY ARCADE ACTION SOUNDTRACK
// Synthesized in real-time via Web Audio API (Zero audio lag, clean node disconnects)
// ==========================================
const ACTION_NOTE_FREQ = {
  E2: 82.41, G2: 98.00, A2: 110.00, B2: 123.47,
  C3: 130.81, D3: 146.83, Ds3: 155.56, E3: 164.81, Fs3: 185.00, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, Ds4: 311.13, E4: 329.63, Fs4: 369.99, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, Ds5: 622.25, E5: 659.25, Fs5: 739.99, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51
};

class ActionSoundtrack {
  constructor(audioCtx, isMutedGetter) {
    this.ctx = audioCtx;
    this.isMutedGetter = isMutedGetter;
    this.isPlaying = false;
    this.isPaused = false;
    this.tempo = 136;
    this.intensity = 0;
    this.step = 0;
    this.nextStepTime = 0;
    this.timerId = null;
    this.noiseBuffer = null;
    this.musicGain = null;
    this.compressor = null;

    this.initAudioNodes();
    this.initNoiseBuffer();

    const F = ACTION_NOTE_FREQ;

    this.bassPattern = [
      F.E2, F.E3, F.E2, F.E3, F.E2, F.E3, F.G2, F.B2,
      F.E2, F.E3, F.E2, F.E3, F.E2, F.E3, F.B2, F.D3,
      F.C3, F.C4, F.C3, F.C4, F.C3, F.C4, F.E3, F.G3,
      F.C3, F.C4, F.C3, F.C4, F.C3, F.C4, F.G3, F.B3,
      F.D3, F.D4, F.D3, F.D4, F.D3, F.D4, F.Fs3, F.A3,
      F.D3, F.D4, F.D3, F.D4, F.D3, F.D4, F.A3, F.C4,
      F.B2, F.B3, F.B2, F.B3, F.B2, F.B3, F.Ds3, F.Fs3,
      F.B2, F.B3, F.B2, F.B3, F.B2, F.Ds3, F.Fs3, F.A3
    ];

    this.leadPattern = [
      F.E4, null, F.G4, null, F.B4, null, F.E5, null,
      F.D5, null, F.B4, null, F.A4, null, F.B4, null,
      F.G4, null, F.A4, null, F.B4, null, F.D5, null,
      F.C5, null, F.A4, null, F.G4, null, F.E4, null,
      F.Fs4, null, F.A4, null, F.D5, null, F.Fs5, null,
      F.E5, null, F.D5, null, F.A4, null, F.D5, null,
      F.B4, null, F.Ds5, null, F.Fs5, null, F.A5, null,
      F.G5, null, F.Fs5, null, F.Ds5, null, F.B4, null
    ];

    this.arpPattern = [
      F.E5, F.G5, F.B5, F.E6, F.B5, F.G5, F.E5, F.B4,
      F.E5, F.G5, F.B5, F.E6, F.B5, F.G5, F.B5, F.E6,
      F.C5, F.E5, F.G5, F.C6, F.G5, F.E5, F.C5, F.G4,
      F.C5, F.E5, F.G5, F.C6, F.G5, F.E5, F.G5, F.C6,
      F.D5, F.Fs5, F.A5, F.D6, F.A5, F.Fs5, F.D5, F.A4,
      F.D5, F.Fs5, F.A5, F.D6, F.A5, F.Fs5, F.A5, F.D6,
      F.B4, F.Ds5, F.Fs5, F.B5, F.Fs5, F.Ds5, F.B4, F.Fs4,
      F.B4, F.Ds5, F.Fs5, F.B5, F.Fs5, F.Ds5, F.Fs5, F.B5
    ];
  }

  isMuted() {
    return typeof this.isMutedGetter === 'function' ? this.isMutedGetter() : false;
  }

  initAudioNodes() {
    if (!this.ctx || this.musicGain) return;
    try {
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.isMuted() ? 0 : 0.20, this.ctx.currentTime);

      this.musicGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);
    } catch (e) {}
  }

  initNoiseBuffer() {
    if (this.noiseBuffer || !this.ctx) return;
    try {
      const sampleRate = this.ctx.sampleRate || 44100;
      const bufferSize = Math.floor(sampleRate * 0.35);
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const output = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    } catch (e) {}
  }

  triggerKick(time) {
    if (!this.ctx || this.isMuted()) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, time);
      osc.frequency.exponentialRampToValueAtTime(36, time + 0.08);

      gain.gain.setValueAtTime(0.70, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
      osc.start(time);
      osc.stop(time + 0.13);
    } catch (e) {}
  }

  triggerSnare(time) {
    if (!this.ctx || this.isMuted() || !this.noiseBuffer) return;
    try {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1900, time);
      filter.Q.setValueAtTime(1.2, time);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.32, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.13);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.musicGain);

      noise.onended = () => { try { noise.disconnect(); filter.disconnect(); noiseGain.disconnect(); } catch (e) {} };
      noise.start(time);
      noise.stop(time + 0.14);

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, time);
      osc.frequency.exponentialRampToValueAtTime(80, time + 0.07);

      oscGain.gain.setValueAtTime(0.36, time);
      oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

      osc.connect(oscGain);
      oscGain.connect(this.musicGain);

      osc.onended = () => { try { osc.disconnect(); oscGain.disconnect(); } catch (e) {} };
      osc.start(time);
      osc.stop(time + 0.09);
    } catch (e) {}
  }

  triggerHiHat(time, open = false) {
    if (!this.ctx || this.isMuted() || !this.noiseBuffer) return;
    try {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7500, time);

      const gain = this.ctx.createGain();
      const dur = open ? 0.11 : 0.035;
      gain.gain.setValueAtTime(open ? 0.20 : 0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      noise.onended = () => { try { noise.disconnect(); filter.disconnect(); gain.disconnect(); } catch (e) {} };
      noise.start(time);
      noise.stop(time + dur + 0.01);
    } catch (e) {}
  }

  triggerBass(freq, time, dur = 0.10) {
    if (!this.ctx || this.isMuted() || !freq) return;
    try {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(950, time);
      filter.frequency.exponentialRampToValueAtTime(220, time + dur);
      filter.Q.setValueAtTime(2.5, time);

      gain.gain.setValueAtTime(0.32, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.onended = () => { try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch (e) {} };
      osc.start(time);
      osc.stop(time + dur + 0.02);
    } catch (e) {}
  }

  triggerLead(freq, time, dur = 0.14) {
    if (!this.ctx || this.isMuted() || !freq) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);

      const vol = this.intensity >= 2 ? 0.20 : 0.16;
      gain.gain.setValueAtTime(vol, time);
      gain.gain.setValueAtTime(vol, time + dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
      osc.start(time);
      osc.stop(time + dur + 0.02);
    } catch (e) {}
  }

  triggerArp(freq, time) {
    if (!this.ctx || this.isMuted() || !freq) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.11, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
      osc.start(time);
      osc.stop(time + 0.08);
    } catch (e) {}
  }

  playStep(stepIdx, time) {
    const isKick = [0, 4, 8, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 46, 48, 52, 56, 60, 62].includes(stepIdx);
    const isExtraKick = this.intensity >= 2 && [2, 6, 10, 18, 22, 26, 34, 38, 42, 50, 54, 58].includes(stepIdx);
    if (isKick || isExtraKick) {
      this.triggerKick(time);
    }

    const isSnare = [4, 12, 20, 28, 36, 44, 52, 60].includes(stepIdx);
    if (isSnare) {
      this.triggerSnare(time);
    }

    const isOpenHat = [14, 30, 46, 62].includes(stepIdx);
    const isClosedHat = [2, 6, 10, 18, 22, 26, 34, 38, 42, 50, 54, 58].includes(stepIdx);
    const isFastHat = this.intensity >= 1 && stepIdx % 2 === 1;

    if (isOpenHat) {
      this.triggerHiHat(time, true);
    } else if (isClosedHat || isFastHat) {
      this.triggerHiHat(time, false);
    }

    const bassNote = this.bassPattern[stepIdx];
    if (bassNote) {
      this.triggerBass(bassNote, time, 0.10);
    }

    const leadNote = this.leadPattern[stepIdx];
    if (leadNote) {
      this.triggerLead(leadNote, time, 0.15);
    }

    if (this.intensity >= 1) {
      const arpNote = this.arpPattern[stepIdx];
      if (arpNote) {
        this.triggerArp(arpNote, time);
      }
    }
  }

  scheduler() {
    if (!this.isPlaying || this.isPaused || !this.ctx) return;
    try {
      const secPerBeat = 60.0 / this.tempo;
      const secPerStep = secPerBeat / 4;

      while (this.nextStepTime < this.ctx.currentTime + 0.12) {
        this.playStep(this.step, this.nextStepTime);
        this.nextStepTime += secPerStep;
        this.step = (this.step + 1) % 64;
      }
    } catch (e) {}
  }

  start() {
    if (this.isPlaying && !this.isPaused) return;
    if (!this.ctx) return;

    this.initAudioNodes();
    this.initNoiseBuffer();

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.step = 0;
    this.nextStepTime = this.ctx.currentTime + 0.05;

    const targetVol = this.isMuted() ? 0 : 0.20;
    if (this.musicGain) {
      try {
        this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, this.ctx.currentTime);
        this.musicGain.gain.linearRampToValueAtTime(targetVol, this.ctx.currentTime + 0.1);
      } catch (e) {}
    }

    clearInterval(this.timerId);
    this.timerId = setInterval(() => this.scheduler(), 30);
  }

  pause() {
    if (!this.isPlaying || this.isPaused) return;
    this.isPaused = true;
    if (this.musicGain && this.ctx) {
      try {
        this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.musicGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      } catch (e) {}
    }
    clearInterval(this.timerId);
    this.timerId = null;
  }

  resume() {
    if (!this.isPlaying || !this.isPaused) return;
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isPaused = false;
    this.nextStepTime = this.ctx.currentTime + 0.05;

    const targetVol = this.isMuted() ? 0 : 0.20;
    if (this.musicGain) {
      try {
        this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.musicGain.gain.linearRampToValueAtTime(targetVol, this.ctx.currentTime + 0.08);
      } catch (e) {}
    }

    clearInterval(this.timerId);
    this.timerId = setInterval(() => this.scheduler(), 30);
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.isPaused = false;
    this.step = 0;
    if (this.musicGain && this.ctx) {
      try {
        this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.musicGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.10);
      } catch (e) {}
    }
    clearInterval(this.timerId);
    this.timerId = null;
  }

  setMuted(muted) {
    if (!this.musicGain || !this.ctx) return;
    try {
      const target = muted ? 0 : (this.isPlaying && !this.isPaused ? 0.20 : 0);
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  setIntensity(level) {
    this.intensity = level;
    if (level >= 3) {
      this.tempo = 146;
    } else if (level === 2) {
      this.tempo = 142;
    } else if (level === 1) {
      this.tempo = 138;
    } else {
      this.tempo = 136;
    }
  }
}

// Web Audio API Synthesizer & Sound FX Manager
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('flybird_muted') === 'true';
    this.music = null;
    this.initAudio();
  }

  initAudio() {
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.music = new ActionSoundtrack(this.ctx, () => this.muted);
      }
    } catch (e) {}
  }

  ensureContext() {
    if (!this.ctx) this.initAudio();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('flybird_muted', this.muted);
    if (this.music) {
      this.music.setMuted(this.muted);
    }
    return this.muted;
  }

  startMusic() {
    this.ensureContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        if (this.music) this.music.start();
      }).catch(() => {});
    } else if (this.music) {
      this.music.start();
    }
  }

  pauseMusic() {
    if (this.music) this.music.pause();
  }

  resumeMusic() {
    this.ensureContext();
    if (this.music) this.music.resume();
  }

  stopMusic() {
    if (this.music) this.music.stop();
  }

  setMusicIntensity(level) {
    if (this.music) this.music.setIntensity(level);
  }

  // Majestic Royal Hero Select Fanfare Chime
  playHeroSelect() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const delay = idx * 0.055;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.24, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
        osc.start(now + delay);
        osc.stop(now + delay + 0.30);
      });
    } catch (e) {}
  }

  // Tree jump / spring takeoff sound!
  playTakeoff() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.16);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
      osc.start(now);
      osc.stop(now + 0.24);
    } catch (e) {}
  }

  playFlap() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.10);

      gain.gain.setValueAtTime(0.26, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.10);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
      osc.start(now);
      osc.stop(now + 0.11);
    } catch (e) {}
  }

  playCoin() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [1174, 1760, 2349].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const delay = idx * 0.045;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.28, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
        osc.start(now + delay);
        osc.stop(now + delay + 0.24);
      });
    } catch (e) {}
  }

  playDiamond() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [1318, 1975, 2637, 3136].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const delay = idx * 0.04;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.3, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.26);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
        osc.start(now + delay);
        osc.stop(now + delay + 0.28);
      });
    } catch (e) {}
  }

  playShieldCollect() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [587, 880, 1174, 1480].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const delay = idx * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.32, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
        osc.start(now + delay);
        osc.stop(now + delay + 0.30);
      });
    } catch (e) {}
  }

  playShieldBreak() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.26);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {}
  }

  playMagnetCollect() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(960, now + 0.18);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {}
  }

  playScore() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(940, now);
      osc.frequency.setValueAtTime(1280, now + 0.06);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
      osc.start(now);
      osc.stop(now + 0.20);
    } catch (e) {}
  }

  playLevelUp() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.32, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.24);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
        osc.start(start);
        osc.stop(start + 0.26);
      });
    } catch (e) {}
  }

  playHit() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

      gain.gain.setValueAtTime(0.40, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.20);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  playGameOver() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [440, 392, 349, 247];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.11;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.24, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
        osc.start(start);
        osc.stop(start + 0.24);
      });
    } catch (e) {}
  }

  playRingPass() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const freqs = [784, 1046.5, 1318.5, 1568];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.035;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.26, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
        osc.start(start);
        osc.stop(start + 0.24);
      });
    } catch (e) {}
  }

  playCombo() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
        osc.start(now);
        osc.stop(now + 0.38);
      });
    } catch (e) {}
  }

  playDangerAlert() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [440, 880, 440, 880].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.08;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.24, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.07);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
        osc.start(start);
        osc.stop(start + 0.08);
      });
    } catch (e) {}
  }

  playPowerRush() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // High-energy ascending arpeggio chord
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.045;
        osc.type = idx > 4 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.32, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
        osc.start(start);
        osc.stop(start + 0.38);
      });
    } catch (e) {}
  }

  playPowerEnd() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.28);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.30);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
      osc.start(now);
      osc.stop(now + 0.32);
    } catch (e) {}
  }
}

// Funny Quotes
const FUNNY_DEATH_QUOTES = [
  "Emotional damage! 💀",
  "That pipe came out of nowhere, right?",
  "Gravity: 1 • Bird: 0 🪦",
  "Certified Skill Issue! 🤦",
  "Those pipes have personal beef with you.",
  "Did you forget how to flap? 🪽",
  "Oof! The floor is NOT lava, but it hurts.",
  "Bonk of the Century! 💥",
  "At least your crown stayed shiny! 👑"
];

// ==========================================
// 5 AWESOME REALMS (Castle Removed! Pure Beautiful Nature & Highlands)
// ==========================================
const THEMES = [
  {
    id: 0,
    name: "☀️ Emerald Valley",
    subtitle: "Flap gently through sunny meadows!",
    skyTop: "#1e88e5",
    skyMid: "#64b5f6",
    skyBot: "#bbdefb",
    sunColor: "#fff9c4",
    sunGlow: "rgba(255, 238, 88, 0.45)",
    sunY: 130,
    showMoon: false,
    cloudColor: "#ffffff",
    cloudShade: "#bbdefb",
    mountainColor: "#32629b",
    hillFar: "#5cbf60",
    hillMid: "#43a047",
    hillNear: "#2e7d32",
    pipeBase: "#388e3c",
    pipeHighlight: "#66bb6a",
    pipeShadow: "#1b5e20",
    pipeOutline: "#0c3b12",
    hasFireflies: false,
    hasAurora: false,
    hasShootingStars: false
  },
  {
    id: 1,
    name: "🌅 Sunset Canyon",
    subtitle: "Surprise: Shields & Magnets Unlocked! 🛡️🧲",
    skyTop: "#3e1254",
    skyMid: "#c2185b",
    skyBot: "#ffb74d",
    sunColor: "#ff7043",
    sunGlow: "rgba(255, 112, 67, 0.5)",
    sunY: 250,
    showMoon: false,
    cloudColor: "#ffe0b2",
    cloudShade: "#ad1457",
    mountainColor: "#51175e",
    hillFar: "#7b1fa2",
    hillMid: "#6d4c41",
    hillNear: "#4e342e",
    pipeBase: "#e65100",
    pipeHighlight: "#ffb74d",
    pipeShadow: "#bf360c",
    pipeOutline: "#5c1d00",
    hasFireflies: true,
    hasAurora: false,
    hasShootingStars: false
  },
  {
    id: 2,
    name: "🌙 Starry Twilight",
    subtitle: "Surprise: Moving Pipes & Cosmic Stars! ⭐",
    skyTop: "#050b1a",
    skyMid: "#0d1b3e",
    skyBot: "#1a237e",
    sunColor: "#ffffff",
    sunGlow: "rgba(255, 255, 255, 0.2)",
    sunY: -100,
    showMoon: true,
    cloudColor: "#1a237e",
    cloudShade: "#0d1b3e",
    mountainColor: "#0b1533",
    hillFar: "#152a5c",
    hillMid: "#1b5e20",
    hillNear: "#0d3b13",
    pipeBase: "#1b5e20",
    pipeHighlight: "#4caf50",
    pipeShadow: "#0d3b13",
    pipeOutline: "#061a08",
    hasFireflies: true,
    hasAurora: false,
    hasShootingStars: true
  },
  {
    id: 3,
    name: "⚡ Mystical Aurora",
    subtitle: "Surprise: 5x Diamond Rush & Glowing Skies! 💎",
    skyTop: "#090426",
    skyMid: "#1a0f4c",
    skyBot: "#004d40",
    sunColor: "#00e676",
    sunGlow: "rgba(0, 230, 118, 0.35)",
    sunY: -100,
    showMoon: true,
    cloudColor: "#311b92",
    cloudShade: "#004d40",
    mountainColor: "#180d38",
    hillFar: "#004d40",
    hillMid: "#00695c",
    hillNear: "#00796b",
    pipeBase: "#00b0ff",
    pipeHighlight: "#80d8ff",
    pipeShadow: "#006064",
    pipeOutline: "#002f35",
    hasFireflies: true,
    hasAurora: true,
    hasShootingStars: true
  },
  {
    id: 4,
    name: "👑 Celestial Heaven",
    subtitle: "Surprise: Rainbow Godmode Flight! 🌈✨",
    skyTop: "#311b92",
    skyMid: "#ad1457",
    skyBot: "#ffd54f",
    sunColor: "#fff9c4",
    sunGlow: "rgba(255, 213, 79, 0.6)",
    sunY: 120,
    showMoon: false,
    cloudColor: "#fff8e1",
    cloudShade: "#ff80ab",
    mountainColor: "#4a148c",
    hillFar: "#ffb300",
    hillMid: "#f57c00",
    hillNear: "#e65100",
    pipeBase: "#ffca28",
    pipeHighlight: "#fff9c4",
    pipeShadow: "#b26a00",
    pipeOutline: "#5c3300",
    hasFireflies: true,
    hasAurora: true,
    hasShootingStars: true
  }
];

// High-Speed Arcade Physics Configuration
const CONFIG = {
  V_WIDTH: 440,
  V_HEIGHT: 740,
  GRAVITY: 0.42,
  FLAP_POWER: -7.8,
  MAX_FALL_SPEED: 12.0,
  PIPE_SPEED_BASE: 3.55,
  PIPE_SPAWN_INTERVAL: 98,
  PIPE_GAP: 165,
  PIPE_WIDTH: 72,
  GROUND_HEIGHT: 95
};

// ==========================================
// GAME STATE MANAGEMENT
// ==========================================
class FlyBirdGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.sound = new SoundFX();
    this.particles = new ParticlePool(140);

    // DOM UI Elements
    this.startScreen = document.getElementById('start-screen');
    this.gameoverScreen = document.getElementById('gameover-screen');
    this.pauseScreen = document.getElementById('pause-screen');
    this.inGameScoreEl = document.getElementById('in-game-score');
    this.coinCountEl = document.getElementById('coin-count');
    this.realmIndicatorEl = document.getElementById('realm-indicator');
    this.realmPillEl = document.getElementById('realm-pill');
    this.bestScoreDisplay = document.getElementById('best-score-display');
    this.finalScoreEl = document.getElementById('final-score');
    this.finalBestEl = document.getElementById('final-best');
    this.newRecordTag = document.getElementById('new-record-tag');
    this.finalCoinsEl = document.getElementById('final-coins');
    this.finalRealmEl = document.getElementById('final-realm');
    this.funnyQuoteEl = document.getElementById('funny-quote');
    this.medalDisplayEl = document.getElementById('medal-display');
    this.muteBtn = document.getElementById('mute-btn');
    this.pauseBtn = document.getElementById('pause-btn');

    // Powerup & Level Banner UI
    this.shieldPillEl = document.getElementById('shield-pill');
    this.magnetPillEl = document.getElementById('magnet-pill');
    this.magnetTimerTxt = document.getElementById('magnet-timer-txt');
    this.levelBannerEl = document.getElementById('level-banner');
    this.bannerBadgeEl = document.getElementById('banner-badge');
    this.bannerTextEl = document.getElementById('banner-text');
    this.bannerSubEl = document.getElementById('banner-sub');
    this.bannerTimeoutId = null;

    // Floating Combo Streak Banner
    this.comboBannerEl = document.getElementById('combo-banner');
    this.comboTextEl = document.getElementById('combo-text');
    this.comboTimeoutId = null;

    // State Variables
    this.state = 'START';
    this.score = 0;
    this.coins = 0;
    this.totalCoins = parseInt(localStorage.getItem('flybird_coins') || '0', 10);
    this.bestScore = parseInt(localStorage.getItem('flybird_best') || '0', 10);
    this.frame = 0;
    this.speed = CONFIG.PIPE_SPEED_BASE;
    this.shakeTime = 0;
    this.pipeSpawnTimer = 0;

    // Royal Shield Milestones: strictly spawned once at 100, 300, 600, 1000
    this.shieldMilestones = [100, 300, 600, 1000];
    this.shieldMilestonesSpawned = { 100: false, 300: false, 600: false, 1000: false };
    this.pipeStreak = 0;
    this.dangerAlertTriggered = false;

    // Turbo Power Rush Feature at Score 250 (+50 points warp speed, flattened pipes)
    this.powerRush = false;
    this.powerRushEndScore = 0;
    this.powerRushTriggered = false;
    this.powerRushTimer = 0;
    this.nightmareTriggered = false; // 100% moving pipes at score 500+

    // Power-up States
    this.hasShield = false;
    this.invulnerableTimer = 0; // After shield breaks
    this.magnetTimer = 0; // In frames (~60fps)

    // Theme state
    this.activeThemeIdx = 0;
    this.prevThemeIdx = 0;
    this.themeTransition = 1.0;

    // Start Oak Tree & Nest (Bird takes off from here!)
    this.tree = {
      x: 25,
      targetNestX: 110,
      nestY: 370,
      sway: 0
    };

    // Player Bird
    this.bird = {
      x: 110,
      y: 354, // Perfectly nestled in tree nest at start
      vy: 0,
      radius: 20,
      angle: 0,
      wingTimer: 0,
      blinkTimer: 0,
      isBlinking: false,
      skin: localStorage.getItem('flybird_skin') || 'blue'
    };

    this.pipes = [];
    this.collectibles = []; // Coins, diamonds, shields, magnets, stars
    this.clouds = [];
    this.stars = [];
    this.fireflies = [];
    this.groundScroll = 0;
    this.hillFarScroll = 0;
    this.hillMidScroll = 0;
    this.hillNearScroll = 0;
    this.lastActionTimestamp = 0;

    this.initAtmosphere();
    this.setupResolution();
    this.bindEvents();
    this.updateHUD();
    this.updateHeroPickerUI();

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  // Crystal Clear Retina DPR: 2.0 on both mobile and desktop for razor-sharp graphics!
  setupResolution() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.0);

    this.width = CONFIG.V_WIDTH;
    this.height = CONFIG.V_HEIGHT;

    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  initAtmosphere() {
    this.clouds = [
      { x: 30, y: 70, scale: 0.95, speed: 0.4 },
      { x: 210, y: 130, scale: 1.25, speed: 0.55 },
      { x: 380, y: 55, scale: 0.75, speed: 0.35 },
      { x: 130, y: 200, scale: 0.85, speed: 0.45 }
    ];

    this.stars = [];
    for (let i = 0; i < 40; i++) {
      this.stars.push({
        x: Math.random() * CONFIG.V_WIDTH,
        y: Math.random() * (CONFIG.V_HEIGHT * 0.65),
        radius: 0.8 + Math.random() * 1.6,
        twinkleSpeed: 0.03 + Math.random() * 0.05,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }

    this.fireflies = [];
    for (let i = 0; i < 16; i++) {
      this.fireflies.push({
        x: Math.random() * CONFIG.V_WIDTH,
        y: 200 + Math.random() * (CONFIG.V_HEIGHT - CONFIG.GROUND_HEIGHT - 220),
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.5,
        pulseSpeed: 0.05 + Math.random() * 0.05,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.setupResolution());

    const handleAction = (e) => {
      const now = performance.now();
      if (now - this.lastActionTimestamp < 60) return;
      this.lastActionTimestamp = now;

      if (e && e.target && (e.target.closest('#mute-btn') || e.target.closest('#pause-btn') || e.target.closest('.hero-card-btn') || e.target.closest('.royal-hero-picker'))) {
        return;
      }

      this.sound.ensureContext();

      if (this.state === 'START') {
        this.startGame();
      } else if (this.state === 'PLAYING') {
        this.flap();
      } else if (this.state === 'GAMEOVER') {
        if (this.gameOverDelay <= 0) {
          this.resetGame();
        }
      }
    };

    // Mobile Direct Touch (Passive: false, prevents delay and zoom)
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleAction(e);
    }, { passive: false });

    // Desktop Pointer Down
    this.canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') {
        e.preventDefault();
        handleAction(e);
      }
    });

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        handleAction(null);
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        this.togglePause();
      } else if (e.code === 'KeyM') {
        this.toggleMute();
      }
    });

    // Royal Hero Picker Buttons (Blue Prince vs Red King)
    const btnBlue = document.getElementById('hero-btn-blue');
    if (btnBlue) {
      const pickBlue = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setBirdSkin('blue');
      };
      btnBlue.addEventListener('touchstart', pickBlue, { passive: false });
      btnBlue.addEventListener('click', pickBlue);
    }

    const btnRed = document.getElementById('hero-btn-red');
    if (btnRed) {
      const pickRed = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setBirdSkin('red');
      };
      btnRed.addEventListener('touchstart', pickRed, { passive: false });
      btnRed.addEventListener('click', pickRed);
    }

    // Interactive Buttons
    const tapBtn = document.getElementById('tap-to-fly-btn');
    if (tapBtn) {
      const handleTapBtn = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleAction(null);
      };
      tapBtn.addEventListener('touchstart', handleTapBtn, { passive: false });
      tapBtn.addEventListener('click', handleTapBtn);
    }

    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) {
      const handleRestart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.resetGame();
      };
      playAgainBtn.addEventListener('touchstart', handleRestart, { passive: false });
      playAgainBtn.addEventListener('click', handleRestart);
    }

    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
      const handleResume = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.togglePause();
      };
      resumeBtn.addEventListener('touchstart', handleResume, { passive: false });
      resumeBtn.addEventListener('click', handleResume);
    }

    const pauseRestartBtn = document.getElementById('pause-restart-btn');
    if (pauseRestartBtn) {
      const handlePauseRestart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.resetGame();
      };
      pauseRestartBtn.addEventListener('touchstart', handlePauseRestart, { passive: false });
      pauseRestartBtn.addEventListener('click', handlePauseRestart);
    }

    this.muteBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMute();
    });

    this.pauseBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePause();
    });

    this.updateMuteIcon();
  }

  setBirdSkin(skin) {
    if (skin !== 'blue' && skin !== 'red') return;
    this.bird.skin = skin;
    localStorage.setItem('flybird_skin', skin);
    this.updateHeroPickerUI();
    this.sound.playHeroSelect();

    // Celebration burst of royal sparkles around nest when changing heroes!
    if (this.state === 'START') {
      const colors = (skin === 'red')
        ? ['#ff1744', '#ffd700', '#ff8a80', '#ffffff']
        : ['#2196f3', '#ffd700', '#90caf9', '#ffffff'];
      for (let i = 0; i < 16; i++) {
        const angle = (Math.PI * 2 * i) / 16 + Math.random() * 0.2;
        const speed = 2.0 + Math.random() * 3.5;
        this.particles.spawn(
          this.bird.x + (Math.random() - 0.5) * 12,
          this.bird.y + (Math.random() - 0.5) * 12,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          3.5 + Math.random() * 3.5,
          colors[Math.floor(Math.random() * colors.length)],
          26,
          'sparkle'
        );
      }
    }
  }

  updateHeroPickerUI() {
    const currentSkin = this.bird ? (this.bird.skin || 'blue') : 'blue';
    const btnBlue = document.getElementById('hero-btn-blue');
    const btnRed = document.getElementById('hero-btn-red');
    if (btnBlue) btnBlue.classList.toggle('active', currentSkin === 'blue');
    if (btnRed) btnRed.classList.toggle('active', currentSkin === 'red');
  }

  toggleMute() {
    this.sound.toggleMute();
    this.updateMuteIcon();
  }

  updateMuteIcon() {
    const isMuted = this.sound.muted;
    const svgEl = document.getElementById('sound-icon-svg');
    if (svgEl) {
      if (isMuted) {
        svgEl.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
      } else {
        svgEl.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
      }
    }
  }

  // ==========================================
  // TREE JUMP TAKEOFF (Start Screen Leap)
  // ==========================================
  startGame() {
    this.state = 'PLAYING';
    this.startScreen.classList.remove('active');
    this.gameoverScreen.classList.remove('active');
    this.pauseScreen.classList.remove('active');
    this.pipeSpawnTimer = -35; // Ample runway to flap after leaping from tree

    // Bird springs up out of the nest!
    this.bird.vy = CONFIG.FLAP_POWER * 1.08;
    this.bird.angle = -0.35;
    this.bird.wingTimer = 1.0;

    this.sound.playTakeoff();
    this.sound.startMusic();

    // Burst of leaves & feathers flying from the tree nest!
    const nestX = this.tree.x + 85;
    const nestY = this.tree.nestY;

    for (let i = 0; i < 14; i++) {
      const angle = -Math.PI * 0.2 - Math.random() * Math.PI * 0.6;
      const speed = 2.5 + Math.random() * 4.5;
      this.particles.spawn(
        nestX + (Math.random() - 0.5) * 20,
        nestY - 5 + (Math.random() - 0.5) * 12,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        4.5 + Math.random() * 4,
        ['#4caf50', '#81c784', '#aed581', '#ffd54f'][Math.floor(Math.random() * 4)],
        35 + Math.random() * 20,
        'leaf'
      );
    }

    this.spawnFeathers();
  }

  flap() {
    if (this.state !== 'PLAYING') return;
    this.bird.vy = CONFIG.FLAP_POWER;
    this.bird.wingTimer = 1.0;
    this.sound.playFlap();
    this.spawnFeathers();

    // Sparkles
    for (let i = 0; i < 3; i++) {
      this.particles.spawn(
        this.bird.x + (Math.random() - 0.5) * 16,
        this.bird.y - 18 + (Math.random() - 0.5) * 8,
        -2.2 - Math.random() * 2,
        (Math.random() - 0.5) * 2,
        2.5 + Math.random() * 2,
        '#ffd54f',
        22
      );
    }
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.pauseScreen.classList.add('active');
      this.sound.pauseMusic();
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.pauseScreen.classList.remove('active');
      this.lastTime = performance.now();
      this.sound.resumeMusic();
    }
  }

  resetGame() {
    this.state = 'START';
    this.sound.stopMusic();
    this.sound.setMusicIntensity(0);
    this.score = 0;
    this.coins = 0;
    this.frame = 0;
    this.speed = CONFIG.PIPE_SPEED_BASE;
    this.shakeTime = 0;
    this.pipeSpawnTimer = 0;
    this.hasShield = false;
    this.invulnerableTimer = 0;
    this.magnetTimer = 0;

    // Reset shield milestones & streaks
    this.shieldMilestonesSpawned = { 100: false, 300: false, 600: false, 1000: false };
    this.pipeStreak = 0;
    this.dangerAlertTriggered = false;
    this.powerRush = false;
    this.powerRushEndScore = 0;
    this.powerRushTriggered = false;
    this.powerRushTimer = 0;
    this.nightmareTriggered = false;
    this.comboBannerEl?.classList.remove('active');

    this.activeThemeIdx = 0;
    this.prevThemeIdx = 0;
    this.themeTransition = 1.0;
    this.pipes = [];
    this.collectibles = [];
    this.particles.clear();

    // Reset tree and perch bird back in nest
    this.tree.x = 25;
    this.bird.x = 110;
    this.bird.y = 354;
    this.bird.vy = 0;
    this.bird.angle = 0;

    this.startScreen.classList.add('active');
    this.gameoverScreen.classList.remove('active');
    this.pauseScreen.classList.remove('active');
    this.updateHUD();
    this.updateHeroPickerUI();
  }

  triggerCombo(streak) {
    if (!this.comboBannerEl || !this.comboTextEl) return;
    let title = `STREAK x${streak}! 🔥`;
    if (streak >= 100) title = `CENTURY GOD x${streak}! 🏆👑`;
    else if (streak >= 75) title = `IMMORTAL BIRD x${streak}! 🌟`;
    else if (streak >= 50) title = `LEGENDARY RUN x${streak}! 👑`;
    else if (streak >= 35) title = `LIGHTNING FLIGHT x${streak}! ⚡`;
    else if (streak >= 20) title = `WING MASTER x${streak}! 🌪️`;
    else if (streak >= 10) title = `ROYAL COMBO x${streak}! ⚡`;

    this.triggerComboBanner(title);
    this.sound.playCombo();

    // Sparkles on combo
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      this.particles.spawn(
        CONFIG.V_WIDTH / 2,
        140,
        Math.cos(angle) * 3,
        Math.sin(angle) * 3,
        3.5 + Math.random() * 3,
        ['#ffeb3b', '#ff9800', '#00e5ff', '#ffffff'][i % 4],
        28,
        'circle'
      );
    }
  }

  triggerComboBanner(title) {
    if (!this.comboBannerEl || !this.comboTextEl) return;
    this.comboTextEl.textContent = title;
    this.comboBannerEl.classList.remove('active');
    // Force layout reflow so animation re-triggers
    void this.comboBannerEl.offsetWidth;
    this.comboBannerEl.classList.add('active');

    clearTimeout(this.comboTimeoutId);
    this.comboTimeoutId = setTimeout(() => {
      this.comboBannerEl?.classList.remove('active');
    }, 2200);
  }

  // ==========================================
  // 5 REALMS & LEVEL SURPRISES
  // ==========================================
  checkThemeMilestones() {
    let targetIdx = 0;
    if (this.score >= 70) {
      targetIdx = 4; // Celestial Heaven (70+)
    } else if (this.score >= 45) {
      targetIdx = 3; // Mystical Aurora (45+)
    } else if (this.score >= 25) {
      targetIdx = 2; // Starry Twilight (25+)
    } else if (this.score >= 10) {
      targetIdx = 1; // Sunset Canyon (10+)
    } else {
      targetIdx = 0; // Emerald Valley
    }

    if (targetIdx !== this.activeThemeIdx) {
      this.prevThemeIdx = this.activeThemeIdx;
      this.activeThemeIdx = targetIdx;
      this.themeTransition = 0.0;

      // Update corner HUD pill (Non-intrusive corner display only!)
      if (this.realmIndicatorEl) {
        this.realmIndicatorEl.textContent = THEMES[targetIdx].name;
      }
      if (this.realmPillEl) {
        this.realmPillEl.classList.remove('realm-glow-pop');
        this.realmPillEl.classList.add('realm-glow-pop');
      }

      this.sound.setMusicIntensity(targetIdx);
      this.sound.playLevelUp();
      // Middle screen level popups suppressed so player only sees combo streaks!
    }
  }

  triggerLevelBanner(themeIdx) {
    const theme = THEMES[themeIdx];
    if (!this.levelBannerEl) return;

    if (this.bannerBadgeEl) this.bannerBadgeEl.textContent = `LEVEL UP! 🌟 (Stage ${themeIdx + 1})`;
    if (this.bannerTextEl) this.bannerTextEl.textContent = theme.name;
    if (this.bannerSubEl) this.bannerSubEl.textContent = theme.subtitle;

    this.levelBannerEl.classList.add('active');

    // Confetti celebration
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24;
      const speed = 2 + Math.random() * 5;
      this.particles.spawn(
        CONFIG.V_WIDTH / 2,
        100,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        4 + Math.random() * 4,
        ['#ffd54f', '#ff4081', '#00e5ff', '#76ff03', '#ffffff'][Math.floor(Math.random() * 5)],
        45,
        'confetti'
      );
    }

    clearTimeout(this.bannerTimeoutId);
    this.bannerTimeoutId = setTimeout(() => {
      this.levelBannerEl?.classList.remove('active');
    }, 2800);
  }

  gameOver() {
    if (this.state === 'GAMEOVER') return;
    this.state = 'GAMEOVER';
    this.sound.stopMusic();
    this.gameOverDelay = 22;
    this.shakeTime = 20;

    this.sound.playHit();
    setTimeout(() => this.sound.playGameOver(), 200);

    const isNewBest = this.score > this.bestScore;
    if (isNewBest) {
      this.bestScore = this.score;
      localStorage.setItem('flybird_best', this.bestScore);
    }
    this.totalCoins += this.coins;
    localStorage.setItem('flybird_coins', this.totalCoins);

    // Update Game Over Dialog
    if (this.finalScoreEl) this.finalScoreEl.textContent = this.score;
    if (this.finalBestEl) this.finalBestEl.textContent = this.bestScore;
    if (this.finalCoinsEl) this.finalCoinsEl.textContent = `+${this.coins}`;
    if (this.finalRealmEl) this.finalRealmEl.textContent = THEMES[this.activeThemeIdx].name;

    if (this.funnyQuoteEl) {
      const randomQuote = FUNNY_DEATH_QUOTES[Math.floor(Math.random() * FUNNY_DEATH_QUOTES.length)];
      this.funnyQuoteEl.textContent = randomQuote;
    }

    if (this.newRecordTag) {
      this.newRecordTag.style.display = isNewBest && this.score > 0 ? 'inline-block' : 'none';
    }

    // Rank badges
    let medal = 'None';
    let icon = '—';
    if (this.score >= 70) {
      medal = 'Celestial Legend 👑';
      icon = '👑';
    } else if (this.score >= 45) {
      medal = 'Aurora Champion 💎';
      icon = '💎';
    } else if (this.score >= 25) {
      medal = 'Golden Chad 🥇';
      icon = '🥇';
    } else if (this.score >= 15) {
      medal = 'Silver Eagle 🥈';
      icon = '🥈';
    } else if (this.score >= 7) {
      medal = 'Bronze Wing 🥉';
      icon = '🥉';
    } else {
      medal = 'Moldy Potato 🥔';
      icon = '🥔';
    }
    if (this.medalDisplayEl) {
      this.medalDisplayEl.innerHTML = `<span class="medal-icon">${icon}</span> ${medal}`;
    }

    this.gameoverScreen.classList.add('active');
    this.updateHUD();

    // Explosion particles
    for (let i = 0; i < 28; i++) {
      const angle = (Math.PI * 2 * i) / 28;
      const speed = 2 + Math.random() * 6;
      this.particles.spawn(
        this.bird.x,
        this.bird.y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        4 + Math.random() * 6,
        ['#ffeb3b', '#ff9800', '#f44336', '#ffffff'][Math.floor(Math.random() * 4)],
        38
      );
    }
  }

  updateHUD() {
    if (this.inGameScoreEl) {
      this.inGameScoreEl.textContent = this.score;
      this.inGameScoreEl.style.display = this.state === 'PLAYING' ? 'block' : 'none';
    }
    if (this.coinCountEl) {
      this.coinCountEl.textContent = this.state === 'PLAYING' ? this.coins : this.totalCoins;
    }
    if (this.bestScoreDisplay) {
      this.bestScoreDisplay.textContent = this.bestScore;
    }
    if (this.realmIndicatorEl) {
      this.realmIndicatorEl.textContent = THEMES[this.activeThemeIdx].name;
    }

    // Powerup Pills
    if (this.shieldPillEl) {
      this.shieldPillEl.style.display = this.hasShield ? 'inline-flex' : 'none';
    }
    if (this.magnetPillEl) {
      this.magnetPillEl.style.display = this.magnetTimer > 0 ? 'inline-flex' : 'none';
      if (this.magnetTimerTxt) {
        const secs = Math.ceil(this.magnetTimer / 60);
        this.magnetTimerTxt.textContent = `MAGNET ${secs}s`;
      }
    }
  }

  // ==========================================
  // SPAWN PIPES & COLLECTIBLE SURPRISES
  // ==========================================
  spawnPipes() {
    // Anti-duplicate protection: strictly ensure pipes are never spawned on top of each other!
    if (this.pipes.length > 0) {
      const last = this.pipes[this.pipes.length - 1];
      if (CONFIG.V_WIDTH + 20 - last.x < 185) {
        return;
      }
    }

    const groundTop = CONFIG.V_HEIGHT - CONFIG.GROUND_HEIGHT;

    // TIERED ARCADE DIFFICULTY & POWER RUSH OBSTACLES:
    let currentGap = 165;
    let isMoving = false;
    let moveAmp = 18;
    let moveSpeed = 0.032;

    if (this.powerRush) {
      // POWER RUSH MODE (Score 250-300): Obstacles flatten completely to the ground!
      currentGap = 999;
      isMoving = false;
    } else if (this.score < 50) {
      // 0 to 50: "Dificil - nu prea easy!" (Culoar strâns 164-156px, țevi mobile de la scor 15)
      currentGap = Math.max(156, 164 - (this.score / 50) * 8);
      isMoving = this.score >= 15 && Math.random() < 0.40;
      moveAmp = 16;
      moveSpeed = 0.028;
    } else if (this.score < 125) {
      // 51 to 124: "Mai Complicat" - culoar (156 to 148px), 70% moving obstacles
      currentGap = Math.max(148, 156 - ((this.score - 50) / 75) * 8);
      isMoving = Math.random() < 0.70;
      moveAmp = 22;
      moveSpeed = 0.034 + Math.random() * 0.012;
    } else if (this.score < 250) {
      // 125 to 249: "Mult Mai Complicat" - culoar (148 to 142px), 85% moving obstacles
      currentGap = Math.max(142, 148 - ((this.score - 125) / 125) * 6);
      isMoving = Math.random() < 0.85;
      moveAmp = 28;
      moveSpeed = 0.040 + Math.random() * 0.014;
    } else if (this.score < 500) {
      // 300 to 499: Master Tier after Turbo - culoar (142 to 136px), 90% moving obstacles
      currentGap = Math.max(136, 142 - ((this.score - 300) / 200) * 6);
      isMoving = Math.random() < 0.90;
      moveAmp = 32;
      moveSpeed = 0.046 + Math.random() * 0.016;
    } else {
      // 500+: "DE LA 500 SA SE MISTE SA FIE COMPLICAT" - NIGHTMARE MODE!
      // 100% of obstacles move dynamically with wide amplitudes & rapid vertical shifts!
      currentGap = Math.max(132, 136 - Math.min(4, ((this.score - 500) / 300) * 4));
      isMoving = true;
      moveAmp = Math.min(45, 36 + Math.random() * 9);
      moveSpeed = 0.056 + Math.random() * 0.022;
    }

    let topHeight = 90;
    let bottomY = groundTop;

    if (this.powerRush) {
      // Flattened down into the earth during Power Rush!
      topHeight = 0;
      bottomY = groundTop + 35;
    } else {
      const minTop = 90;
      const maxTop = groundTop - currentGap - 90;
      topHeight = minTop + Math.random() * (maxTop - minTop);
      bottomY = topHeight + currentGap;
    }

    const pipeX = CONFIG.V_WIDTH + 20;

    const newPipe = {
      x: pipeX,
      topHeight: topHeight,
      baseTopHeight: topHeight,
      bottomY: bottomY,
      width: CONFIG.PIPE_WIDTH,
      gap: currentGap,
      passed: false,
      hitDeflected: false,
      isMoving: isMoving,
      movePhase: Math.random() * Math.PI * 2,
      moveSpeed: moveSpeed,
      moveAmp: moveAmp
    };

    this.pipes.push(newPipe);

    // Collectibles & Power-Up Spawning
    const itemRoll = Math.random();
    const itemX = pipeX + CONFIG.PIPE_WIDTH / 2;
    const itemY = topHeight + currentGap / 2;

    // Guaranteed Royal Shield spawn strictly at milestone checkpoints: 100, 300, 600, 1000!
    let shouldSpawnShield = false;
    for (const m of this.shieldMilestones) {
      if (this.score >= m && !this.shieldMilestonesSpawned[m]) {
        this.shieldMilestonesSpawned[m] = true;
        shouldSpawnShield = true;
        break;
      }
    }

    if (shouldSpawnShield) {
      this.collectibles.push({
        type: 'shield',
        parentPipe: newPipe,
        x: itemX,
        y: itemY,
        radius: 17,
        collected: false,
        bobPhase: Math.random() * Math.PI * 2
      });
    }
    // Power-up: Coin Magnet appears frequently (~28% chance when not active, starting from score >= 5!)
    else if (this.score >= 5 && this.magnetTimer <= 0 && itemRoll < 0.28) {
      this.collectibles.push({
        type: 'magnet',
        parentPipe: newPipe,
        x: itemX,
        y: itemY,
        radius: 16,
        collected: false,
        bobPhase: Math.random() * Math.PI * 2
      });
    }
    // Celestial Speed Boost Ring (+5 Coins, +5 Pts, and Golden Shockwave!)
    else if (itemRoll < 0.44) {
      this.collectibles.push({
        type: 'ring',
        parentPipe: newPipe,
        x: itemX,
        y: itemY,
        radius: 20,
        collected: false,
        bobPhase: Math.random() * Math.PI * 2,
        rot: 0
      });
    }
    // Rare Diamond Gems (score >= 45, 5x coins & points!)
    else if (this.score >= 45 && itemRoll < 0.60) {
      this.collectibles.push({
        type: 'diamond',
        parentPipe: newPipe,
        x: itemX,
        y: itemY,
        radius: 15,
        collected: false,
        bobPhase: Math.random() * Math.PI * 2
      });
    }
    // Starlight Star Coins (score >= 25, 3x coins)
    else if (this.score >= 25 && itemRoll < 0.76) {
      this.collectibles.push({
        type: 'star',
        parentPipe: newPipe,
        x: itemX,
        y: itemY,
        radius: 15,
        collected: false,
        bobPhase: Math.random() * Math.PI * 2
      });
    }
    // Classic Golden Coins
    else {
      this.collectibles.push({
        type: 'coin',
        parentPipe: newPipe,
        x: itemX,
        y: itemY,
        radius: 14,
        collected: false,
        bobPhase: Math.random() * Math.PI * 2
      });
    }
  }

  spawnFeathers() {
    const isRedKing = (this.bird.skin === 'red');
    for (let i = 0; i < 4; i++) {
      const col = isRedKing 
        ? (Math.random() < 0.65 ? '#ff5252' : '#ffe082') 
        : (Math.random() < 0.65 ? '#90caf9' : '#ffffff');
      this.particles.spawn(
        this.bird.x - 18 + Math.random() * 8,
        this.bird.y + 4 + Math.random() * 8,
        -2.0 - Math.random() * 2,
        (Math.random() - 0.5) * 2.5,
        3.5 + Math.random() * 3,
        col,
        20,
        'feather'
      );
    }
  }

  spawnCoinSparkles(x, y, color = '#ffca28') {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.2;
      const speed = 2.5 + Math.random() * 3.5;
      this.particles.spawn(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        3 + Math.random() * 4,
        color,
        24
      );
    }
  }

  // ==========================================
  // PHYSICS & UPDATE LOOP (Delta-Time Independent)
  // ==========================================
  update(dt = 1) {
    if (this.state === 'PAUSED') return;

    this.frame += dt;
    if (this.gameOverDelay > 0) this.gameOverDelay -= dt;
    if (this.shakeTime > 0) this.shakeTime -= dt;
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;

    if (this.magnetTimer > 0) {
      this.magnetTimer -= dt;
      if (this.magnetTimer <= 0) {
        this.magnetTimer = 0;
        this.updateHUD();
      }
    }

    if (this.themeTransition < 1.0) {
      this.themeTransition = Math.min(1.0, this.themeTransition + 0.02 * dt);
    }

    // Fireflies motion
    this.fireflies.forEach(f => {
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.pulsePhase += f.pulseSpeed * dt;
      if (f.x < -20) f.x = CONFIG.V_WIDTH + 20;
      if (f.x > CONFIG.V_WIDTH + 20) f.x = -20;
    });

    // START STATE: Bird resting in tree nest
    if (this.state === 'START') {
      const sway = Math.sin(this.frame * 0.04) * 2.8;
      this.tree.sway = sway;
      this.bird.y = 354 + sway;
      this.bird.angle = Math.sin(this.frame * 0.04) * 0.04;
      this.bird.wingTimer += 0.05 * dt;

      // Occasional gentle floating leaf from the tree
      if (Math.random() < 0.03 * dt) {
        this.particles.spawn(
          this.tree.x + 30 + Math.random() * 40,
          260 + Math.random() * 50,
          0.8 + Math.random() * 1.2,
          0.4 + Math.random() * 0.6,
          4 + Math.random() * 3,
          ['#4caf50', '#81c784', '#ffd54f'][Math.floor(Math.random() * 3)],
          80,
          'leaf'
        );
      }

      // Ground and scenery remain 100% STATIC until bird takes off!
      this.particles.update(dt);
      return;
    }

    // GAMEOVER STATE
    if (this.state === 'GAMEOVER') {
      if (this.bird.y + this.bird.radius < CONFIG.V_HEIGHT - CONFIG.GROUND_HEIGHT) {
        this.bird.vy += CONFIG.GRAVITY * 1.3 * dt;
        this.bird.y += this.bird.vy * dt;
        this.bird.angle = Math.min(Math.PI / 2, this.bird.angle + 0.14 * dt);
      }
      this.particles.update(dt);
      return;
    }

    // PLAYING STATE:
    if (this.powerRush) {
      this.speed = 10.5; // Supersonic warp speed!
      this.powerRushTimer += dt;
      // Rapid score accumulation: +1 point every 6 frames until reaching 300 (+50 points rush from 250!)
      if (this.powerRushTimer >= 6) {
        this.powerRushTimer = 0;
        this.score++;
        this.coins += 2;
        this.sound.playCoin();
        this.updateHUD();

        // Warp speed shockwave particles
        this.particles.spawn(
          this.bird.x - 24,
          this.bird.y + (Math.random() - 0.5) * 20,
          -9 - Math.random() * 5,
          (Math.random() - 0.5) * 4,
          4 + Math.random() * 4,
          ['#ffd700', '#00e5ff', '#ff3d00', '#ffffff'][Math.floor(Math.random() * 4)],
          24,
          'ring'
        );

        if (this.score >= this.powerRushEndScore) {
          this.powerRush = false;
          this.sound.playPowerEnd();
          this.triggerComboBanner("👑 TURBO FINISHED! MASTER CHALLENGE AHEAD! 🔥");
          this.particles.spawn(this.bird.x, this.bird.y, 0, 0, 50, '#ffd700', 35, 'ring');
          this.shakeTime = 16;
        }
      }
    } else {
      // Tiered Speed (Genuinely challenging arcade pacing):
      // 0 - 50: Engaging arcade speed (3.55 to 4.10)
      if (this.score < 50) {
        this.speed = 3.55 + (this.score / 50) * 0.55;
      }
      // 51 - 124: "Mai complicat" (4.10 to 4.65)
      else if (this.score < 125) {
        this.speed = 4.10 + ((this.score - 50) / 75) * 0.55;
      }
      // 125 - 249: "Mult mai complicat" (4.65 to 5.20)
      else if (this.score < 250) {
        this.speed = 4.65 + ((this.score - 125) / 125) * 0.55;
      }
      // 300 - 499: Master Tier after Turbo (5.10 to 5.65)
      else if (this.score < 500) {
        this.speed = 5.10 + ((this.score - 300) / 200) * 0.55;
      }
      // 500+: NIGHTMARE REALM SPEED (5.65 to 6.25)
      else {
        this.speed = 5.65 + Math.min(0.60, ((this.score - 500) / 300) * 0.60);
      }
    }

    this.scrollScenery(this.speed * dt);

    // Tree scrolls off-screen as bird flies forward
    if (this.tree.x > -280) {
      this.tree.x -= this.speed * dt;
    }

    // Bird gravity & physics
    this.bird.vy += CONFIG.GRAVITY * dt;
    this.bird.vy = Math.min(this.bird.vy, CONFIG.MAX_FALL_SPEED);
    this.bird.y += this.bird.vy * dt;

    if (this.bird.vy < 0) {
      this.bird.angle = Math.max(-0.48, this.bird.angle - 0.14 * dt);
    } else {
      this.bird.angle = Math.min(1.25, this.bird.angle + 0.05 * dt);
    }

    this.bird.wingTimer += (this.bird.vy < 0 ? 0.3 : 0.09) * dt;

    // Rainbow trail in Celestial Heaven (Score >= 70)
    if (this.score >= 70 || this.powerRush) {
      const rainbowColors = ['#ff1744', '#ff9100', '#ffea00', '#00e676', '#00b0ff', '#d500f9'];
      const rCol = rainbowColors[Math.floor(this.frame) % rainbowColors.length];
      this.particles.spawn(
        this.bird.x - 22,
        this.bird.y + (Math.random() - 0.5) * 6,
        -2.5 - Math.random() * 2,
        (Math.random() - 0.5) * 1.5,
        3.5 + Math.random() * 2.5,
        rCol,
        25
      );
    }

    // Blinking
    this.bird.blinkTimer += dt;
    if (this.bird.blinkTimer > 170 && Math.random() < 0.08) {
      this.bird.isBlinking = true;
      if (this.bird.blinkTimer > 182) {
        this.bird.isBlinking = false;
        this.bird.blinkTimer = 0;
      }
    }

    // Pipe Spawning with Timer Accumulator (Zero chance of duplicate/stacked pipes!)
    this.pipeSpawnTimer += dt;
    const spawnThreshold = Math.max(90, CONFIG.PIPE_SPAWN_INTERVAL - Math.floor(this.score / 6) * 3);
    if (this.pipeSpawnTimer >= spawnThreshold) {
      this.pipeSpawnTimer = 0;
      this.spawnPipes();
    }

    // Forgiving Arcade Hitbox (24x22 core body)
    const hbW = 24;
    const hbH = 22;
    const birdBox = {
      x: this.bird.x - hbW / 2,
      y: this.bird.y - hbH / 2,
      w: hbW,
      h: hbH
    };

    // Update Obstacle Pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const p = this.pipes[i];
      p.x -= this.speed * dt;

      // Moving pipes bob up and down smoothly within safe screen bounds
      if (p.isMoving && !this.powerRush) {
        p.movePhase += p.moveSpeed * dt;
        const groundTop = CONFIG.V_HEIGHT - CONFIG.GROUND_HEIGHT;
        const maxSafeTop = groundTop - p.gap - 85;
        p.topHeight = Math.max(90, Math.min(maxSafeTop, p.baseTopHeight + Math.sin(p.movePhase) * p.moveAmp));
        p.bottomY = p.topHeight + p.gap;
      }

      if (!p.passed && p.x + p.width < this.bird.x) {
        p.passed = true;
        this.score++;
        this.pipeStreak++;
        this.sound.playScore();
        this.checkThemeMilestones();
        this.updateHUD();

        // Combo streak alerts
        if ([5, 10, 20, 35, 50, 75, 100, 150, 200, 250].includes(this.pipeStreak)) {
          this.triggerCombo(this.pipeStreak);
        }

        // HYPER TURBO RUSH TRIGGER AT SCORE 250 (+50 PTS BOOST to 300):
        if (this.score >= 250 && !this.powerRushTriggered) {
          this.powerRushTriggered = true;
          this.powerRush = true;
          this.powerRushEndScore = 300; // exact 50 points of hyper speed turbo flight from 250 to 300!
          this.sound.playPowerRush();
          this.triggerComboBanner("⚡ HYPER TURBO RUSH! +50 PTS BOOST! 🚀💥");
          this.shakeTime = 18;

          // All obstacles flatten down into the earth!
          this.pipes.forEach(pp => {
            pp.topHeight = 0;
            pp.bottomY = CONFIG.V_HEIGHT - CONFIG.GROUND_HEIGHT + 35;
            pp.isMoving = false;
          });

          // Crumb/stone debris explosion as pipes sink
          for (let k = 0; k < 25; k++) {
            this.particles.spawn(
              CONFIG.V_WIDTH * 0.6 + (Math.random() - 0.5) * 120,
              CONFIG.V_HEIGHT - CONFIG.GROUND_HEIGHT,
              (Math.random() - 0.5) * 6,
              -2 - Math.random() * 5,
              4 + Math.random() * 4,
              '#795548',
              30,
              'confetti'
            );
          }
        }

        // NIGHTMARE REALM AT SCORE 500+ (100% Moving Obstacles!):
        if (this.score >= 500 && !this.nightmareTriggered) {
          this.nightmareTriggered = true;
          this.sound.playLevelUp();
          this.triggerComboBanner("💀 NIGHTMARE REALM 500+! 100% MOVING PIPES! 🔥🌪️");
          this.shakeTime = 22;
          for (let k = 0; k < 30; k++) {
            this.particles.spawn(
              CONFIG.V_WIDTH / 2 + (Math.random() - 0.5) * 120,
              CONFIG.V_HEIGHT / 2 + (Math.random() - 0.5) * 120,
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8,
              5 + Math.random() * 4,
              '#ff1744',
              35,
              'confetti'
            );
          }
        }

        if (this.inGameScoreEl) {
          this.inGameScoreEl.classList.remove('score-pop');
          void this.inGameScoreEl.offsetWidth; // Force CSS reflow so punch animation triggers every time!
          this.inGameScoreEl.classList.add('score-pop');
        }
      }

      // Pipe Collision
      if (this.checkPipeCollision(birdBox, p)) {
        // Shield Protection Check!
        if (this.hasShield) {
          this.hasShield = false;
          p.hitDeflected = true; // Mark pipe so it never hits the bird again!
          this.invulnerableTimer = 90; // 1.5s invulnerability
          this.pipeStreak = 0; // Reset combo streak on pipe strike
          this.sound.playShieldBreak();
          this.shakeTime = 14;

          // Shockwave explosion effect
          this.particles.spawn(this.bird.x, this.bird.y, 0, 0, 26, '#29b6f6', 22, 'ring');
          for (let k = 0; k < 18; k++) {
            const ang = (Math.PI * 2 * k) / 18;
            this.particles.spawn(
              this.bird.x,
              this.bird.y,
              Math.cos(ang) * 5,
              Math.sin(ang) * 5,
              4 + Math.random() * 4,
              '#64b5f6',
              28
            );
          }
          this.updateHUD();
        } else if (this.invulnerableTimer <= 0) {
          this.gameOver();
          return;
        }
      }

      if (p.x + p.width < -60) {
        this.pipes.splice(i, 1);
      }
    }

    // Update Collectibles (Coins, Diamonds, Shields, Magnets, Stars, Celestial Rings)
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const c = this.collectibles[i];
      c.x -= this.speed * dt;
      c.bobPhase += 0.08 * dt;

      // Keep item centered if parent pipe is moving
      if (c.parentPipe && c.parentPipe.isMoving) {
        c.y = c.parentPipe.topHeight + c.parentPipe.gap / 2;
      }

      let currentY = c.y + Math.sin(c.bobPhase) * 6;

      // Magnet Pull Effect (Expanded attraction radius & speed)
      if (this.magnetTimer > 0 && (c.type === 'coin' || c.type === 'diamond' || c.type === 'star' || c.type === 'ring')) {
        const dx = this.bird.x - c.x;
        const dy = this.bird.y - currentY;
        const dist = Math.hypot(dx, dy);
        if (dist < 240) {
          c.x += (dx / dist) * 9.2 * dt;
          c.y += (dy / dist) * 9.2 * dt;
          currentY = c.y;
        }
      }

      const dx = this.bird.x - c.x;
      const dy = this.bird.y - currentY;
      const dist = Math.hypot(dx, dy);

      if (!c.collected && dist < this.bird.radius + c.radius) {
        c.collected = true;

        if (c.type === 'shield') {
          this.hasShield = true;
          this.sound.playShieldCollect();
          this.spawnCoinSparkles(c.x, currentY, '#42a5f5');
        } else if (c.type === 'magnet') {
          this.magnetTimer = 500; // ~8.5 seconds
          this.sound.playMagnetCollect();
          this.spawnCoinSparkles(c.x, currentY, '#ff9800');
        } else if (c.type === 'ring') {
          // Celestial Speed Boost Ring (+5 Coins and Golden Shockwave!)
          this.coins += 5;
          this.sound.playRingPass();
          this.particles.spawn(c.x, currentY, 0, 0, 32, '#ffd700', 25, 'ring');
          this.spawnCoinSparkles(c.x, currentY, '#ffea00');
        } else if (c.type === 'diamond') {
          this.coins += 5;
          this.sound.playDiamond();
          this.spawnCoinSparkles(c.x, currentY, '#00e5ff');
        } else if (c.type === 'star') {
          this.coins += 3;
          this.sound.playCoin();
          this.spawnCoinSparkles(c.x, currentY, '#ffeb3b');
        } else {
          // Standard Coin (+1 Coin)
          this.coins++;
          this.sound.playCoin();
          this.spawnCoinSparkles(c.x, currentY, '#ffd54f');
        }

        this.checkThemeMilestones();
        this.updateHUD();
        this.collectibles.splice(i, 1);
        continue;
      }

      if (c.x < -40) {
        this.collectibles.splice(i, 1);
      }
    }

    // Ceiling & Floor collision
    if (this.bird.y - this.bird.radius <= 0) {
      this.bird.y = this.bird.radius;
      this.bird.vy = 0;
    }

    const groundTop = CONFIG.V_HEIGHT - CONFIG.GROUND_HEIGHT;
    if (this.bird.y + this.bird.radius >= groundTop) {
      this.bird.y = groundTop - this.bird.radius;
      if (!this.powerRush) {
        this.gameOver();
        return;
      }
    }

    this.particles.update(dt);
  }

  scrollScenery(amt) {
    this.groundScroll = (this.groundScroll + amt) % 36;
    this.hillFarScroll = (this.hillFarScroll + amt * 0.25) % 600;
    this.hillMidScroll = (this.hillMidScroll + amt * 0.50) % 500;
    this.hillNearScroll = (this.hillNearScroll + amt * 0.85) % 400;

    this.clouds.forEach(cloud => {
      cloud.x -= cloud.speed * (amt / 2);
      if (cloud.x < -130) {
        cloud.x = CONFIG.V_WIDTH + 70;
        cloud.y = 35 + Math.random() * 180;
      }
    });
  }

  checkPipeCollision(b, p) {
    if (this.powerRush || p.hitDeflected || this.invulnerableTimer > 0) return false;
    const capOverhang = 4;
    const pLeft = p.x - capOverhang;
    const pRight = p.x + p.width + capOverhang;

    if (b.x + b.w > pLeft && b.x < pRight) {
      if (b.y < p.topHeight) {
        return true;
      }
      if (b.y + b.h > p.bottomY) {
        return true;
      }
    }
    return false;
  }

  // ==========================================
  // RENDERING PIPELINE (Zero shadowBlur for Max Mobile FPS)
  // ==========================================
  render() {
    const ctx = this.ctx;
    ctx.save();

    if (this.shakeTime > 0) {
      const intensity = (this.shakeTime / 20) * 8;
      const sx = (Math.random() - 0.5) * intensity;
      const sy = (Math.random() - 0.5) * intensity;
      ctx.translate(sx, sy);
    }

    const currTheme = THEMES[this.activeThemeIdx];
    const prevTheme = THEMES[this.prevThemeIdx];
    const t = this.themeTransition;

    // 1. Sky Gradient
    const skyTop = lerpColor(prevTheme.skyTop, currTheme.skyTop, t);
    const skyMid = lerpColor(prevTheme.skyMid, currTheme.skyMid, t);
    const skyBot = lerpColor(prevTheme.skyBot, currTheme.skyBot, t);

    const skyGrad = ctx.createLinearGradient(0, 0, 0, CONFIG.V_HEIGHT);
    skyGrad.addColorStop(0, skyTop);
    skyGrad.addColorStop(0.55, skyMid);
    skyGrad.addColorStop(1, skyBot);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CONFIG.V_WIDTH, CONFIG.V_HEIGHT);

    // 2. Stars & Moon (Night & Aurora)
    if (currTheme.showMoon || prevTheme.showMoon) {
      const moonAlpha = currTheme.showMoon ? t : (1 - t);
      this.drawStars(ctx, moonAlpha);
      this.drawMoon(ctx, moonAlpha);
    }

    // 3. Aurora Wave Surprise (Level 4 & 5)
    if (currTheme.hasAurora || prevTheme.hasAurora) {
      this.drawAurora(ctx, currTheme.hasAurora ? t : (1 - t));
    }

    // 4. Sun (Day & Sunset)
    if (!currTheme.showMoon || !prevTheme.showMoon) {
      const sunAlpha = currTheme.showMoon ? (1 - t) : 1;
      this.drawSun(ctx, currTheme, prevTheme, t, sunAlpha);
    }

    // 5. Parallax Misty Mountains
    this.drawMountains(ctx, currTheme, prevTheme, t);

    // 6. Awesome Layered Rolling Hills (Castle Completely Removed!)
    this.drawAwesomeHills(ctx, currTheme, prevTheme, t);

    // 7. Clouds
    this.drawClouds(ctx, currTheme, prevTheme, t);

    // 8. Start Oak Tree & Perch Nest (Only when on-screen)
    if (this.tree.x > -250) {
      this.drawStartTree(ctx);
    }

    // 9. Fireflies
    if (currTheme.hasFireflies || prevTheme.hasFireflies) {
      this.drawFireflies(ctx);
    }

    // 10. Pipes
    this.drawPipes(ctx, currTheme, prevTheme, t);

    // 11. Collectibles (Coins, Diamonds, Shields, Magnets, Stars)
    this.drawCollectibles(ctx);

    // 12. Particles (Leafs, feathers, sparkles, confetti)
    this.particles.draw(ctx);

    // Hyper Power Rush Supersonic Warp Streaks
    if (this.powerRush) {
      this.drawPowerWarpLines(ctx);
    }

    // 13. Royal Bird
    this.drawRoyalBird(ctx);

    // 14. Foreground Ground
    this.drawGround(ctx, currTheme, prevTheme, t);

    ctx.restore();
  }

  // Fast sun with concentric soft gradient (Zero shadowBlur!)
  drawSun(ctx, curr, prev, t, alpha) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;

    const sunY = prev.sunY + (curr.sunY - prev.sunY) * t;
    const sunColor = lerpColor(prev.sunColor, curr.sunColor, t);
    const sunX = CONFIG.V_WIDTH * 0.72;

    const glowGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 75);
    glowGrad.addColorStop(0, curr.sunGlow);
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 75, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(sunX, sunY, 28, 0, Math.PI * 2);
    ctx.fillStyle = sunColor;
    ctx.fill();

    ctx.restore();
  }

  drawMoon(ctx, alpha) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;

    const moonX = CONFIG.V_WIDTH * 0.76;
    const moonY = 110;

    const glowGrad = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 60);
    glowGrad.addColorStop(0, 'rgba(255, 255, 230, 0.40)');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#fffde7';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(moonX + 9, moonY - 5, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#0d1b3e';
    ctx.fill();

    ctx.restore();
  }

  // Mystical Aurora Borealis Waves (Level 4 & 5 Surprise!)
  drawAurora(ctx, alpha) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha * 0.55;

    const time = this.frame * 0.02;
    const waveGrad = ctx.createLinearGradient(0, 40, 0, 240);
    waveGrad.addColorStop(0, 'rgba(0, 230, 118, 0)');
    waveGrad.addColorStop(0.4, 'rgba(0, 229, 255, 0.45)');
    waveGrad.addColorStop(0.7, 'rgba(213, 0, 249, 0.35)');
    waveGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = waveGrad;
    ctx.beginPath();
    ctx.moveTo(0, 140);
    for (let x = 0; x <= CONFIG.V_WIDTH; x += 30) {
      const y = 90 + Math.sin(x * 0.015 + time) * 35 + Math.cos(x * 0.03 - time * 0.8) * 15;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(CONFIG.V_WIDTH, 260);
    ctx.lineTo(0, 260);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawStars(ctx, alpha) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.fillStyle = '#ffffff';

    this.stars.forEach(s => {
      s.twinklePhase += s.twinkleSpeed;
      const twAlpha = (0.4 + Math.sin(s.twinklePhase) * 0.5) * alpha;
      ctx.globalAlpha = Math.max(0, twAlpha);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Shooting stars
    if (this.frame % 150 < 25) {
      const shootProg = (this.frame % 150) / 25;
      const sx = 90 + shootProg * 150;
      const sy = 40 + shootProg * 75;
      ctx.globalAlpha = (1 - shootProg) * alpha;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(sx - 35, sy - 18);
      ctx.lineTo(sx, sy);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawFireflies(ctx) {
    ctx.save();
    this.fireflies.forEach(f => {
      const glow = Math.sin(f.pulsePhase);
      if (glow > 0) {
        ctx.globalAlpha = glow * 0.85;
        // Soft halo without shadowBlur!
        ctx.fillStyle = 'rgba(255, 238, 88, 0.35)';
        ctx.beginPath();
        ctx.arc(f.x, f.y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffee58';
        ctx.beginPath();
        ctx.arc(f.x, f.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  drawMountains(ctx, curr, prev, t) {
    const mountainCol = lerpColor(prev.mountainColor, curr.mountainColor, t);
    ctx.fillStyle = mountainCol;
    const baseY = CONFIG.V_HEIGHT - CONFIG.GROUND_HEIGHT - 30;

    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(0, baseY - 60);
    ctx.lineTo(60, baseY - 120);
    ctx.lineTo(135, baseY - 70);
    ctx.lineTo(220, baseY - 135);
    ctx.lineTo(310, baseY - 85);
    ctx.lineTo(390, baseY - 145);
    ctx.lineTo(CONFIG.V_WIDTH, baseY - 95);
    ctx.lineTo(CONFIG.V_WIDTH, baseY);
    ctx.closePath();
    ctx.fill();
  }

  // ==========================================
  // AWESOME MULTI-LAYER ROLLING HILLS (Dealuri Faine)
  // ==========================================
  drawAwesomeHills(ctx, curr, prev, t) {
    const baseY = CONFIG.V_HEIGHT - CONFIG.GROUND_HEIGHT;

    const hillFarCol = lerpColor(prev.hillFar, curr.hillFar, t);
    const hillMidCol = lerpColor(prev.hillMid, curr.hillMid, t);
    const hillNearCol = lerpColor(prev.hillNear, curr.hillNear, t);

    // Layer 1: Far Rolling Pastoral Hills (with cute rotating windmill!)
    ctx.fillStyle = hillFarCol;
    ctx.beginPath();
    ctx.moveTo(-50, baseY);
    for (let x = -50; x <= CONFIG.V_WIDTH + 50; x += 35) {
      const y = baseY - 65 + Math.sin((x + this.hillFarScroll) * 0.011) * 32 + Math.cos((x + this.hillFarScroll) * 0.022) * 12;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(CONFIG.V_WIDTH + 50, baseY);
    ctx.closePath();
    ctx.fill();

    // Layer 2: Mid Rolling Green Hills (with lush trees & bushes)
    ctx.fillStyle = hillMidCol;
    ctx.beginPath();
    ctx.moveTo(-50, baseY);
    for (let x = -50; x <= CONFIG.V_WIDTH + 50; x += 30) {
      const y = baseY - 42 + Math.sin((x + this.hillMidScroll) * 0.016) * 22;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(CONFIG.V_WIDTH + 50, baseY);
    ctx.closePath();
    ctx.fill();

    // Mid Hill Clump Trees
    for (let tx = 40; tx < CONFIG.V_WIDTH + 100; tx += 170) {
      const treeWorldX = ((tx - this.hillMidScroll) % (CONFIG.V_WIDTH + 200) + CONFIG.V_WIDTH + 200) % (CONFIG.V_WIDTH + 200) - 60;
      const treeGroundY = baseY - 42 + Math.sin((treeWorldX + this.hillMidScroll) * 0.016) * 22;
      if (treeWorldX > -30 && treeWorldX < CONFIG.V_WIDTH + 30) {
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.arc(treeWorldX, treeGroundY - 14, 13, 0, Math.PI * 2);
        ctx.arc(treeWorldX + 10, treeGroundY - 10, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1b5e20';
        ctx.fillRect(treeWorldX + 2, treeGroundY - 6, 4, 8);
      }
    }

    // Layer 3: Near Grassy Hills (Lush foreground slopes)
    ctx.fillStyle = hillNearCol;
    ctx.beginPath();
    ctx.moveTo(-50, baseY);
    for (let x = -50; x <= CONFIG.V_WIDTH + 50; x += 30) {
      const y = baseY - 18 + Math.sin((x + this.hillNearScroll) * 0.024) * 15;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(CONFIG.V_WIDTH + 50, baseY);
    ctx.closePath();
    ctx.fill();
  }

  // ==========================================
  // FAIRYTALE ANCIENT ROYAL OAK TREE & NEST
  // (Completely filled dense canopy with zero empty space, organic volume,
  // lush foliage wrapping behind branch & nest, mossy roots, royal golden eggs)
  // ==========================================
  drawStartTree(ctx) {
    const tx = this.tree.x;
    const groundY = CONFIG.V_HEIGHT - CONFIG.GROUND_HEIGHT;
    const nestX = tx + 85;
    const nestY = this.tree.nestY;
    const sway = this.tree.sway || 0;

    ctx.save();

    // 1. SOLID DEEP CANOPY UNDERLAYER (100% Filled, zero empty space or sky holes!)
    // Spans completely from x: tx-50 to tx+205, y: 75 to 440, wrapping behind trunk, branch & nest!
    ctx.fillStyle = '#0a2f10';
    ctx.beginPath();
    // Far left & lower left foliage
    ctx.arc(tx - 35, 290 + sway * 0.25, 68, 0, Math.PI * 2);
    ctx.arc(tx - 25, 215 + sway * 0.35, 64, 0, Math.PI * 2);
    ctx.arc(tx - 10, 360 + sway * 0.2, 60, 0, Math.PI * 2);
    // Upper crowns
    ctx.arc(tx + 20, 150 + sway * 0.45, 76, 0, Math.PI * 2);
    ctx.arc(tx + 75, 140 + sway * 0.5, 78, 0, Math.PI * 2);
    ctx.arc(tx + 130, 160 + sway * 0.5, 72, 0, Math.PI * 2);
    ctx.arc(tx + 175, 205 + sway * 0.45, 66, 0, Math.PI * 2);
    // Mid center & behind branch/nest
    ctx.arc(tx + 35, 255 + sway * 0.4, 76, 0, Math.PI * 2);
    ctx.arc(tx + 95, 245 + sway * 0.4, 78, 0, Math.PI * 2);
    ctx.arc(tx + 150, 260 + sway * 0.4, 72, 0, Math.PI * 2);
    ctx.arc(tx + 185, 305 + sway * 0.35, 62, 0, Math.PI * 2);
    // Directly behind, above and to the right of the nest
    ctx.arc(tx + 60, 335 + sway * 0.3, 72, 0, Math.PI * 2);
    ctx.arc(tx + 115, 325 + sway * 0.3, 74, 0, Math.PI * 2);
    ctx.arc(tx + 165, 345 + sway * 0.3, 64, 0, Math.PI * 2);
    ctx.arc(tx + 195, 385 + sway * 0.25, 50, 0, Math.PI * 2);
    // Under/behind the branch connecting down to the trunk
    ctx.arc(tx + 45, 400 + sway * 0.2, 58, 0, Math.PI * 2);
    ctx.arc(tx + 95, 395 + sway * 0.2, 60, 0, Math.PI * 2);
    ctx.arc(tx + 145, 410 + sway * 0.2, 54, 0, Math.PI * 2);
    ctx.fill();

    // 2. LAYER 2: RICH EMERALD FOREST SHADOW GRADIENT
    const shadowGrad = ctx.createRadialGradient(tx + 80, 260, 30, tx + 80, 260, 190);
    shadowGrad.addColorStop(0, '#1b5e20');
    shadowGrad.addColorStop(0.6, '#134e19');
    shadowGrad.addColorStop(1, '#0c3811');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(tx - 20, 275 + sway * 0.3, 62, 0, Math.PI * 2);
    ctx.arc(tx - 10, 205 + sway * 0.4, 58, 0, Math.PI * 2);
    ctx.arc(tx + 30, 160 + sway * 0.5, 70, 0, Math.PI * 2);
    ctx.arc(tx + 85, 155 + sway * 0.5, 72, 0, Math.PI * 2);
    ctx.arc(tx + 140, 180 + sway * 0.45, 66, 0, Math.PI * 2);
    ctx.arc(tx + 175, 230 + sway * 0.4, 60, 0, Math.PI * 2);
    ctx.arc(tx + 45, 245 + sway * 0.4, 70, 0, Math.PI * 2);
    ctx.arc(tx + 105, 240 + sway * 0.4, 72, 0, Math.PI * 2);
    ctx.arc(tx + 160, 265 + sway * 0.35, 65, 0, Math.PI * 2);
    ctx.arc(tx + 75, 325 + sway * 0.3, 66, 0, Math.PI * 2);
    ctx.arc(tx + 125, 320 + sway * 0.3, 68, 0, Math.PI * 2);
    ctx.arc(tx + 170, 350 + sway * 0.25, 58, 0, Math.PI * 2);
    ctx.arc(tx + 90, 385 + sway * 0.2, 54, 0, Math.PI * 2);
    ctx.arc(tx + 135, 395 + sway * 0.2, 50, 0, Math.PI * 2);
    ctx.fill();

    // 3. MAJESTIC ANCIENT OAK TRUNK WITH BARK & TEXTURE
    const trunkGrad = ctx.createLinearGradient(tx - 20, 0, tx + 75, 0);
    trunkGrad.addColorStop(0, '#3e2723');
    trunkGrad.addColorStop(0.35, '#5d4037');
    trunkGrad.addColorStop(0.75, '#6d4c41');
    trunkGrad.addColorStop(1, '#4e342e');
    ctx.fillStyle = trunkGrad;

    ctx.beginPath();
    ctx.moveTo(tx - 24, groundY);
    ctx.quadraticCurveTo(tx - 2, groundY - 110, tx + 14, 395);
    ctx.lineTo(tx + 56, 395);
    ctx.quadraticCurveTo(tx + 48, groundY - 95, tx + 80, groundY);
    ctx.closePath();
    ctx.fill();

    // Bark Crevices & Organic Wood Grain Textures
    ctx.strokeStyle = '#271202';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(tx - 4, groundY - 8);
    ctx.quadraticCurveTo(tx + 5, groundY - 90, tx + 22, 402);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(tx + 22, groundY - 14);
    ctx.quadraticCurveTo(tx + 26, groundY - 75, tx + 37, 405);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(tx + 48, groundY - 8);
    ctx.quadraticCurveTo(tx + 42, groundY - 80, tx + 46, 410);
    ctx.stroke();

    // Warm Sunlit Rim Highlight on Trunk Left
    ctx.strokeStyle = 'rgba(255, 235, 180, 0.32)';
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.moveTo(tx - 19, groundY - 10);
    ctx.quadraticCurveTo(tx - 1, groundY - 105, tx + 15, 402);
    ctx.stroke();

    // Ancient Roots Spreading into Ground
    ctx.fillStyle = '#4e342e';
    // Left massive root
    ctx.beginPath();
    ctx.moveTo(tx - 38, groundY);
    ctx.quadraticCurveTo(tx - 16, groundY - 24, tx - 2, groundY - 10);
    ctx.lineTo(tx + 8, groundY);
    ctx.closePath();
    ctx.fill();

    // Right massive root
    ctx.beginPath();
    ctx.moveTo(tx + 50, groundY);
    ctx.quadraticCurveTo(tx + 70, groundY - 22, tx + 95, groundY);
    ctx.lineTo(tx + 64, groundY);
    ctx.closePath();
    ctx.fill();

    // Center root knot
    ctx.beginPath();
    ctx.ellipse(tx + 20, groundY - 4, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Moss on Roots
    ctx.fillStyle = '#689f38';
    ctx.beginPath();
    ctx.ellipse(tx - 22, groundY - 4, 15, 5.5, -0.15, 0, Math.PI * 2);
    ctx.ellipse(tx + 68, groundY - 4, 16, 5.5, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Cute Fairytale Red Mushrooms Beside Root
    ctx.fillStyle = '#fff9c4';
    ctx.fillRect(tx - 32, groundY - 15, 3.5, 15);
    ctx.fillStyle = '#e53935';
    ctx.beginPath();
    ctx.arc(tx - 30, groundY - 15, 7.5, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(tx - 32, groundY - 18, 1.4, 0, Math.PI * 2);
    ctx.arc(tx - 28, groundY - 19, 1.5, 0, Math.PI * 2);
    ctx.arc(tx - 30, groundY - 15, 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Mushroom 2 (Small baby mushroom)
    ctx.fillStyle = '#fff9c4';
    ctx.fillRect(tx - 42, groundY - 10, 2.5, 10);
    ctx.fillStyle = '#d32f2f';
    ctx.beginPath();
    ctx.arc(tx - 41, groundY - 10, 4.8, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(tx - 41, groundY - 12, 1.1, 0, Math.PI * 2);
    ctx.fill();

    // 4. STURDY GNARLED LATERAL NEST BRANCH
    const branchGrad = ctx.createLinearGradient(tx + 20, 415, nestX + 35, nestY);
    branchGrad.addColorStop(0, '#5d4037');
    branchGrad.addColorStop(0.55, '#6d4c41');
    branchGrad.addColorStop(1, '#795548');
    ctx.fillStyle = branchGrad;

    ctx.beginPath();
    ctx.moveTo(tx + 24, 402);
    ctx.quadraticCurveTo(tx + 55, 405, nestX - 6, nestY + 14);
    ctx.lineTo(nestX + 42, nestY + 12);
    ctx.quadraticCurveTo(nestX + 22, nestY + 26, tx + 62, 422);
    ctx.quadraticCurveTo(tx + 40, 428, tx + 26, 424);
    ctx.closePath();
    ctx.fill();

    // Secondary upper branch reaching upward into canopy
    ctx.beginPath();
    ctx.moveTo(tx + 28, 396);
    ctx.quadraticCurveTo(tx + 42, 345, tx + 62, 305);
    ctx.quadraticCurveTo(tx + 66, 312, tx + 46, 365);
    ctx.quadraticCurveTo(tx + 36, 398, tx + 34, 402);
    ctx.closePath();
    ctx.fill();

    // Small twig sprouting from branch with fresh leaflets
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(nestX + 36, nestY + 13);
    ctx.quadraticCurveTo(nestX + 50, nestY + 5, nestX + 60, nestY + 3);
    ctx.stroke();

    ctx.fillStyle = '#7cb342';
    ctx.beginPath();
    ctx.ellipse(nestX + 58, nestY + 2, 6.5, 3.2, -0.4, 0, Math.PI * 2);
    ctx.ellipse(nestX + 48, nestY + 5, 5.5, 2.8, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 5. MID-TONE VOLUMETRIC CANOPY CLUSTERS (Rich emerald oak foliage)
    const midCanopyGrad = ctx.createRadialGradient(tx + 75, 250, 20, tx + 75, 250, 160);
    midCanopyGrad.addColorStop(0, '#43a047');
    midCanopyGrad.addColorStop(0.5, '#2e7d32');
    midCanopyGrad.addColorStop(1, '#1b5e20');
    ctx.fillStyle = midCanopyGrad;

    ctx.beginPath();
    // Left cluster
    ctx.arc(tx - 10, 280 + sway * 0.3, 52, 0, Math.PI * 2);
    ctx.arc(tx + 5, 215 + sway * 0.4, 56, 0, Math.PI * 2);
    // Top crowns
    ctx.arc(tx + 45, 165 + sway * 0.5, 62, 0, Math.PI * 2);
    ctx.arc(tx + 95, 155 + sway * 0.5, 64, 0, Math.PI * 2);
    ctx.arc(tx + 145, 180 + sway * 0.45, 58, 0, Math.PI * 2);
    // Center & behind nest
    ctx.arc(tx + 55, 240 + sway * 0.4, 62, 0, Math.PI * 2);
    ctx.arc(tx + 110, 235 + sway * 0.4, 64, 0, Math.PI * 2);
    ctx.arc(tx + 160, 255 + sway * 0.35, 56, 0, Math.PI * 2);
    // Right and wrapping above the nest
    ctx.arc(tx + 80, 315 + sway * 0.3, 58, 0, Math.PI * 2);
    ctx.arc(tx + 130, 310 + sway * 0.3, 60, 0, Math.PI * 2);
    ctx.arc(tx + 168, 335 + sway * 0.25, 52, 0, Math.PI * 2);
    // Behind branch
    ctx.arc(tx + 70, 380 + sway * 0.2, 48, 0, Math.PI * 2);
    ctx.arc(tx + 120, 380 + sway * 0.2, 48, 0, Math.PI * 2);
    ctx.fill();

    // 6. SUNLIT VIBRANT CANOPY PUFFS & HIGHLIGHTS
    const sunGrad = ctx.createRadialGradient(tx + 70, 200, 15, tx + 70, 200, 120);
    sunGrad.addColorStop(0, '#81c784');
    sunGrad.addColorStop(0.55, '#4caf50');
    sunGrad.addColorStop(1, '#388e3c');
    ctx.fillStyle = sunGrad;

    ctx.beginPath();
    ctx.arc(tx + 18, 290 + sway * 0.3, 40, 0, Math.PI * 2);
    ctx.arc(tx + 28, 225 + sway * 0.4, 46, 0, Math.PI * 2);
    ctx.arc(tx + 65, 175 + sway * 0.5, 50, 0, Math.PI * 2);
    ctx.arc(tx + 112, 170 + sway * 0.5, 52, 0, Math.PI * 2);
    ctx.arc(tx + 155, 195 + sway * 0.45, 44, 0, Math.PI * 2);
    ctx.arc(tx + 75, 238 + sway * 0.4, 48, 0, Math.PI * 2);
    ctx.arc(tx + 125, 230 + sway * 0.4, 50, 0, Math.PI * 2);
    ctx.arc(tx + 165, 260 + sway * 0.35, 42, 0, Math.PI * 2);
    ctx.arc(tx + 95, 305 + sway * 0.3, 48, 0, Math.PI * 2);
    ctx.arc(tx + 142, 305 + sway * 0.3, 46, 0, Math.PI * 2);
    ctx.fill();

    // Sunny Leaf Crest Highlights
    ctx.fillStyle = '#a5d6a7';
    ctx.beginPath();
    ctx.arc(tx + 24, 218 + sway * 0.4, 20, 0, Math.PI * 2);
    ctx.arc(tx + 60, 165 + sway * 0.5, 24, 0, Math.PI * 2);
    ctx.arc(tx + 110, 160 + sway * 0.5, 26, 0, Math.PI * 2);
    ctx.arc(tx + 150, 185 + sway * 0.45, 20, 0, Math.PI * 2);
    ctx.arc(tx + 72, 226 + sway * 0.4, 22, 0, Math.PI * 2);
    ctx.arc(tx + 122, 220 + sway * 0.4, 24, 0, Math.PI * 2);
    ctx.arc(tx + 138, 292 + sway * 0.3, 20, 0, Math.PI * 2);
    ctx.fill();

    // Golden Sunlight Dapples
    ctx.fillStyle = 'rgba(255, 245, 180, 0.42)';
    ctx.beginPath();
    ctx.arc(tx + 58, 158 + sway * 0.5, 12, 0, Math.PI * 2);
    ctx.arc(tx + 106, 152 + sway * 0.5, 14, 0, Math.PI * 2);
    ctx.arc(tx + 118, 212 + sway * 0.4, 11, 0, Math.PI * 2);
    ctx.arc(tx + 135, 285 + sway * 0.3, 10, 0, Math.PI * 2);
    ctx.fill();

    // Hanging Ivy Leaves Trailing Down (Swaying gracefully)
    ctx.fillStyle = '#388e3c';
    for (let ivy = 0; ivy < 4; ivy++) {
      const ivyX = tx + 35 + ivy * 34;
      const ivyY = 340 + Math.sin(sway * 0.2 + ivy) * 4;
      ctx.beginPath();
      ctx.ellipse(ivyX, ivyY, 5.5, 10, 0.25 * Math.sin(sway * 0.5 + ivy), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#66bb6a';
      ctx.beginPath();
      ctx.ellipse(ivyX + 2, ivyY + 11, 4.5, 8, -0.2 * Math.sin(sway * 0.5 + ivy), 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. MAGNIFICENT GOLDEN ROYAL NEST (Perch for the Bird)
    // Deep Nest Shadow Base
    ctx.fillStyle = 'rgba(20, 10, 2, 0.45)';
    ctx.beginPath();
    ctx.ellipse(nestX, nestY + 12, 34, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Woven Twig Base (Brown & Golden Wood Bowl)
    const nestGrad = ctx.createLinearGradient(nestX - 34, nestY, nestX + 34, nestY + 16);
    nestGrad.addColorStop(0, '#5d4037');
    nestGrad.addColorStop(0.5, '#795548');
    nestGrad.addColorStop(1, '#8d6e63');
    ctx.fillStyle = nestGrad;
    ctx.beginPath();
    ctx.ellipse(nestX, nestY + 6, 34, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rich Criss-Cross Woven Twigs
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 2.2;
    for (let o = -26; o <= 26; o += 6) {
      ctx.beginPath();
      ctx.arc(nestX + o, nestY + 7, 14, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }

    // Golden Straw Weaves in Rim
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 1.6;
    for (let o = -22; o <= 22; o += 8) {
      ctx.beginPath();
      ctx.arc(nestX + o, nestY + 5, 12, 0.4, Math.PI - 0.4);
      ctx.stroke();
    }

    // Downy Feather Bedding Inside Bowl
    ctx.fillStyle = '#fffde7';
    ctx.beginPath();
    ctx.ellipse(nestX, nestY + 1, 26, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Soft Green Moss Accents on Nest Rim
    ctx.fillStyle = '#689f38';
    ctx.beginPath();
    ctx.arc(nestX - 24, nestY + 2, 4.8, 0, Math.PI * 2);
    ctx.arc(nestX + 24, nestY + 3, 5.2, 0, Math.PI * 2);
    ctx.arc(nestX - 9, nestY + 11, 4.0, 0, Math.PI * 2);
    ctx.arc(nestX + 13, nestY + 10, 4.2, 0, Math.PI * 2);
    ctx.fill();

    // 2 Adorable Shiny Golden Royal Eggs Inside Nest!
    // Egg 1 (Left egg)
    const egg1Grad = ctx.createRadialGradient(nestX - 10, nestY - 2, 1, nestX - 9, nestY, 7);
    egg1Grad.addColorStop(0, '#fffde7');
    egg1Grad.addColorStop(0.35, '#ffecb3');
    egg1Grad.addColorStop(0.8, '#ffca28');
    egg1Grad.addColorStop(1, '#ff8f00');
    ctx.fillStyle = egg1Grad;
    ctx.beginPath();
    ctx.ellipse(nestX - 9, nestY - 1, 6.2, 8.5, -0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c67100';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // Specular highlight on egg 1
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(nestX - 11, nestY - 4, 2, 3.2, -0.22, 0, Math.PI * 2);
    ctx.fill();

    // Egg 2 (Right egg)
    const egg2Grad = ctx.createRadialGradient(nestX + 10, nestY - 1, 1, nestX + 9, nestY + 1, 7);
    egg2Grad.addColorStop(0, '#fffde7');
    egg2Grad.addColorStop(0.35, '#ffecb3');
    egg2Grad.addColorStop(0.8, '#ffca28');
    egg2Grad.addColorStop(1, '#ff8f00');
    ctx.fillStyle = egg2Grad;
    ctx.beginPath();
    ctx.ellipse(nestX + 9, nestY, 5.8, 8, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c67100';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // Specular highlight on egg 2
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(nestX + 7.5, nestY - 3, 1.8, 3, 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawClouds(ctx, curr, prev, t) {
    const cloudCol = lerpColor(prev.cloudColor, curr.cloudColor, t);
    const shadeCol = lerpColor(prev.cloudShade, curr.cloudShade, t);

    this.clouds.forEach(c => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.scale, c.scale);

      ctx.fillStyle = cloudCol;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.arc(22, -10, 28, 0, Math.PI * 2);
      ctx.arc(52, -4, 22, 0, Math.PI * 2);
      ctx.arc(70, 6, 18, 0, Math.PI * 2);
      ctx.arc(36, 12, 22, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = shadeCol;
      ctx.beginPath();
      ctx.arc(36, 12, 18, 0, Math.PI);
      ctx.arc(22, 6, 20, 0, Math.PI);
      ctx.fill();

      ctx.restore();
    });
  }

  // Draw Pipes
  drawPipes(ctx, curr, prev, t) {
    const pipeOutline = lerpColor(prev.pipeOutline, curr.pipeOutline, t);
    const pipeBase = lerpColor(prev.pipeBase, curr.pipeBase, t);
    const pipeHighlight = lerpColor(prev.pipeHighlight, curr.pipeHighlight, t);
    const pipeShadow = lerpColor(prev.pipeShadow, curr.pipeShadow, t);
    const capHeight = 30;
    const capOverhang = 6;
    const groundTop = CONFIG.V_HEIGHT - CONFIG.GROUND_HEIGHT;

    this.pipes.forEach(p => {
      // Top Pipe
      const topShaftH = Math.max(0, p.topHeight - capHeight);
      this.drawPipeShaft(ctx, p.x, 0, p.width, topShaftH, pipeBase, pipeHighlight, pipeShadow, pipeOutline);
      this.drawPipeCap(ctx, p.x - capOverhang, p.topHeight - capHeight, p.width + capOverhang * 2, capHeight, pipeBase, pipeHighlight, pipeShadow, pipeOutline, true);

      // Bottom Pipe
      this.drawPipeCap(ctx, p.x - capOverhang, p.bottomY, p.width + capOverhang * 2, capHeight, pipeBase, pipeHighlight, pipeShadow, pipeOutline, false);
      const bottomShaftH = Math.max(0, groundTop - (p.bottomY + capHeight));
      this.drawPipeShaft(ctx, p.x, p.bottomY + capHeight, p.width, bottomShaftH, pipeBase, pipeHighlight, pipeShadow, pipeOutline);
    });
  }

  drawPipeShaft(ctx, x, y, w, h, base, highlight, shadow, outline) {
    if (h <= 0) return;
    ctx.save();
    ctx.fillStyle = base;
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = highlight;
    ctx.fillRect(x + 6, y, 14, h);
    ctx.fillStyle = shadow;
    ctx.fillRect(x + w - 16, y, 16, h);

    ctx.lineWidth = 3.2;
    ctx.strokeStyle = outline;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + h);
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.stroke();
    ctx.restore();
  }

  drawPipeCap(ctx, x, y, w, h, base, highlight, shadow, outline, isTop) {
    ctx.save();
    const r = 5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, [r, r, r, r]);
    ctx.fillStyle = base;
    ctx.fill();

    ctx.save();
    ctx.clip();
    ctx.fillStyle = highlight;
    ctx.fillRect(x + 8, y, 16, h);
    ctx.fillStyle = shadow;
    ctx.fillRect(x + w - 18, y, 18, h);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(x + 4, isTop ? y + h - 5 : y + 2, w - 8, 3.5);

    ctx.fillStyle = '#ffca28';
    [-6, 6].forEach(offset => {
      ctx.beginPath();
      ctx.arc(x + w / 2 + offset * 2.5, y + h / 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();

    ctx.lineWidth = 3.2;
    ctx.strokeStyle = outline;
    ctx.stroke();
    ctx.restore();
  }

  // Draw Collectibles: Coins, Diamonds, Shields, Magnets, Stars
  drawCollectibles(ctx) {
    this.collectibles.forEach(c => {
      if (c.collected) return;
      const cy = c.y + Math.sin(c.bobPhase) * 6;

      ctx.save();
      ctx.translate(c.x, cy);

      if (c.type === 'shield') {
        // Shield Power-up
        ctx.fillStyle = 'rgba(33, 150, 243, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, c.radius + 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1e88e5';
        ctx.beginPath();
        ctx.arc(0, 0, c.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#90caf9';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🛡️', 0, 1);
      } else if (c.type === 'magnet') {
        // Magnet Power-up
        ctx.fillStyle = 'rgba(255, 112, 67, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, c.radius + 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#e64a19';
        ctx.beginPath();
        ctx.arc(0, 0, c.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffccbc';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧲', 0, 1);
      } else if (c.type === 'ring') {
        // Celestial Speed Boost Ring (Golden Torus Portal)
        c.rot = (c.rot || 0) + 0.04;

        // Outer radiant glow
        ctx.fillStyle = 'rgba(255, 215, 0, 0.28)';
        ctx.beginPath();
        ctx.arc(0, 0, c.radius + 6, 0, Math.PI * 2);
        ctx.fill();

        // Thick Golden Ring
        ctx.lineWidth = 4.5;
        const ringGrad = ctx.createLinearGradient(-c.radius, -c.radius, c.radius, c.radius);
        ringGrad.addColorStop(0, '#ffffff');
        ringGrad.addColorStop(0.3, '#fff9c4');
        ringGrad.addColorStop(0.65, '#ffca28');
        ringGrad.addColorStop(1, '#ff8f00');
        ctx.strokeStyle = ringGrad;
        ctx.beginPath();
        ctx.arc(0, 0, c.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner rim
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(0, 0, c.radius - 3, 0, Math.PI * 2);
        ctx.stroke();

        // 4 Rotating Golden Star Studs
        ctx.save();
        ctx.rotate(c.rot);
        ctx.fillStyle = '#fffde7';
        for (let s = 0; s < 4; s++) {
          ctx.rotate(Math.PI / 2);
          ctx.beginPath();
          ctx.arc(c.radius, 0, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Center sparkle
        ctx.fillStyle = '#ffffff';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✨', 0, 1);
      } else if (c.type === 'diamond') {
        // 5x Diamond Gem
        ctx.fillStyle = 'rgba(0, 229, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, c.radius + 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#00b0ff';
        ctx.beginPath();
        ctx.moveTo(0, -c.radius);
        ctx.lineTo(c.radius, 0);
        ctx.lineTo(0, c.radius);
        ctx.lineTo(-c.radius, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-2, -2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.type === 'star') {
        // 3x Star Coin
        ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, c.radius + 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffd600';
        ctx.beginPath();
        ctx.arc(0, 0, c.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff59d';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#e65100';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐', 0, 1);
      } else {
        // Classic Royal Coin
        ctx.beginPath();
        ctx.arc(0, 0, c.radius, 0, Math.PI * 2);
        const coinGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, c.radius);
        coinGrad.addColorStop(0, '#fff9c4');
        coinGrad.addColorStop(0.45, '#ffca28');
        coinGrad.addColorStop(1, '#e65100');
        ctx.fillStyle = coinGrad;
        ctx.fill();

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#b26a00';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, c.radius - 3.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#b26a00';
        ctx.beginPath();
        ctx.moveTo(-6, 4);
        ctx.lineTo(6, 4);
        ctx.lineTo(7, -3);
        ctx.lineTo(3, 0);
        ctx.lineTo(0, -5);
        ctx.lineTo(-3, 0);
        ctx.lineTo(-7, -3);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-5, -5, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  // ==========================================
  // HYPER POWER RUSH SUPERSONIC WARP STREAKS
  // ==========================================
  drawPowerWarpLines(ctx) {
    ctx.save();
    const time = this.frame * 0.45;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    const maxH = CONFIG.V_HEIGHT - CONFIG.GROUND_HEIGHT - 60;
    for (let i = 0; i < 16; i++) {
      const y = ((i * 49 + Math.sin(time * 0.3 + i) * 18) % maxH) + 35;
      const speed = 19 + (i % 5) * 6;
      const x = CONFIG.V_WIDTH - ((this.frame * speed + i * 90) % (CONFIG.V_WIDTH + 260)) + 60;
      const len = 75 + (i % 4) * 35;

      const grad = ctx.createLinearGradient(x, y, x + len, y);
      const isGold = i % 2 === 0;
      if (isGold) {
        grad.addColorStop(0, 'rgba(255, 215, 0, 0)');
        grad.addColorStop(0.7, 'rgba(255, 235, 59, 0.85)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
      } else {
        grad.addColorStop(0, 'rgba(0, 229, 255, 0)');
        grad.addColorStop(0.7, 'rgba(64, 196, 255, 0.85)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
      }
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len, y);
      ctx.stroke();
    }

    // Screen edge sonic speed aura
    const edgeGrad = ctx.createRadialGradient(
      CONFIG.V_WIDTH / 2, CONFIG.V_HEIGHT / 2, CONFIG.V_WIDTH * 0.35,
      CONFIG.V_WIDTH / 2, CONFIG.V_HEIGHT / 2, CONFIG.V_WIDTH * 0.85
    );
    edgeGrad.addColorStop(0, 'rgba(255, 215, 0, 0)');
    edgeGrad.addColorStop(0.85, 'rgba(255, 215, 0, 0.08)');
    edgeGrad.addColorStop(1, 'rgba(0, 229, 255, 0.22)');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, CONFIG.V_WIDTH, CONFIG.V_HEIGHT);

    ctx.restore();
  }

  // ==========================================
  // FAIRYTALE ROYAL BIRD - AAA ARCADE / PIXAR QUALITY
  // (Chubby aerodynamic body, expressive anime eyes with triple sparkle glints,
  // head tuft, fluffy scalloped downy chest, tucked golden feet, articulated
  // layered wing, 3D crown with royal velvet & glowing rubies, Power Rush aura)
  // ==========================================
  drawRoyalBird(ctx) {
    const b = this.bird;
    const isRedKing = (b.skin === 'red');

    // Blink when invulnerable after shield break
    if (this.invulnerableTimer > 0 && Math.floor(this.frame / 4) % 2 === 0) {
      return;
    }

    // POWER RUSH SPEED GHOST SILHOUETTES (Hypersonic motion blur)
    if (this.powerRush && this.state === 'PLAYING') {
      [-32, -18].forEach((gx, idx) => {
        ctx.save();
        ctx.translate(b.x + gx, b.y);
        ctx.rotate(b.angle);
        ctx.globalAlpha = 0.22 + idx * 0.18;
        ctx.fillStyle = idx === 0 
          ? (isRedKing ? '#ff1744' : '#00e5ff') 
          : '#ffd700';
        ctx.beginPath();
        ctx.ellipse(0, 0, 26, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle);

    // 1. SUPERCHARGED POWER RUSH SONIC AURA
    if (this.powerRush) {
      ctx.save();
      const sonicPulse = 1 + Math.sin(this.frame * 0.25) * 0.12;
      ctx.scale(sonicPulse, sonicPulse);

      const auraGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, 42);
      if (isRedKing) {
        auraGrad.addColorStop(0, 'rgba(255, 23, 68, 0.35)');
        auraGrad.addColorStop(0.5, 'rgba(255, 215, 0, 0.45)');
        auraGrad.addColorStop(0.85, 'rgba(255, 255, 255, 0.65)');
        auraGrad.addColorStop(1, 'rgba(255, 23, 68, 0)');
      } else {
        auraGrad.addColorStop(0, 'rgba(255, 215, 0, 0.25)');
        auraGrad.addColorStop(0.5, 'rgba(0, 229, 255, 0.35)');
        auraGrad.addColorStop(0.85, 'rgba(255, 255, 255, 0.65)');
        auraGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
      }

      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 42, 0, Math.PI * 2);
      ctx.fill();

      // Electric spark arcs
      ctx.strokeStyle = isRedKing ? '#ffeb3b' : '#fff9c4';
      ctx.lineWidth = 2.0;
      for (let s = 0; s < 3; s++) {
        const sparkAng = (this.frame * 0.2 + s * 2.1) % (Math.PI * 2);
        const sr = 34 + Math.sin(this.frame * 0.3 + s) * 4;
        ctx.beginPath();
        ctx.arc(0, 0, sr, sparkAng, sparkAng + 0.45);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. ACTIVE SHIELD ENERGY SPHERE AURA
    if (this.hasShield) {
      ctx.save();
      const pulse = 1 + Math.sin(this.frame * 0.12) * 0.08;
      ctx.scale(pulse, pulse);

      const shieldGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, 36);
      if (isRedKing) {
        shieldGrad.addColorStop(0, 'rgba(255, 152, 0, 0.18)');
        shieldGrad.addColorStop(0.8, 'rgba(255, 87, 34, 0.45)');
        shieldGrad.addColorStop(1, 'rgba(255, 224, 178, 0.75)');
      } else {
        shieldGrad.addColorStop(0, 'rgba(33, 150, 243, 0.15)');
        shieldGrad.addColorStop(0.8, 'rgba(66, 165, 245, 0.45)');
        shieldGrad.addColorStop(1, 'rgba(187, 222, 251, 0.75)');
      }

      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 35, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isRedKing ? '#ffe0b2' : '#e3f2fd';
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.restore();
    }

    // 3. AERODYNAMIC SPEED STREAKS
    if (this.state === 'PLAYING') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      [-12, 1, 15].forEach((offsetY, idx) => {
        ctx.beginPath();
        const wave = Math.sin(this.frame * 0.28 + idx) * 4.5;
        ctx.moveTo(-36, offsetY + wave);
        ctx.quadraticCurveTo(-48, offsetY + wave - 3, -64, offsetY + wave + 2);
        ctx.stroke();
      });
    }

    // 4. ELEGANT TAIL PLUMAGE (3 Dynamic Layered Fan Feathers at Rear)
    const tailFeathers = isRedKing ? [
      { angle: -0.32, length: 15, width: 6.4, x: -22, y: -2, col: '#d50000', tipCol: '#ffe082' },
      { angle: -0.05, length: 17, width: 7.0, x: -23, y: 5, col: '#ff1744', tipCol: '#ffd54f' },
      { angle: 0.22, length: 14, width: 6.0, x: -21, y: 12, col: '#b71c1c', tipCol: '#ffca28' }
    ] : [
      { angle: -0.32, length: 14, width: 6.2, x: -22, y: -2, col: '#1565c0', tipCol: '#64b5f6' },
      { angle: -0.05, length: 16, width: 6.8, x: -23, y: 5, col: '#1976d2', tipCol: '#64b5f6' },
      { angle: 0.22, length: 13, width: 5.8, x: -21, y: 12, col: '#0d47a1', tipCol: '#bbdefb' }
    ];

    tailFeathers.forEach((tf) => {
      ctx.save();
      ctx.translate(tf.x, tf.y);
      ctx.rotate(tf.angle);

      ctx.beginPath();
      ctx.ellipse(-tf.length / 2, 0, tf.length / 2, tf.width / 2, 0, 0, Math.PI * 2);
      const tfGrad = ctx.createLinearGradient(-tf.length, 0, 0, 0);
      tfGrad.addColorStop(0, isRedKing ? '#3b0505' : '#0a2a5e');
      tfGrad.addColorStop(0.4, tf.col);
      tfGrad.addColorStop(0.85, tf.tipCol);
      tfGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = tfGrad;
      ctx.fill();
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = isRedKing ? '#2b0202' : '#061a38';
      ctx.stroke();

      // Delicate feather spine highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-tf.length * 0.75, 0);
      ctx.stroke();

      ctx.restore();
    });

    // 5. REGAL HEAD CREST TUFT (Flowing back from behind crown)
    ctx.save();
    ctx.fillStyle = isRedKing ? '#d50000' : '#1976d2';
    ctx.strokeStyle = isRedKing ? '#2b0202' : '#061a38';
    ctx.lineWidth = 2.2;
    // Primary tuft feather
    ctx.beginPath();
    ctx.moveTo(-6, -16);
    ctx.quadraticCurveTo(-15, -24, -21, -21);
    ctx.quadraticCurveTo(-16, -15, -8, -14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Inner feather highlight
    ctx.fillStyle = isRedKing ? '#ffc107' : '#64b5f6';
    ctx.beginPath();
    ctx.moveTo(-8, -16);
    ctx.quadraticCurveTo(-14, -22, -18, -20);
    ctx.quadraticCurveTo(-15, -16, -10, -15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 6. TUCKED LITTLE GOLDEN BIRD FEET (Peeking naturally under belly)
    ctx.fillStyle = '#ffa726';
    ctx.strokeStyle = '#6d2608';
    ctx.lineWidth = 1.8;
    // Back foot
    ctx.beginPath();
    ctx.ellipse(0, 18.5, 4.0, 2.5, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Front foot (slightly forward and lower)
    ctx.beginPath();
    ctx.ellipse(7.5, 18.0, 4.2, 2.5, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 7. SCULPTED VOLUMETRIC ROYAL BIRD BODY
    // Organic, aerodynamic, chubby bird silhouette
    ctx.beginPath();
    ctx.moveTo(0, -17);
    ctx.bezierCurveTo(14, -17, 19, -8, 19, 0);      // Forehead & upper face
    ctx.bezierCurveTo(19, 6, 21, 12, 16, 18);       // Front chest
    ctx.bezierCurveTo(11, 23, -2, 23, -12, 19);     // Plump lower belly
    ctx.bezierCurveTo(-22, 15, -24, 4, -22, -2);    // Rear lower back
    ctx.bezierCurveTo(-20, -10, -14, -17, 0, -17);  // Upper back & crown dome
    ctx.closePath();

    const bodyGrad = ctx.createRadialGradient(-3, -7, 4, 1, 3, 26);
    if (isRedKing) {
      bodyGrad.addColorStop(0, '#ff8a80');    // Radiant ruby highlights
      bodyGrad.addColorStop(0.3, '#ff1744');  // Vibrant royal scarlet
      bodyGrad.addColorStop(0.68, '#d50000'); // Deep imperial crimson
      bodyGrad.addColorStop(1, '#420303');    // Deep velvet burgundy shadow
    } else {
      bodyGrad.addColorStop(0, '#90caf9');
      bodyGrad.addColorStop(0.3, '#2196f3');
      bodyGrad.addColorStop(0.68, '#1565c0');
      bodyGrad.addColorStop(1, '#092d62');
    }
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.lineWidth = 2.8;
    ctx.strokeStyle = isRedKing ? '#2b0202' : '#061a38';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Soft specular rim gloss on forehead & shoulder
    ctx.fillStyle = isRedKing ? 'rgba(255, 235, 238, 0.42)' : 'rgba(255, 255, 255, 0.38)';
    ctx.beginPath();
    ctx.ellipse(-2, -12, 10, 4.2, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // 8. FLUFFY PORCELAIN-WHITE / GOLDEN ERMINE BREAST & DOWNY BELLY
    // Beautifully hugs the front curve of the chest and abdomen
    ctx.beginPath();
    ctx.moveTo(12, 2);
    ctx.bezierCurveTo(18, 5, 19, 13, 14, 18);
    ctx.bezierCurveTo(9, 21, 0, 21, -6, 17);
    ctx.bezierCurveTo(-8, 11, -3, 6, 5, 3);
    ctx.closePath();

    const bellyGrad = ctx.createLinearGradient(4, 1, 8, 20);
    if (isRedKing) {
      // Royal Imperial Ermine Golden Cream
      bellyGrad.addColorStop(0, '#ffffff');
      bellyGrad.addColorStop(0.55, '#fff8e1');
      bellyGrad.addColorStop(1, '#ffe082');
    } else {
      // Porcelain White & soft sky cream
      bellyGrad.addColorStop(0, '#ffffff');
      bellyGrad.addColorStop(0.6, '#f3f8fd');
      bellyGrad.addColorStop(1, '#d0e5f7');
    }
    ctx.fillStyle = bellyGrad;
    ctx.fill();

    // Fluffy down feather scallop accents
    ctx.strokeStyle = isRedKing ? 'rgba(255, 193, 7, 0.75)' : 'rgba(144, 202, 249, 0.7)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(6, 12, 4.5, 0.15, Math.PI * 0.82);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(11, 10.5, 3.8, 0.15, Math.PI * 0.82);
    ctx.stroke();

    // 9. DYNAMIC ARTICULATED FLAPPING WING
    ctx.save();
    // Shoulder pivot point
    ctx.translate(-5, 1);
    const wingAngle = Math.sin(b.wingTimer * 10) * 0.48 + (b.vy < 0 ? -0.16 : 0.08);
    ctx.rotate(wingAngle);

    // Primary flight feather under-layer (rear tip)
    ctx.fillStyle = isRedKing ? '#4a0303' : '#0d47a1';
    ctx.strokeStyle = isRedKing ? '#2b0202' : '#061a38';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.ellipse(-12, 4, 7.5, 3.8, -0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Main wing body
    ctx.beginPath();
    ctx.moveTo(8, -1);
    ctx.bezierCurveTo(9, 4, 3, 9, -5, 8);
    ctx.bezierCurveTo(-14, 7, -17, 1, -15, -3);
    ctx.bezierCurveTo(-10, -7, 5, -6, 8, -1);
    ctx.closePath();

    const wingGrad = ctx.createLinearGradient(-14, -5, 8, 5);
    if (isRedKing) {
      wingGrad.addColorStop(0, '#ff8a80');
      wingGrad.addColorStop(0.4, '#ff1744');
      wingGrad.addColorStop(1, '#b71c1c');
    } else {
      wingGrad.addColorStop(0, '#90caf9');
      wingGrad.addColorStop(0.4, '#2196f3');
      wingGrad.addColorStop(1, '#1565c0');
    }
    ctx.fillStyle = wingGrad;
    ctx.fill();
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = isRedKing ? '#2b0202' : '#061a38';
    ctx.stroke();

    // Feather division ribs
    ctx.strokeStyle = isRedKing ? '#7f0000' : '#0d47a1';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(-4, 0, 5.5, 0.2, Math.PI * 0.95);
    ctx.stroke();

    // Silky sheen highlight on top of wing
    ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
    ctx.beginPath();
    ctx.ellipse(-3, -3.2, 7.5, 2.2, -0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 10. SCULPTED GOLDEN-ORANGE BEAK (Juicy, cheerful cartoon bill)
    ctx.save();
    // Upper bill
    ctx.beginPath();
    ctx.moveTo(13, -1.5);
    ctx.quadraticCurveTo(24, -2.5, 28, 2.0);  // Upper bridge curving to tip
    ctx.quadraticCurveTo(21, 4.5, 13, 3.8);    // Smiling mouth line
    ctx.closePath();

    const upperBeakGrad = ctx.createLinearGradient(13, -2, 28, 3);
    if (isRedKing) {
      upperBeakGrad.addColorStop(0, '#fffde7');
      upperBeakGrad.addColorStop(0.35, '#ffd54f');
      upperBeakGrad.addColorStop(0.8, '#ff9800');
      upperBeakGrad.addColorStop(1, '#d84315');
    } else {
      upperBeakGrad.addColorStop(0, '#fff176');
      upperBeakGrad.addColorStop(0.35, '#ffb74d');
      upperBeakGrad.addColorStop(0.8, '#fb8c00');
      upperBeakGrad.addColorStop(1, '#e65100');
    }
    ctx.fillStyle = upperBeakGrad;
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#5a1f04';
    ctx.stroke();

    // Lower bill (Tucked cheerfully beneath smile line)
    ctx.beginPath();
    ctx.moveTo(13, 3.8);
    ctx.quadraticCurveTo(21, 4.5, 28, 2.0);  // Along smile line
    ctx.quadraticCurveTo(23, 9.0, 12, 7.0);  // Rounded chin
    ctx.closePath();

    const lowerBeakGrad = ctx.createLinearGradient(13, 3, 27, 8);
    lowerBeakGrad.addColorStop(0, '#ffa726');
    lowerBeakGrad.addColorStop(0.7, '#f57c00');
    lowerBeakGrad.addColorStop(1, '#d84315');
    ctx.fillStyle = lowerBeakGrad;
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#5a1f04';
    ctx.stroke();

    // Smile seam shadow & corner dimple
    ctx.strokeStyle = '#431402';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(12.5, 3.8);
    ctx.quadraticCurveTo(20, 4.2, 27, 2.0);
    ctx.stroke();
    // Cute smile corner dimple
    ctx.beginPath();
    ctx.arc(12.5, 4.2, 2.0, 0.3, Math.PI * 0.85);
    ctx.stroke();

    // Gloss specular highlight pill on upper bill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.beginPath();
    ctx.ellipse(20, 0, 4.5, 1.2, 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 11. ADORABLE PEACH-PINK / CORAL-ROSE CHEEK BLUSH
    ctx.fillStyle = isRedKing ? 'rgba(255, 82, 82, 0.55)' : 'rgba(255, 110, 155, 0.65)';
    ctx.beginPath();
    ctx.ellipse(5.5, 6.2, 5.5, 3.4, 0.05, 0, Math.PI * 2);
    ctx.fill();

    // 12. BOLD, ADORABLE, CRYSTAL-CLEAR DISNEY/PIXAR EYE
    // Perfectly positioned at the upper-front face, completely unobstructed!
    const eyeX = 7.2;
    const eyeY = -3.8;
    const eyeRx = 7.6;
    const eyeRy = 9.0;

    if (!b.isBlinking) {
      // Crisp outer white oval
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, eyeRx, eyeRy, 0.04, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2.6;
      ctx.strokeStyle = isRedKing ? '#2b0202' : '#061a38';
      ctx.stroke();

      // Soft ambient upper shadow on sclera (Gives true 3D cartoon volume)
      ctx.fillStyle = isRedKing ? 'rgba(255, 235, 238, 0.45)' : 'rgba(179, 215, 245, 0.42)';
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY - 3.8, 6.2, 3.2, 0.04, 0, Math.PI * 2);
      ctx.fill();

      // Large, shiny, eager cartoon pupil looking forward into the flight
      const pupilX = eyeX + 1.8;
      const pupilY = eyeY - 0.2;
      const pupilRx = 4.4;
      const pupilRy = 6.2;

      ctx.beginPath();
      ctx.ellipse(pupilX, pupilY, pupilRx, pupilRy, 0.04, 0, Math.PI * 2);
      const pupilGrad = ctx.createRadialGradient(pupilX - 1, pupilY - 1.8, 1, pupilX, pupilY, pupilRy);
      if (isRedKing) {
        pupilGrad.addColorStop(0, '#3e0808');
        pupilGrad.addColorStop(0.45, '#190303');
        pupilGrad.addColorStop(1, '#020617');
      } else {
        pupilGrad.addColorStop(0, '#1a365d');
        pupilGrad.addColorStop(0.45, '#0b162c');
        pupilGrad.addColorStop(1, '#020617');
      }
      ctx.fillStyle = pupilGrad;
      ctx.fill();

      // Radiant iris crescent at bottom of pupil (Molten Gold for King, Cyan for Prince)
      ctx.strokeStyle = isRedKing ? '#ffd700' : '#00e5ff';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(pupilX, pupilY + 1.6, 2.8, 0.15, Math.PI - 0.15);
      ctx.stroke();

      // Primary crisp bright white catchlight (Top-Left)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pupilX - 1.4, pupilY - 2.0, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Secondary soft sparkle (Bottom-Right)
      ctx.beginPath();
      ctx.arc(pupilX + 1.8, pupilY + 1.8, 1.1, 0, Math.PI * 2);
      ctx.fill();

      // Elegant upper lash rim line (accents the eye without crowding the forehead)
      ctx.strokeStyle = isRedKing ? '#2b0202' : '#061a38';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY - 1.5, eyeRx - 0.5, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    } else {
      // Sweet joyful smiling curved eye with fluttery lashes
      ctx.beginPath();
      ctx.arc(eyeX, eyeY + 1.5, 6.8, 0.18, Math.PI - 0.18);
      ctx.lineWidth = 3.0;
      ctx.strokeStyle = isRedKing ? '#2b0202' : '#061a38';
      ctx.stroke();

      // Cute eyelashes
      ctx.beginPath();
      ctx.moveTo(eyeX + 5.5, eyeY + 3.0);
      ctx.lineTo(eyeX + 8.5, eyeY);
      ctx.moveTo(eyeX + 4.0, eyeY + 6.0);
      ctx.lineTo(eyeX + 7.8, eyeY + 5.0);
      ctx.stroke();
    }

    // 13. ROYAL CROWN
    if (isRedKing) {
      // 👑 GRAND IMPERIAL HIGH KING CROWN (5 majestic spires with tall center tower & glowing Emerald)
      ctx.save();
      ctx.translate(-0.5, -21.5);
      ctx.rotate(0.04);

      // Imperial Crimson Velvet Cap Interior
      ctx.fillStyle = '#7f0000';
      ctx.beginPath();
      ctx.moveTo(-12, 4.0);
      ctx.quadraticCurveTo(0, -11, 12, 4.0);
      ctx.closePath();
      ctx.fill();

      // 5-Spire Grand Golden Silhouette
      ctx.beginPath();
      ctx.moveTo(-13, 4.0);
      ctx.lineTo(13, 4.0);
      ctx.lineTo(15, -9.0);   // Outer right spire
      ctx.lineTo(9.5, -2.5);
      ctx.lineTo(6.5, -12.0);  // Inner right spire
      ctx.lineTo(2.5, -3.5);
      ctx.lineTo(0, -15.5);    // TALL CENTER IMPERIAL SPIRE
      ctx.lineTo(-2.5, -3.5);
      ctx.lineTo(-6.5, -12.0); // Inner left spire
      ctx.lineTo(-9.5, -2.5);
      ctx.lineTo(-15, -9.0);   // Outer left spire
      ctx.closePath();

      const kingCrownGrad = ctx.createLinearGradient(0, -15.5, 0, 5);
      kingCrownGrad.addColorStop(0, '#fffde7');
      kingCrownGrad.addColorStop(0.2, '#fff176');
      kingCrownGrad.addColorStop(0.6, '#ffc107');
      kingCrownGrad.addColorStop(1, '#ff8f00');
      ctx.fillStyle = kingCrownGrad;
      ctx.fill();
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = '#4e2602';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Gem Band Along Crown Base (Alternating Emeralds & Pearls)
      [-9, -4.5, 0, 4.5, 9].forEach((px, idx) => {
        ctx.beginPath();
        ctx.arc(px, 2.2, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = idx % 2 === 0 ? '#00e676' : '#ffffff';
        ctx.fill();
      });

      // 5 Glowing Gems on Spires
      const spireTips = [
        { x: -15, y: -9.0, col: '#ff1744', r: 2.4 },
        { x: -6.5, y: -12.0, col: '#00e5ff', r: 2.6 },
        { x: 0, y: -15.5, col: '#00e676', r: 3.2 }, // Central Grand Emerald
        { x: 6.5, y: -12.0, col: '#00e5ff', r: 2.6 },
        { x: 15, y: -9.0, col: '#ff1744', r: 2.4 }
      ];

      spireTips.forEach((tip, idx) => {
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, tip.r, 0, Math.PI * 2);
        ctx.fillStyle = tip.col;
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = '#2b0202';
        ctx.stroke();

        const twinkle = Math.sin(this.frame * 0.16 + idx * 1.8);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, twinkle > 0.3 ? 1.4 : 0.8, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    } else {
      // 👑 3D GOLDEN ROYAL PRINCE CROWN (3 peaks & rubies)
      ctx.save();
      ctx.translate(-0.5, -20.5);
      ctx.rotate(0.04);

      // Royal Crimson Velvet Cap Interior
      ctx.fillStyle = '#b71c1c';
      ctx.beginPath();
      ctx.moveTo(-11, 4.0);
      ctx.quadraticCurveTo(0, -9.5, 11, 4.0);
      ctx.closePath();
      ctx.fill();

      // 3D Golden Crown Silhouette with 3 peaks
      ctx.beginPath();
      ctx.moveTo(-12, 4.0);
      ctx.lineTo(12, 4.0);
      ctx.lineTo(14, -8.5);
      ctx.lineTo(6.5, -2.0);
      ctx.lineTo(0, -13.5);
      ctx.lineTo(-6.5, -2.0);
      ctx.lineTo(-14, -8.5);
      ctx.closePath();

      const crownGrad = ctx.createLinearGradient(0, -13.5, 0, 5);
      crownGrad.addColorStop(0, '#fffde7');
      crownGrad.addColorStop(0.2, '#fff59d');
      crownGrad.addColorStop(0.6, '#ffca28');
      crownGrad.addColorStop(1, '#ff8f00');
      ctx.fillStyle = crownGrad;
      ctx.fill();
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = '#532f05';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Pearl Band Along Crown Base
      ctx.fillStyle = '#ffffff';
      [-8, -4, 0, 4, 8].forEach(px => {
        ctx.beginPath();
        ctx.arc(px, 2.2, 1.4, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3 Glowing Faceted Rubies on Spires
      const rubyTips = [
        { x: -14, y: -8.5 },
        { x: 0, y: -13.5 },
        { x: 14, y: -8.5 }
      ];

      rubyTips.forEach((tip, idx) => {
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 2.8, 0, Math.PI * 2);
        ctx.fillStyle = '#e53935';
        ctx.fill();
        ctx.lineWidth = 1.3;
        ctx.strokeStyle = '#3e0606';
        ctx.stroke();

        const twinkle = Math.sin(this.frame * 0.16 + idx * 2);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, twinkle > 0.4 ? 1.6 : 1.0, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }

    ctx.restore();
  }

  // Foreground Ground
  drawGround(ctx, curr, prev, t) {
    const groundY = CONFIG.V_HEIGHT - CONFIG.GROUND_HEIGHT;
    const groundH = CONFIG.GROUND_HEIGHT;

    const earthGrad = ctx.createLinearGradient(0, groundY, 0, CONFIG.V_HEIGHT);
    if (this.activeThemeIdx === 2 || this.activeThemeIdx === 3) {
      earthGrad.addColorStop(0, '#423315');
      earthGrad.addColorStop(1, '#241a06');
    } else {
      earthGrad.addColorStop(0, '#ded895');
      earthGrad.addColorStop(0.15, '#c9ba6b');
      earthGrad.addColorStop(1, '#9e8d47');
    }
    ctx.fillStyle = earthGrad;
    ctx.fillRect(0, groundY, CONFIG.V_WIDTH, groundH);

    ctx.fillStyle = (this.activeThemeIdx === 2 || this.activeThemeIdx === 3) ? '#2e7d32' : '#55c544';
    ctx.fillRect(0, groundY, CONFIG.V_WIDTH, 14);

    ctx.fillStyle = (this.activeThemeIdx === 2 || this.activeThemeIdx === 3) ? '#1b5e20' : '#3ca02e';
    ctx.fillRect(0, groundY + 12, CONFIG.V_WIDTH, 4);

    ctx.fillStyle = (this.activeThemeIdx === 2 || this.activeThemeIdx === 3) ? '#388e3c' : '#73d763';
    for (let x = -36; x < CONFIG.V_WIDTH + 36; x += 18) {
      const gx = x - this.groundScroll;
      ctx.beginPath();
      ctx.moveTo(gx, groundY);
      ctx.lineTo(gx + 9, groundY + 8);
      ctx.lineTo(gx + 18, groundY);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(74, 57, 18, 0.35)';
    for (let x = -36; x < CONFIG.V_WIDTH + 36; x += 36) {
      const gx = x - this.groundScroll;
      ctx.beginPath();
      ctx.roundRect(gx + 6, groundY + 28, 14, 7, 3);
      ctx.roundRect(gx + 24, groundY + 48, 16, 8, 3);
      ctx.roundRect(gx + 10, groundY + 68, 12, 6, 3);
      ctx.fill();
    }

    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#1b3b12';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(CONFIG.V_WIDTH, groundY);
    ctx.stroke();
  }

  // MAIN GAME LOOP (Smooth delta-time clamp)
  loop(timestamp) {
    const now = timestamp || performance.now();
    const elapsed = now - this.lastTime;
    this.lastTime = now;

    // Normalizing around 60fps (16.666ms), clamp between 0.5 and 2.0 to prevent physics skipping
    const dt = Math.min(Math.max(elapsed / 16.666, 0.5), 2.0);

    this.update(dt);
    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  window.flyBirdGame = new FlyBirdGame();
});
