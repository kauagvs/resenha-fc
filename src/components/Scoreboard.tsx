import { Flag, Goal, Swords } from "lucide-react";
import { motion } from "motion/react";
import type { LiveMatch, Player, Rules } from "@/domain/match";
import { PLAYERS, QUITADA_MARGIN } from "@/domain/match";
import { ConfirmButton } from "./ConfirmButton";
import { Switch } from "./Switch";

const SIDE = {
  felipe: { text: "text-felipe", bg: "bg-felipe" },
  kaua: { text: "text-kaua", bg: "bg-kaua" },
} as const;

type Props = {
  live: LiveMatch;
  matchNumber: number;
  onGoal: (player: Player, delta: 1 | -1) => void;
  onClub: (player: Player, club: string) => void;
  onFinish: () => void;
  onReset: () => void;
  /** Quem quitou a partida em andamento; com quitada os gols travam até encerrar. */
  quitada: Player | null;
  rules: Rules;
  onRules: (rules: Rules) => void;
};

export function Scoreboard({
  live,
  matchNumber,
  onGoal,
  onClub,
  onFinish,
  onReset,
  quitada,
  rules,
  onRules,
}: Props) {
  const locked = quitada !== null;
  return (
    <section
      aria-label="Placar da partida atual"
      className="ui-panel ui-board rounded-2xl border border-line bg-linear-to-b from-[#0f1c15] to-[#0a120e] px-4 pt-6 pb-5 shadow-[inset_0_0_0_4px_rgb(0_0_0/0.35)]"
    >
      <p className="ui-lcd mb-3 text-center font-label text-xs tracking-[0.2em] text-muted uppercase">
        Partida {matchNumber}
      </p>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Side player="felipe" live={live} onGoal={onGoal} onClub={onClub} locked={locked} />
        <span aria-hidden className="ui-vs pb-16 font-display text-5xl text-line sm:text-6xl">
          ×
        </span>
        <Side player="kaua" live={live} onGoal={onGoal} onClub={onClub} locked={locked} mirrored />
      </div>

      {quitada && (
        <div role="status" className="mt-5 flex flex-col items-center gap-1 text-center">
          <motion.p
            initial={{ scale: 2.4, rotate: -14, opacity: 0 }}
            animate={{ scale: 1, rotate: -6, opacity: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 12 }}
            className={`${SIDE[quitada].text} ui-quitada font-display text-5xl font-black tracking-[0.04em] uppercase`}
          >
            Quitada!
          </motion.p>
          <p className="text-sm text-muted">
            {PLAYERS[quitada].name} abriu {QUITADA_MARGIN} de diferença. Toque em “Encerrar partida”
            para registrar.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap justify-center gap-2.5">
        <motion.button
          type="button"
          onClick={onFinish}
          whileTap={{ scale: 0.94 }}
          className="ui-btn ui-finish flex items-center gap-2 rounded-[10px] bg-chalk px-5 py-3 font-label text-[15px] font-semibold tracking-[0.08em] text-night uppercase"
        >
          <Flag aria-hidden className="ui-icon size-4" />
          Encerrar partida
        </motion.button>
        <ConfirmButton
          label="Zerar placar"
          confirmLabel="Confirmar zerar"
          onConfirm={onReset}
          className="ui-btn ui-btn-ghost rounded-[10px] border border-line px-5 py-3 font-label text-[15px] font-semibold tracking-[0.08em] text-muted uppercase"
        />
      </div>

      <div className="mt-4 flex flex-col items-center gap-1">
        <Switch
          label={`Regra da quitada · ${QUITADA_MARGIN} gols`}
          icon={Swords}
          checked={rules.quitada}
          onToggle={() => onRules({ ...rules, quitada: !rules.quitada })}
        />
        <p className="ui-rule-hint text-xs text-muted">
          {rules.quitada
            ? `Abriu ${QUITADA_MARGIN} gols de diferença, acabou a partida.`
            : "Desligada: a partida só acaba quando vocês encerram."}
        </p>
      </div>
    </section>
  );
}

function Side({
  player,
  live,
  onGoal,
  onClub,
  locked,
  mirrored = false,
}: {
  player: Player;
  live: LiveMatch;
  onGoal: Props["onGoal"];
  onClub: Props["onClub"];
  locked: boolean;
  mirrored?: boolean;
}) {
  const { name } = PLAYERS[player];
  const goals = live.score[player];
  const color = SIDE[player];

  const minus = (
    <button
      type="button"
      aria-label={`Tirar gol do ${name}`}
      disabled={goals === 0}
      onClick={() => onGoal(player, -1)}
      className="ui-btn ui-btn-ghost ui-btn-sq w-11 rounded-[10px] border border-line text-2xl leading-none text-muted disabled:cursor-default disabled:opacity-35"
    >
      −
    </button>
  );
  const plus = (
    <motion.button
      type="button"
      aria-label={`Gol do ${name}`}
      disabled={locked}
      onClick={() => onGoal(player, 1)}
      whileTap={locked ? undefined : { scale: 0.88 }}
      className={`${color.bg} ui-btn flex items-center gap-1.5 rounded-[10px] px-4 py-3 font-label text-base font-semibold tracking-[0.06em] text-night uppercase disabled:cursor-default disabled:opacity-35 sm:px-5`}
    >
      <Goal aria-hidden className="ui-icon size-4" />
      Gol
    </motion.button>
  );

  return (
    <div className="flex min-w-0 flex-col items-center gap-2.5">
      <h2
        className={`${color.text} ui-name font-display text-2xl font-bold tracking-[0.04em] uppercase sm:text-3xl`}
      >
        {name}
      </h2>
      <input
        id={`club-${player}`}
        value={live.clubs[player]}
        onChange={(e) => onClub(player, e.target.value)}
        placeholder="Time"
        aria-label={`Time do ${name}`}
        maxLength={24}
        className="ui-input w-full max-w-36 rounded-md border border-transparent bg-transparent px-2 py-1 text-center font-label text-sm tracking-wide text-muted placeholder:text-line hover:border-line focus:border-line focus:outline-none"
      />
      <motion.output
        key={goals}
        aria-live="polite"
        initial={{ scale: 1.35 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        className={`${color.text} ui-score led font-display text-[clamp(88px,26vw,156px)] leading-[0.85] font-black tabular-nums`}
      >
        {goals}
      </motion.output>
      <div className="flex gap-2">
        {mirrored ? (
          <>
            {plus}
            {minus}
          </>
        ) : (
          <>
            {minus}
            {plus}
          </>
        )}
      </div>
    </div>
  );
}
