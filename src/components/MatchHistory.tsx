import type { Match } from "../domain/match";
import { PLAYERS, dateOfDayKey, groupByDay, outcomeOf } from "../domain/match";
import { ConfirmButton } from "./ConfirmButton";
import { Heading } from "./SeriesSummary";

const dayFmt = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const timeFmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

/** "sex., 6 de nov." */
export const dayLabel = (key: string) => dayFmt.format(dateOfDayKey(key));

const PILL = {
  felipe: { label: "Felipe", className: "text-felipe" },
  kaua: { label: "Kauã", className: "text-kaua" },
  draw: { label: "Empate", className: "text-draw" },
} as const;

type Props = {
  matches: Match[];
  todayKey: string;
  onDelete: (id: string) => void;
};

export function MatchHistory({ matches, todayKey, onDelete }: Props) {
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
        {days.map((day) => {
          const verdict =
            day.leader === "draw"
              ? "Dia empatado"
              : `${PLAYERS[day.leader].name} ${day.key === todayKey ? "ganhando" : "venceu"} o dia`;
          return (
            <div
              key={day.key}
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
                    <span className="text-felipe">{day.wins.felipe}</span>
                    <span className="px-1 text-muted">×</span>
                    <span className="text-kaua">{day.wins.kaua}</span>
                  </span>
                </span>
              </div>
              {[...day.matches].reverse().map((match) => (
                <MatchRow
                  key={match.id}
                  match={match}
                  number={numbers.get(match.id) ?? 0}
                  onDelete={onDelete}
                />
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MatchRow({
  match,
  number,
  onDelete,
}: {
  match: Match;
  number: number;
  onDelete: (id: string) => void;
}) {
  const pill = PILL[outcomeOf(match.score)];
  const clubs = [match.clubs.felipe, match.clubs.kaua].some(Boolean)
    ? `${match.clubs.felipe || "?"} × ${match.clubs.kaua || "?"}`
    : null;
  return (
    <div className="grid grid-cols-[2.4em_1fr_auto] items-center gap-2 px-3 py-2.5 sm:grid-cols-[3.2em_1fr_auto] sm:gap-3 sm:px-3.5">
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
        <span className="text-[13px] text-muted">
          {timeFmt.format(new Date(match.playedAt))}
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
    </div>
  );
}
