import type { ReactNode } from "react";
import type { SeriesStats } from "../domain/match";
import { PLAYERS } from "../domain/match";

const pct = (n: number, total: number) => (total ? `${(n / total) * 100}%` : "0%");

export function SeriesSummary({ stats }: { stats: SeriesStats }) {
  const { played, wins, draws, goals, biggestWin, streak } = stats;

  const facts: ReactNode[] = [];
  if (played) {
    facts.push(
      <>
        Gols: Felipe <b>{goals.felipe}</b> · Kauã <b>{goals.kaua}</b>
      </>,
      <>
        Média por jogo <b>{((goals.felipe + goals.kaua) / played).toFixed(1).replace(".", ",")}</b>
      </>,
    );
    if (biggestWin) {
      const { felipe, kaua } = biggestWin.score;
      facts.push(
        <>
          Maior goleada{" "}
          <b>{felipe > kaua ? `Felipe ${felipe}×${kaua}` : `Kauã ${kaua}×${felipe}`}</b>
        </>,
      );
    }
    if (streak) {
      facts.push(
        <>
          {PLAYERS[streak.player].name} venceu as últimas <b>{streak.count}</b>
        </>,
      );
    }
  }

  return (
    <section>
      <Heading>Série</Heading>
      <div className="ui-panel grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line">
        <Tally value={wins.felipe} label="Felipe" color="text-felipe" />
        <Tally value={draws} label="Empates" color="text-draw" />
        <Tally value={wins.kaua} label="Kauã" color="text-kaua" />
      </div>
      <div aria-hidden className="ui-bar mt-3 flex h-1.5 overflow-hidden rounded-full bg-line">
        <span
          className="bg-felipe transition-[width]"
          style={{ width: pct(wins.felipe, played) }}
        />
        <span
          className="bg-draw/50 transition-[width]"
          style={{ width: played ? pct(draws, played) : "100%" }}
        />
        <span className="bg-kaua transition-[width]" style={{ width: pct(wins.kaua, played) }} />
      </div>
      {facts.length > 0 && (
        <ul className="ui-facts mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted [&_b]:font-semibold [&_b]:text-chalk [&_b]:tabular-nums">
          {facts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Tally({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 bg-turf px-2.5 py-3.5">
      <span
        className={`${color} ui-tally-n font-display text-[44px] leading-none font-black tabular-nums`}
      >
        {value}
      </span>
      <span className="font-label text-[13px] tracking-widest text-muted uppercase">{label}</span>
    </div>
  );
}

export function Heading({ children }: { children: ReactNode }) {
  return (
    <h2 className="ui-heading mb-2.5 font-label text-[13px] font-semibold tracking-[0.14em] text-muted uppercase">
      {children}
    </h2>
  );
}
