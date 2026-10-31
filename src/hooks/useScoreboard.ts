import { useCallback, useEffect, useMemo, useState } from "react";
import type { Player } from "../domain/match";
import { emptyLiveMatch, seriesStats } from "../domain/match";
import type { StoredState } from "../storage/matches";
import { loadState, saveState } from "../storage/matches";

export function useScoreboard() {
  const [state, setState] = useState<StoredState>(loadState);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    setSaveFailed(!saveState(state));
  }, [state]);

  const addGoal = useCallback((player: Player, delta: 1 | -1) => {
    setState((s) => ({
      ...s,
      live: {
        ...s.live,
        score: { ...s.live.score, [player]: Math.max(0, s.live.score[player] + delta) },
      },
    }));
  }, []);

  const setClub = useCallback((player: Player, club: string) => {
    setState((s) => ({ ...s, live: { ...s.live, clubs: { ...s.live.clubs, [player]: club } } }));
  }, []);

  const resetScore = useCallback(() => {
    setState((s) => ({ ...s, live: emptyLiveMatch(s.live.clubs) }));
  }, []);

  const finishMatch = useCallback(() => {
    setState((s) => ({
      // Mantém os times escolhidos para a revanche.
      live: emptyLiveMatch(s.live.clubs),
      matches: [
        ...s.matches,
        {
          id: crypto.randomUUID(),
          score: s.live.score,
          clubs: { felipe: s.live.clubs.felipe.trim(), kaua: s.live.clubs.kaua.trim() },
          playedAt: new Date().toISOString(),
        },
      ],
    }));
  }, []);

  const deleteMatch = useCallback((id: string) => {
    setState((s) => ({ ...s, matches: s.matches.filter((m) => m.id !== id) }));
  }, []);

  const replaceAll = useCallback((next: StoredState) => setState(next), []);

  const stats = useMemo(() => seriesStats(state.matches), [state.matches]);

  return {
    state,
    stats,
    saveFailed,
    addGoal,
    setClub,
    resetScore,
    finishMatch,
    deleteMatch,
    replaceAll,
  };
}
