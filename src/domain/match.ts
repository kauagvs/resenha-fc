export type Player = "felipe" | "kaua";

export const PLAYERS: Record<Player, { name: string }> = {
  felipe: { name: "Felipe" },
  kaua: { name: "Kauã" },
};

export type Score = Record<Player, number>;
export type Clubs = Record<Player, string>;

/** Partida em andamento (ainda não registrada). */
export type LiveMatch = {
  score: Score;
  clubs: Clubs;
};

/** Partida encerrada e registrada no histórico. */
export type Match = {
  id: string;
  score: Score;
  clubs: Clubs;
  playedAt: string; // ISO 8601
};

export type Outcome = Player | "draw";

/** Regras combinadas entre os dois. */
export type Rules = {
  /** Quitada: abriu QUITADA_MARGIN gols de diferença, a partida acaba e quem abriu vence. */
  quitada: boolean;
};

export const DEFAULT_RULES: Rules = { quitada: true };
export const QUITADA_MARGIN = 3;

/** Quem quitou a partida, ou `null` (sem quitada ou regra desligada). */
export function quitadaOf(score: Score, rules: Rules): Player | null {
  if (!rules.quitada || Math.abs(score.felipe - score.kaua) < QUITADA_MARGIN) return null;
  return score.felipe > score.kaua ? "felipe" : "kaua";
}

export const emptyLiveMatch = (clubs: Clubs = { felipe: "", kaua: "" }): LiveMatch => ({
  score: { felipe: 0, kaua: 0 },
  clubs,
});

export function outcomeOf(score: Score): Outcome {
  if (score.felipe > score.kaua) return "felipe";
  if (score.kaua > score.felipe) return "kaua";
  return "draw";
}

export type SeriesStats = {
  played: number;
  wins: Record<Player, number>;
  draws: number;
  goals: Score;
  biggestWin: Match | null;
  /** Sequência de vitórias seguidas do mesmo jogador nas partidas mais recentes (>= 2). */
  streak: { player: Player; count: number } | null;
  /** Quantos dias cada um venceu (e quantos terminaram empatados). */
  days: Record<Outcome, number>;
  /** Quitadas aplicadas por cada um (zeradas com a regra desligada). */
  quitadas: Record<Player, number>;
};

/** `matches` em qualquer ordem. */
export function seriesStats(matches: Match[], rules: Rules = DEFAULT_RULES): SeriesStats {
  const stats: SeriesStats = {
    played: matches.length,
    wins: { felipe: 0, kaua: 0 },
    draws: 0,
    goals: { felipe: 0, kaua: 0 },
    biggestWin: null,
    streak: null,
    days: { felipe: 0, kaua: 0, draw: 0 },
    quitadas: { felipe: 0, kaua: 0 },
  };

  for (const m of matches) {
    const outcome = outcomeOf(m.score);
    if (outcome === "draw") stats.draws++;
    else stats.wins[outcome]++;
    const quitada = quitadaOf(m.score, rules);
    if (quitada) stats.quitadas[quitada]++;
    stats.goals.felipe += m.score.felipe;
    stats.goals.kaua += m.score.kaua;

    const margin = Math.abs(m.score.felipe - m.score.kaua);
    const best = stats.biggestWin;
    if (margin > 0 && (!best || margin > Math.abs(best.score.felipe - best.score.kaua))) {
      stats.biggestWin = m;
    }
  }

  const recent = sortNewestFirst(matches);
  const first = recent[0];
  if (first) {
    const leader = outcomeOf(first.score);
    if (leader !== "draw") {
      let count = 0;
      for (const m of recent) {
        if (outcomeOf(m.score) !== leader) break;
        count++;
      }
      if (count >= 2) stats.streak = { player: leader, count };
    }
  }

  for (const day of groupByDay(matches)) stats.days[day.leader]++;

  return stats;
}

export function sortNewestFirst(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => b.playedAt.localeCompare(a.playedAt));
}

/**
 * Dia da resenha. Partidas antes das 5h contam para o dia anterior: jogo que vira a
 * madrugada é o mesmo dia. Usa o fuso do aparelho.
 */
const DAY_CUTOFF_MS = 5 * 60 * 60 * 1000;

export function dayKeyOf(date: Date | string): string {
  const d = new Date(new Date(date).getTime() - DAY_CUTOFF_MS);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Data (meia-noite local) do dia `key`, para exibir. */
export function dateOfDayKey(key: string): Date {
  const [y = 0, m = 1, d = 1] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export type MatchDay = {
  key: string;
  /** Em ordem cronológica. */
  matches: Match[];
  wins: Record<Player, number>;
  draws: number;
  /** Quem venceu mais partidas no dia. */
  leader: Outcome;
};

/** Dias do mais recente para o mais antigo. */
export function groupByDay(matches: Match[]): MatchDay[] {
  const byKey = new Map<string, Match[]>();
  for (const m of [...matches].sort((a, b) => a.playedAt.localeCompare(b.playedAt))) {
    const key = dayKeyOf(m.playedAt);
    byKey.set(key, [...(byKey.get(key) ?? []), m]);
  }
  return [...byKey.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, dayMatches]) => {
      const wins = { felipe: 0, kaua: 0 };
      let draws = 0;
      for (const m of dayMatches) {
        const outcome = outcomeOf(m.score);
        if (outcome === "draw") draws++;
        else wins[outcome]++;
      }
      return { key, matches: dayMatches, wins, draws, leader: outcomeOf(wins) };
    });
}
