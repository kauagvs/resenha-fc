let ctx: AudioContext | null = null;

/**
 * Rugido de torcida sintetizado: ruído filtrado na faixa de vozes, com um "pulsar"
 * leve, que sobe rápido e some devagar. Só toca depois de um clique (regra dos navegadores).
 */
export function roar(seconds = 3, volume = 0.14) {
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime;

    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 850;
    band.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.3);
    gain.gain.setValueAtTime(volume, t + seconds * 0.45);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);

    // Vozes da arquibancada subindo e descendo.
    const pulse = ctx.createOscillator();
    const pulseDepth = ctx.createGain();
    pulse.frequency.value = 5;
    pulseDepth.gain.value = volume * 0.35;
    pulse.connect(pulseDepth).connect(gain.gain);

    noise.connect(band).connect(gain).connect(ctx.destination);
    noise.start(t);
    pulse.start(t);
    noise.stop(t + seconds);
    pulse.stop(t + seconds);
  } catch {
    // Sem áudio disponível: segue em silêncio.
  }
}
