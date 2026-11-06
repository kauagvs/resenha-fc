import confetti from "canvas-confetti";

type Options = {
  colors: string[];
  /** Quantas explosões em sequência. */
  bursts?: number;
  sparks?: number;
  /** Quadradinhos chapados, para o modo 8-bit. */
  pixel?: boolean;
  /** Canhões de papel picado saindo dos cantos de baixo. */
  cannons?: boolean;
};

/** Fogos de artifício (canvas-confetti): explosões em 360° espalhadas pelo alto da tela. */
export function fireworks({
  colors,
  bursts = 3,
  sparks = 70,
  pixel = false,
  cannons = false,
}: Options) {
  const base: confetti.Options = {
    colors,
    shapes: pixel ? ["square"] : ["circle", "square"],
    scalar: pixel ? 1.3 : 0.9,
    flat: pixel,
    disableForReducedMotion: true,
    zIndex: 40,
  };

  const burst = () =>
    confetti({
      ...base,
      particleCount: sparks,
      spread: 360,
      startVelocity: 30,
      decay: 0.92,
      gravity: 0.8,
      ticks: 80,
      origin: { x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.3 },
    });

  burst();
  for (let i = 1; i < bursts; i++) setTimeout(burst, i * 180);

  if (cannons) {
    const cannon = (x: number, angle: number) =>
      confetti({
        ...base,
        particleCount: 80,
        angle,
        spread: 55,
        startVelocity: 60,
        origin: { x, y: 1 },
      });
    cannon(0, 60);
    cannon(1, 120);
  }
}

/** Lê uma cor do tema atual (muda no modo 8-bit). */
export function themeColor(token: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim() || "#ffffff";
}
