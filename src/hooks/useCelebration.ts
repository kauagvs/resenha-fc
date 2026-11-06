import { useCallback, useEffect, useState } from "react";
import type { Player } from "../domain/match";
import { fireworks, themeColor } from "../lib/fireworks";

export type Celebration = {
  id: number;
  player: Player;
  kind: "goal" | "quitada" | "win";
};

const DURATION_MS = { goal: 1400, quitada: 2200, win: 1600 } as const;

/** Festa na tela: fogos, tremida e o "GOL!" gigante. */
export function useCelebration(pixel: boolean) {
  const [celebration, setCelebration] = useState<Celebration | null>(null);

  const celebrate = useCallback(
    (player: Player, kind: Celebration["kind"]) => {
      const colors = [
        themeColor(player === "felipe" ? "--color-felipe" : "--color-kaua"),
        themeColor("--color-chalk"),
        themeColor("--color-draw"),
      ];
      const big = kind === "quitada";
      fireworks({ colors, bursts: big ? 7 : kind === "win" ? 3 : 4, sparks: big ? 90 : 70, pixel });
      // Tira e recoloca a classe para a animação recomeçar em gols seguidos.
      setCelebration(null);
      requestAnimationFrame(() => setCelebration({ id: Date.now(), player, kind }));
    },
    [pixel],
  );

  useEffect(() => {
    if (!celebration) return;
    const t = setTimeout(() => setCelebration(null), DURATION_MS[celebration.kind]);
    return () => clearTimeout(t);
  }, [celebration]);

  return { celebration, celebrate };
}
