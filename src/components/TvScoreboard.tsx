import { Flag, Goal, Minimize } from "lucide-react";
import { motion } from "motion/react";
import type { Ref } from "react";
import { useEffect } from "react";
import type { LiveMatch, MatchDay, Player } from "@/domain/match";
import { PLAYERS } from "@/domain/match";
import { AnimatedNumber } from "./AnimatedNumber";

const SIDE = {
  felipe: { text: "text-felipe", bg: "bg-felipe" },
  kaua: { text: "text-kaua", bg: "bg-kaua" },
} as const;

type Props = {
  scope: Ref<HTMLElement>;
  live: LiveMatch;
  matchNumber: number;
  today: MatchDay | undefined;
  quitada: Player | null;
  onGoal: (player: Player, delta: 1 | -1) => void;
  onFinish: () => void;
  onExit: () => void;
};

/** Placar em tela cheia para deixar no monitor. Atalhos de teclado para jogar sem mouse. */
export function TvScoreboard({
  scope,
  live,
  matchNumber,
  today,
  quitada,
  onGoal,
  onFinish,
  onExit,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.repeat) return;
      // `code` em vez de `key`: Shift+1 vira "!" no `key`.
      const player: Player | null =
        e.code === "Digit1" || e.code === "Numpad1"
          ? "felipe"
          : e.code === "Digit2" || e.code === "Numpad2"
            ? "kaua"
            : null;
      if (player) {
        e.preventDefault();
        onGoal(player, e.shiftKey ? -1 : 1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        onFinish();
      } else if (e.key === "Escape") {
        onExit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onGoal, onFinish, onExit]);

  return (
    <main
      ref={scope}
      aria-label="Placar em tela cheia"
      className="ui-tv fixed inset-0 z-30 flex flex-col bg-night pt-[max(20px,env(safe-area-inset-top))] pr-[max(24px,env(safe-area-inset-right))] pb-[max(20px,env(safe-area-inset-bottom))] pl-[max(24px,env(safe-area-inset-left))]"
    >
      <header className="flex items-center justify-between gap-4">
        <p className="ui-lcd font-label text-sm tracking-[0.2em] text-muted uppercase">
          Resenha FC · Partida {matchNumber}
        </p>
        {today && (
          <p className="ui-tv-today flex items-baseline gap-3 font-label text-sm tracking-[0.14em] text-muted uppercase">
            Hoje
            <span className="font-display text-3xl font-black tracking-normal tabular-nums">
              <AnimatedNumber className="text-felipe" value={today.wins.felipe} />
              <span className="px-1.5 text-muted">×</span>
              <AnimatedNumber className="text-kaua" value={today.wins.kaua} />
            </span>
          </p>
        )}
        <button
          type="button"
          onClick={onExit}
          className="ui-btn ui-btn-ghost flex items-center gap-2 rounded-[10px] border border-line px-4 py-2 font-label text-sm font-semibold tracking-[0.08em] text-muted uppercase hover:text-chalk"
        >
          <Minimize aria-hidden className="ui-icon size-4" />
          Sair <kbd className="opacity-60">Esc</kbd>
        </button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_auto_1fr] items-center gap-4">
        {(["felipe", "x", "kaua"] as const).map((slot) =>
          slot === "x" ? (
            <span key="x" aria-hidden className="ui-vs font-display text-[min(12vh,8vw)] text-line">
              ×
            </span>
          ) : (
            <div key={slot} className="flex min-w-0 flex-col items-center">
              <h2
                className={`${SIDE[slot].text} ui-name font-display text-[min(9vh,6vw)] leading-none font-bold tracking-[0.04em] uppercase`}
              >
                {PLAYERS[slot].name}
              </h2>
              {live.clubs[slot] && (
                <p className="mt-2 font-label text-[min(3vh,2vw)] tracking-wide text-muted">
                  {live.clubs[slot]}
                </p>
              )}
              <motion.output
                key={live.score[slot]}
                aria-live="polite"
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className={`${SIDE[slot].text} ui-score ui-tv-score led font-display text-[min(46vh,26vw)] leading-[0.9] font-black tabular-nums`}
              >
                {live.score[slot]}
              </motion.output>
            </div>
          ),
        )}
      </div>

      {quitada && (
        <motion.p
          role="status"
          initial={{ scale: 2.4, rotate: -14, opacity: 0 }}
          animate={{ scale: 1, rotate: -6, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 12 }}
          className={`${SIDE[quitada].text} ui-quitada mb-4 text-center font-display text-[min(12vh,9vw)] leading-none font-black uppercase`}
        >
          Quitada!
        </motion.p>
      )}

      <footer className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <TvGoalButtons
            player="felipe"
            locked={!!quitada}
            goals={live.score.felipe}
            onGoal={onGoal}
          />
          <motion.button
            type="button"
            onClick={onFinish}
            whileTap={{ scale: 0.94 }}
            className="ui-btn ui-finish mx-2 flex items-center gap-2 rounded-[10px] bg-chalk px-6 py-3.5 font-label text-base font-semibold tracking-[0.08em] text-night uppercase"
          >
            <Flag aria-hidden className="ui-icon size-5" />
            Encerrar partida
          </motion.button>
          <TvGoalButtons player="kaua" locked={!!quitada} goals={live.score.kaua} onGoal={onGoal} />
        </div>
        <p className="ui-tv-hint text-center text-xs text-muted">
          Atalhos: <kbd>1</kbd> gol do Felipe · <kbd>2</kbd> gol do Kauã · <kbd>Shift</kbd> + número
          tira o gol · <kbd>Enter</kbd> encerra · <kbd>Esc</kbd> sai
        </p>
      </footer>
    </main>
  );
}

function TvGoalButtons({
  player,
  locked,
  goals,
  onGoal,
}: {
  player: Player;
  locked: boolean;
  goals: number;
  onGoal: Props["onGoal"];
}) {
  const { name } = PLAYERS[player];
  return (
    <div className={`flex gap-2 ${player === "kaua" ? "flex-row-reverse" : ""}`}>
      <button
        type="button"
        aria-label={`Tirar gol do ${name}`}
        disabled={goals === 0}
        onClick={() => onGoal(player, -1)}
        className="ui-btn ui-btn-ghost ui-btn-sq w-12 rounded-[10px] border border-line text-2xl leading-none text-muted disabled:cursor-default disabled:opacity-35"
      >
        −
      </button>
      <motion.button
        type="button"
        aria-label={`Gol do ${name}`}
        disabled={locked}
        onClick={() => onGoal(player, 1)}
        whileTap={locked ? undefined : { scale: 0.88 }}
        className={`${SIDE[player].bg} ui-btn flex items-center gap-2 rounded-[10px] px-6 py-3.5 font-label text-base font-semibold tracking-[0.06em] text-night uppercase disabled:cursor-default disabled:opacity-35`}
      >
        <Goal aria-hidden className="ui-icon size-5" />
        Gol {name}
      </motion.button>
    </div>
  );
}
