import { stagger, steps, useAnimate, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { Player } from "@/domain/match";
import { fireworks, themeColor } from "@/lib/fireworks";

export type Celebration = {
  id: number;
  player: Player;
  kind: "goal" | "quitada" | "win";
};

const DURATION_MS = { goal: 1300, quitada: 2200, win: 1600 } as const;

/** Elementos que pulam na comemoração. */
const HOPPERS = ".ui-btn, .ui-toggle, .ui-lcd, .ui-pill";

/**
 * Festa na tela: fogos, tela tremendo, botões pulando e o "GOL!" gigante.
 * `scope` vai no elemento que treme (o <main>).
 */
export function useCelebration(pixel: boolean) {
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [scope, animate] = useAnimate<HTMLElement>();
  const reduceMotion = useReducedMotion();

  const celebrate = useCallback(
    (player: Player, kind: Celebration["kind"]) => {
      const big = kind === "quitada";
      fireworks({
        colors: [
          themeColor(player === "felipe" ? "--color-felipe" : "--color-kaua"),
          themeColor("--color-chalk"),
          themeColor("--color-draw"),
        ],
        bursts: big ? 7 : kind === "win" ? 3 : 4,
        sparks: big ? 90 : 70,
        cannons: big || kind === "win",
        pixel,
      });
      setCelebration({ id: Date.now(), player, kind });

      const root = scope.current;
      if (reduceMotion || !root) return;
      const ease = pixel ? steps(3) : "easeOut";

      void animate(
        root,
        { x: [0, -7, 6, -5, 4, -2, 0], y: [0, 3, -4, 2, -2, 1, 0] },
        { duration: big ? 0.8 : 0.5, ease },
      ).then(() => (root.style.transform = ""));

      const hoppers = [...root.querySelectorAll<HTMLElement>(HOPPERS)];
      void animate(
        hoppers,
        { y: [0, -12, 3, 0], scale: [1, 1.06, 0.98, 1] },
        { duration: 0.5, delay: stagger(0.025), ease },
      ).then(() => hoppers.forEach((el) => (el.style.transform = "")));
    },
    [animate, pixel, reduceMotion, scope],
  );

  useEffect(() => {
    if (!celebration) return;
    const t = setTimeout(() => setCelebration(null), DURATION_MS[celebration.kind]);
    return () => clearTimeout(t);
  }, [celebration]);

  return { celebration, celebrate, scope };
}
