import { AnimatePresence, motion, steps } from "motion/react";
import type { Celebration } from "@/hooks/useCelebration";

const TEXT = { goal: "Gol!", quitada: "Quitou!", win: "Venceu!" } as const;
const COLOR = { felipe: "text-felipe", kaua: "text-kaua" } as const;

/** "GOL!" gigante que estoura no meio da tela. */
export function GoalFlash({
  celebration,
  pixel,
}: {
  celebration: Celebration | null;
  pixel: boolean;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
    >
      <AnimatePresence>
        {celebration && (
          <motion.span
            key={celebration.id}
            initial={{ scale: 0.2, rotate: -14, opacity: 0 }}
            animate={{ scale: 1, rotate: -4, opacity: 1 }}
            exit={{ scale: 1.6, opacity: 0, transition: { duration: 0.35 } }}
            transition={
              pixel
                ? { duration: 0.3, ease: steps(4) }
                : { type: "spring", stiffness: 420, damping: 14 }
            }
            className={`${COLOR[celebration.player]} ui-goal-flash absolute font-display text-[clamp(72px,22vw,220px)] leading-none font-black whitespace-nowrap uppercase`}
          >
            {TEXT[celebration.kind]}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
