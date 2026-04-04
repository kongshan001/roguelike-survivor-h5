// ===== SFX (8-bit Sound) + Screen Shake + Crit =====
import { CFG } from '../core/config.js';

export const SFX = {
  ctx: null,
  vol: 0.3,
  enabled: true,
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  },
  play(id) {
    if (!this.enabled || !this.ctx) return;
    const defs = {
      hit:      {freq:[440,110],dur:0.15,type:'square'},
      kill:     {freq:[200,600],dur:0.10,type:'square'},
      knife:    {freq:800,       dur:0.05,type:'sawtooth'},
      lightning:{noise:true,     dur:0.12},
      levelup:  {freq:[523,659,784],dur:0.1,type:'square',seq:true},
      pickup:   {freq:880,       dur:0.08,type:'sine'},
      chest:    {freq:[440,660,880],dur:0.08,type:'triangle',seq:true},
      boss:     {freq:110,       dur:0.15,type:'sawtooth',repeat:3},
      freeze:   {freq:[1200,400],dur:0.15,type:'sine'},
      gameover: {freq:[440,110], dur:0.8, type:'sawtooth'},
      victory:  {freq:[523,659,784,1047],dur:0.12,type:'square',seq:true},
      dash:     {freq:[1200,300],dur:0.10,type:'sine'}
    };
    const d = defs[id]; if (!d) return;
    const now = this.ctx.currentTime;
    if (d.noise) {
      const bufSize = this.ctx.sampleRate * d.dur;
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(this.vol * 0.5, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + d.dur);
      src.connect(g); g.connect(this.ctx.destination);
      src.start(now); src.stop(now + d.dur);
    } else if (d.seq) {
      for (let i = 0; i < d.freq.length; i++) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = d.type;
        osc.frequency.setValueAtTime(d.freq[i], now + i * d.dur);
        g.gain.setValueAtTime(this.vol, now + i * d.dur);
        g.gain.exponentialRampToValueAtTime(0.01, now + i * d.dur + d.dur * 0.9);
        osc.connect(g); g.connect(this.ctx.destination);
        osc.start(now + i * d.dur); osc.stop(now + i * d.dur + d.dur);
      }
    } else if (d.repeat) {
      for (let i = 0; i < d.repeat; i++) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = d.type;
        osc.frequency.setValueAtTime(d.freq, now + i * d.dur * 1.5);
        g.gain.setValueAtTime(this.vol, now + i * d.dur * 1.5);
        g.gain.exponentialRampToValueAtTime(0.01, now + i * d.dur * 1.5 + d.dur);
        osc.connect(g); g.connect(this.ctx.destination);
        osc.start(now + i * d.dur * 1.5); osc.stop(now + i * d.dur * 1.5 + d.dur);
      }
    } else {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = d.type;
      if (Array.isArray(d.freq)) {
        osc.frequency.setValueAtTime(d.freq[0], now);
        osc.frequency.exponentialRampToValueAtTime(d.freq[1], now + d.dur);
      } else {
        osc.frequency.setValueAtTime(d.freq, now);
      }
      g.gain.setValueAtTime(this.vol, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + d.dur);
      osc.connect(g); g.connect(this.ctx.destination);
      osc.start(now); osc.stop(now + d.dur);
    }
  }
};

export function screenShake(type, game) {
  const cfg = CFG.SCREEN_SHAKE[type];
  if (!cfg || !game) return;
  if (!game.shake || cfg.intensity >= game.shake.intensity) {
    game.shake = { intensity: cfg.intensity, duration: cfg.duration, timer: cfg.duration };
  }
}

export function playerCrits(player) {
  if (!player) return false;
  return Math.random() < (player.critChance || 0);
}
