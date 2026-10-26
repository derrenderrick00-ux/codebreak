let context;
let enabled = false;
export const sound = {
  get enabled() { return enabled; },
  setEnabled(value) { enabled = Boolean(value); return enabled; },
  beep(kind = 'ok') {
    if (!enabled) return;
    try {
      context ??= new (window.AudioContext || window.webkitAudioContext)();
      if (context.state === 'suspended') context.resume().catch(() => {});
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const at = context.currentTime;
      oscillator.type = kind === 'error' ? 'sawtooth' : 'sine';
      oscillator.frequency.setValueAtTime(kind === 'error' ? 190 : kind === 'jump' ? 350 : 520, at);
      oscillator.frequency.exponentialRampToValueAtTime(kind === 'error' ? 110 : 750, at + .14);
      gain.gain.setValueAtTime(.035, at);
      gain.gain.exponentialRampToValueAtTime(.001, at + .18);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.start(at); oscillator.stop(at + .19);
    } catch { /* browsers may block sound until the first user gesture */ }
  }
};
