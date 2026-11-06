import type { Celebration } from "../hooks/useCelebration";

const TEXT = { goal: "Gol!", quitada: "Quitou!", win: "Venceu!" } as const;
const COLOR = { felipe: "text-felipe", kaua: "text-kaua" } as const;

/** "GOL!" gigante que estoura no meio da tela. */
export function GoalFlash({ celebration }: { celebration: Celebration | null }) {
  if (!celebration) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
    >
      <span
        key={celebration.id}
        className={`${COLOR[celebration.player]} ui-goal-flash animate-goal-flash font-display text-[clamp(72px,22vw,220px)] leading-none font-black whitespace-nowrap uppercase`}
      >
        {TEXT[celebration.kind]}
      </span>
    </div>
  );
}
