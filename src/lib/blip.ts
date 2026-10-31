let ctx: AudioContext | null = null;

/** Bipe de onda quadrada no estilo console 8-bit. Só toca depois de um clique (regra dos navegadores). */
export function blip(kind: "goal" | "undo" | "whistle") {
  try {
    ctx ??= new AudioContext();
    const notes = { goal: [660, 880, 1320], undo: [440, 330], whistle: [988, 988, 1319] }[kind];
    const step = 0.07;
    notes.forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      const t = ctx!.currentTime + i * step;
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.setValueAtTime(0, t + step * 0.9);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(t);
      osc.stop(t + step);
    });
  } catch {
    // Sem áudio disponível: segue em silêncio.
  }
}
