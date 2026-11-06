import type { LiveMatch, Match, Rules } from "../domain/match";
import { openCloudStore } from "./cloud";
import type { StoredState } from "./matches";
import { loadState, saveState } from "./matches";

/**
 * Onde o placar fica salvo. Fora do claude.ai é o localStorage; publicado como
 * Artifact no claude.ai é o banco online do Artifact (mesmo placar em qualquer aparelho).
 */
export type StoreStatus =
  | "loading"
  | "synced"
  | "offline"
  | "error"
  | "readonly"
  | "full"
  | "local"
  | "local-failed";

export type ScoreStore = {
  kind: "local" | "cloud";
  get(): StoredState;
  /** Chama `onState` já com o estado atual e depois a cada mudança. Devolve o cancelamento. */
  subscribe(onState: (s: StoredState) => void, onStatus: (s: StoreStatus) => void): () => void;
  setLive(live: LiveMatch): void;
  addMatch(match: Match): void;
  deleteMatch(id: string): void;
  setRules(rules: Rules): void;
  /** Só no modo local (restaurar backup). */
  replaceAll?(state: StoredState): void;
};

export async function openStore(): Promise<ScoreStore> {
  return (await openCloudStore()) ?? createLocalStore();
}

export function createLocalStore(): ScoreStore {
  let state = loadState();
  let onState: (s: StoredState) => void = () => {};
  let onStatus: (s: StoreStatus) => void = () => {};

  const commit = (next: StoredState) => {
    state = next;
    onStatus(saveState(state) ? "local" : "local-failed");
    onState(state);
  };

  return {
    kind: "local",
    get: () => state,
    subscribe(stateFn, statusFn) {
      onState = stateFn;
      onStatus = statusFn;
      statusFn("local");
      stateFn(state);
      return () => {
        onState = () => {};
        onStatus = () => {};
      };
    },
    setLive: (live) => commit({ ...state, live }),
    addMatch: (match) => commit({ ...state, matches: [...state.matches, match] }),
    deleteMatch: (id) => commit({ ...state, matches: state.matches.filter((m) => m.id !== id) }),
    setRules: (rules) => commit({ ...state, rules }),
    replaceAll: commit,
  };
}
