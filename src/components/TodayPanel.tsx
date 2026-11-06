import type { MatchDay } from "@/domain/match";
import { PLAYERS } from "@/domain/match";
import { dayLabel } from "@/lib/format";
import { AnimatedNumber } from "./AnimatedNumber";
import { Heading } from "./SeriesSummary";

const LEADER_COLOR = { felipe: "text-felipe", kaua: "text-kaua", draw: "text-draw" } as const;

/** Placar do dia atual: quem está ganhando o dia. */
export function TodayPanel({ todayKey, day }: { todayKey: string; day: MatchDay | undefined }) {
  const played = day?.matches.length ?? 0;
  const headline = !day
    ? "Dia ainda sem partidas"
    : day.leader === "draw"
      ? "Dia empatado"
      : `${PLAYERS[day.leader].name} ganhando o dia`;

  return (
    <section>
      <Heading>Hoje · {dayLabel(todayKey)}</Heading>
      <div className="ui-panel ui-today flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-line bg-turf px-4 py-3.5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p
            className={`${day ? LEADER_COLOR[day.leader] : "text-muted"} ui-today-title font-display text-2xl font-bold tracking-[0.03em] uppercase`}
          >
            {headline}
          </p>
          <p className="text-sm text-muted">
            {day
              ? `${played} ${played === 1 ? "partida" : "partidas"}${day.draws ? ` · ${day.draws} ${day.draws === 1 ? "empate" : "empates"}` : ""}`
              : "A primeira partida encerrada hoje abre o placar do dia."}
          </p>
        </div>
        {day && (
          <p
            aria-label={`Felipe ${day.wins.felipe}, Kauã ${day.wins.kaua}`}
            className="ui-today-score font-display text-4xl font-black tabular-nums"
          >
            <AnimatedNumber className="text-felipe" value={day.wins.felipe} />
            <span className="px-1.5 text-muted">×</span>
            <AnimatedNumber className="text-kaua" value={day.wins.kaua} />
          </p>
        )}
      </div>
    </section>
  );
}
