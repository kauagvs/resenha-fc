import { AnimatePresence, motion } from "motion/react";

/** Número que "pula" quando muda (placar do dia, contadores da série). */
export function AnimatedNumber({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          className="inline-block"
          initial={{ y: "-60%", opacity: 0, scale: 1.3 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: "60%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 26 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
