import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LiveMatch, Match, Player } from "../domain/match";
import { emptyLiveMatch, seriesStats } from "../domain/match";
import type { StoredState } from "../storage/matches";
import type { ScoreStore, StoreStatus } from "../storage/store";
import { openStore } from "../storage/store";

export function useScoreboard() {
  const storeRef = useRef<ScoreStore | null>(null);
  const [state, setState] = useState<StoredState>({ live: emptyLiveMatch(), matches: [] });
  const [status, setStatus] = useState<StoreStatus>("loading");
  const [kind, setKind] = useState<ScoreStore["kind"] | null>(null);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = () => {};
    void openStore().then((store) => {
      if (cancelled) return;
      storeRef.current = store;
      setKind(store.kind);
      unsubscribe = store.subscribe(setState, setStatus);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const updateLive = useCallback((fn: (live: LiveMatch) => LiveMatch) => {
    const store = storeRef.current;
    if (store) store.setLive(fn(store.get().live));
  }, []);

  const addGoal = useCallback(
    (player: Player, delta: 1 | -1) =>
      updateLive((live) => ({
        ...live,
        score: { ...live.score, [player]: Math.max(0, live.score[player] + delta) },
      })),
    [updateLive],
  );

  const setClub = useCallback(
    (player: Player, club: string) =>
      updateLive((live) => ({ ...live, clubs: { ...live.clubs, [player]: club } })),
    [updateLive],
  );

  const resetScore = useCallback(
    () => updateLive((live) => emptyLiveMatch(live.clubs)),
    [updateLive],
  );

  /** Registra a partida em andamento e devolve o histórico já com ela. */
  const finishMatch = useCallback((): { match: Match; matches: Match[] } | null => {
    const store = storeRef.current;
    if (!store) return null;
    const { live, matches } = store.get();
    const match: Match = {
      id: crypto.randomUUID(),
      score: live.score,
      clubs: { felipe: live.clubs.felipe.trim(), kaua: live.clubs.kaua.trim() },
      playedAt: new Date().toISOString(),
    };
    store.addMatch(match);
    // Mantém os times escolhidos para a revanche.
    store.setLive(emptyLiveMatch(live.clubs));
    return { match, matches: [...matches, match] };
  }, []);

  const deleteMatch = useCallback((id: string) => storeRef.current?.deleteMatch(id), []);

  /** Restaurar backup só existe no modo local; online os dados já ficam guardados. */
  const replaceAll = useCallback((next: StoredState) => storeRef.current?.replaceAll?.(next), []);

  const stats = useMemo(() => seriesStats(state.matches), [state.matches]);

  return {
    state,
    stats,
    status,
    kind,
    addGoal,
    setClub,
    resetScore,
    finishMatch,
    deleteMatch,
    replaceAll,
  };
}
