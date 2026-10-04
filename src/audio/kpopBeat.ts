// Web Audio API K-Pop Beat Synthesizer with Percussion & Count Callouts

class KPopAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private countVoiceEnabled: boolean = true;
  private masterGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public setCountVoiceEnabled(enabled: boolean) {
    this.countVoiceEnabled = enabled;
  }

  private currentSpeed: number = 0.6;

  public setSpeed(speed: number) {
    this.currentSpeed = Math.max(0.2, speed);
  }

  // Play beat sound based on count (1 through 32)
  public playBeat(countNumber: number, isAccent: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const subCount = ((countNumber - 1) % 8) + 1; // 1 to 8

    // 1. Kick on every beat
    this.triggerKick(now, isAccent ? 1.0 : 0.7);

    // 2. Snare / Clap on beats 2, 4, 6, 8
    if (subCount % 2 === 0) {
      this.triggerSnare(now + 0.005, isAccent ? 0.9 : 0.65);
    }

    // 3. Hi-hats
    this.triggerHiHat(now, 0.4);
    this.triggerHiHat(now + 0.15, 0.25);
    this.triggerHiHat(now + 0.3, 0.35);
    this.triggerHiHat(now + 0.45, 0.25);

    // 4. Bass note & Synth chord
    this.triggerBass(now, subCount);

    // 5. Accent impact hit for strong poses
    if (isAccent) {
      this.triggerImpact(now);
    }

    // 6. Voice count callout (1 to 8)
    if (this.countVoiceEnabled) {
      this.speakCount(subCount);
    }
  }

  private triggerKick(time: number, power: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(145, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.12);

    gain.gain.setValueAtTime(power, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  private triggerSnare(time: number, power: number) {
    if (!this.ctx || !this.masterGain) return;

    // Noise buffer
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(power * 0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    // Body tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.08);

    oscGain.gain.setValueAtTime(power * 0.5, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.18);
    osc.start(time);
    osc.stop(time + 0.12);
  }

  private triggerHiHat(time: number, power: number) {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(power * 0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.05);
  }

  private triggerBass(time: number, subCount: number) {
    if (!this.ctx || !this.masterGain) return;

    // K-Pop progression in D minor / Bb / C / D
    // counts 1,2 -> D2 (73.4Hz); 3,4 -> F2 (87.3Hz); 5,6 -> G2 (98.0Hz); 7,8 -> A2 (110Hz)
    const pitches = [73.4, 73.4, 87.3, 87.3, 98.0, 98.0, 110.0, 73.4];
    const freq = pitches[(subCount - 1) % 8];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, time);
    filter.frequency.exponentialRampToValueAtTime(140, time + 0.3);

    gain.gain.setValueAtTime(0.28, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.38);
  }

  private triggerImpact(time: number) {
    if (!this.ctx || !this.masterGain) return;

    // Cinematic sub drop + sparkle
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.4);

    gain.gain.setValueAtTime(0.55, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.5);
  }

  private speakCount(count: number) {
    if (!window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(count.toString());
      // Calibrate speech rate cleanly for slower beginner speeds
      utterance.rate = Math.max(0.75, Math.min(1.2, this.currentSpeed * 1.25));
      utterance.pitch = 1.1;
      utterance.volume = this.volume * 0.85;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Graceful fallback if speech synthesis not permitted
    }
  }
}

export const kpopAudio = new KPopAudioEngine();
