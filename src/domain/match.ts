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
};

/** `matches` em qualquer ordem. */
export function seriesStats(matches: Match[]): SeriesStats {
  const stats: SeriesStats = {
    played: matches.length,
    wins: { felipe: 0, kaua: 0 },
    draws: 0,
    goals: { felipe: 0, kaua: 0 },
    biggestWin: null,
    streak: null,
  };

  for (const m of matches) {
    const outcome = outcomeOf(m.score);
    if (outcome === "draw") stats.draws++;
    else stats.wins[outcome]++;
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

  return stats;
}

export function sortNewestFirst(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => b.playedAt.localeCompare(a.playedAt));
}
