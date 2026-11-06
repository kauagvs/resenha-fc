import { AnimatePresence, motion } from "motion/react";
import type { Match, Rules } from "@/domain/match";
import { PLAYERS, groupByDay, outcomeOf, quitadaOf } from "@/domain/match";
import { dayLabel, timeLabel } from "@/lib/format";
import { AnimatedNumber } from "./AnimatedNumber";
import { ConfirmButton } from "./ConfirmButton";
import { Heading } from "./SeriesSummary";

const PILL = {
  felipe: { label: "Felipe", className: "text-felipe" },
  kaua: { label: "Kauã", className: "text-kaua" },
  draw: { label: "Empate", className: "text-draw" },
} as const;

type Props = {
  matches: Match[];
  rules: Rules;
  todayKey: string;
  onDelete: (id: string) => void;
};

export function MatchHistory({ matches, rules, todayKey, onDelete }: Props) {
  // Numeração cronológica de todas as partidas (#1 = primeira); dias do mais recente ao mais antigo.
  const numbers = new Map(
    [...matches]
      .sort((a, b) => a.playedAt.localeCompare(b.playedAt))
      .map((m, i) => [m.id, i + 1] as const),
  );
  const days = groupByDay(matches);

  return (
    <section>
      <Heading>Partidas por dia</Heading>
      {days.length === 0 && (
        <p className="ui-panel rounded-xl border border-line bg-turf px-4 py-6 text-center text-muted">
          Nenhuma partida registrada ainda. Marque os gols e toque em “Encerrar partida”.
        </p>
      )}
      <div className="flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {days.map((day) => {
            const verdict =
              day.leader === "draw"
                ? "Dia empatado"
                : `${PLAYERS[day.leader].name} ${day.key === todayKey ? "ganhando" : "venceu"} o dia`;
            return (
              <motion.div
                key={day.key}
                layout
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="ui-panel flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-turf"
              >
                <div className="ui-day-head flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 bg-line/35 px-3.5 py-2.5">
                  <span className="font-label text-[13px] font-semibold tracking-[0.1em] text-chalk uppercase">
                    {dayLabel(day.key)}
                    {day.key === todayKey && " · hoje"}
                  </span>
                  <span className="flex items-baseline gap-2 text-sm">
                    <span className={PILL[day.leader].className}>{verdict}</span>
                    <span className="font-display text-lg font-black tabular-nums">
                      <AnimatedNumber className="text-felipe" value={day.wins.felipe} />
                      <span className="px-1 text-muted">×</span>
                      <AnimatedNumber className="text-kaua" value={day.wins.kaua} />
                    </span>
                  </span>
                </div>
                <AnimatePresence initial={false}>
                  {[...day.matches].reverse().map((match) => (
                    <MatchRow
                      key={match.id}
                      match={match}
                      number={numbers.get(match.id) ?? 0}
                      quitada={quitadaOf(match.score, rules) !== null}
                      onDelete={onDelete}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}

function MatchRow({
  match,
  number,
  quitada,
  onDelete,
}: {
  match: Match;
  number: number;
  quitada: boolean;
  onDelete: (id: string) => void;
}) {
  const pill = PILL[outcomeOf(match.score)];
  const clubs = [match.clubs.felipe, match.clubs.kaua].some(Boolean)
    ? `${match.clubs.felipe || "?"} × ${match.clubs.kaua || "?"}`
    : null;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -24, backgroundColor: "rgb(255 255 255 / 0.12)" }}
      animate={{ opacity: 1, x: 0, backgroundColor: "rgb(255 255 255 / 0)" }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className="grid grid-cols-[2.4em_1fr_auto] items-center gap-2 px-3 py-2.5 sm:grid-cols-[3.2em_1fr_auto] sm:gap-3 sm:px-3.5"
    >
      <span className="font-label text-sm text-muted tabular-nums">#{number}</span>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="font-display text-2xl font-black tracking-wide tabular-nums">
          <span className="text-felipe">{match.score.felipe}</span>
          <span className="px-1 text-muted">×</span>
          <span className="text-kaua">{match.score.kaua}</span>
        </span>
        <span
          className={`${pill.className} ui-pill rounded-full border border-current px-2 py-0.5 font-label text-xs tracking-wider uppercase`}
        >
          {pill.label}
        </span>
        {quitada && (
          <span
            className={`${pill.className} ui-pill rounded-full bg-current/15 px-2 py-0.5 font-label text-xs font-semibold tracking-wider uppercase`}
          >
            Quitada
          </span>
        )}
        <span className="text-[13px] text-muted">
          {timeLabel(match.playedAt)}
          {clubs && ` · ${clubs}`}
        </span>
      </div>
      <ConfirmButton
        label="Apagar"
        confirmLabel="Confirmar"
        ariaLabel={`Apagar partida ${number}`}
        onConfirm={() => onDelete(match.id)}
        className="ui-btn-text rounded-lg border border-transparent px-2.5 py-1.5 font-label text-[13px] tracking-wide text-muted uppercase hover:border-line"
      />
    </motion.div>
  );
}
