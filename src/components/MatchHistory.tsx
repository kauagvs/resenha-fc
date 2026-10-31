import type { Match } from "../domain/match";
import { outcomeOf } from "../domain/match";
import { ConfirmButton } from "./ConfirmButton";
import { Heading } from "./SeriesSummary";

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const PILL = {
  felipe: { label: "Felipe", className: "text-felipe" },
  kaua: { label: "Kauã", className: "text-kaua" },
  draw: { label: "Empate", className: "text-draw" },
} as const;

type Props = {
  matches: Match[];
  onDelete: (id: string) => void;
};

export function MatchHistory({ matches, onDelete }: Props) {
  // Numeração cronológica (#1 = primeira partida), exibição da mais recente para a mais antiga.
  const chrono = [...matches].sort((a, b) => a.playedAt.localeCompare(b.playedAt));
  const rows = chrono.map((m, i) => ({ match: m, number: i + 1 })).reverse();

  return (
    <section>
      <Heading>Partidas</Heading>
      <div className="ui-panel flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-turf">
        {rows.length === 0 && (
          <p className="px-4 py-6 text-center text-muted">
            Nenhuma partida registrada ainda. Marque os gols e toque em “Encerrar partida”.
          </p>
        )}
        {rows.map(({ match, number }) => {
          const pill = PILL[outcomeOf(match.score)];
          const clubs = [match.clubs.felipe, match.clubs.kaua].some(Boolean)
            ? `${match.clubs.felipe || "?"} × ${match.clubs.kaua || "?"}`
            : null;
          return (
            <div
              key={match.id}
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
                <span className="text-[13px] text-muted">
                  {dateFmt.format(new Date(match.playedAt))}
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
        })}
      </div>
    </section>
  );
}
