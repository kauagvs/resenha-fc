import type { LiveMatch, Match, Rules } from "../domain/match";
import { emptyLiveMatch } from "../domain/match";
import type { StoredState } from "./matches";
import { initialState, parseLive, parseMatch, parseRules } from "./matches";
import type { ScoreStore, StoreStatus } from "./store";

/**
 * Banco online do Artifact no claude.ai (capability `db`). Só existe quando a página
 * roda publicada lá; em qualquer outro lugar `openCloudStore` resolve `null`.
 *
 * Documentos:
 *   placar/atual     { score, clubs, updatedAt }   partida em andamento
 *   partidas/<id>    { score, clubs, playedAt }    partidas encerradas
 *   config/regras    { quitada }                   regras combinadas
 * Também lê o formato da primeira versão da página ({ f, k } e { f, k, at }).
 */

type DbError = { code: string; message: string };
type DocSnap = {
  id: string;
  exists: boolean;
  data(): Record<string, unknown> | undefined;
  metadata: { fromCache: boolean; hasPendingWrites: boolean };
};
type DocRef = {
  set(data: Record<string, unknown>): Promise<void>;
  delete(): Promise<void>;
  onSnapshot(next: (s: DocSnap) => void, error?: (e: DbError) => void): () => void;
};
type QuerySnap = { docs: DocSnap[]; metadata: { fromCache: boolean } };
type Db = {
  doc(path: string): DocRef;
  collection(path: string): {
    doc(id: string): DocRef;
    onSnapshot(next: (s: QuerySnap) => void, error?: (e: DbError) => void): () => void;
  };
};

declare global {
  interface Window {
    claude?: { use(name: string): Promise<unknown> };
  }
}

export async function openCloudStore(): Promise<ScoreStore | null> {
  if (typeof window.claude?.use !== "function") return null;
  const db = (await window.claude.use("db").catch(() => null)) as Db | null;
  return db ? createCloudStore(db) : null;
}

function createCloudStore(db: Db): ScoreStore {
  const liveRef = db.doc("placar/atual");
  const matchesCol = db.collection("partidas");
  const rulesRef = db.doc("config/regras");

  let state: StoredState = initialState();
  let onState: (s: StoredState) => void = () => {};
  let onStatus: (s: StoreStatus) => void = () => {};

  // Placar ao vivo: grava 250 ms depois do último toque, uma escrita por vez.
  let liveDirty = false;
  let liveTimer: ReturnType<typeof setTimeout> | undefined;
  let liveWriting = Promise.resolve();

  const emit = () => onState(state);
  const failed = (e: unknown) => {
    const code = (e as DbError | undefined)?.code;
    onStatus(
      code === "invalid_argument" ? "readonly" : code === "quota_exceeded" ? "full" : "error",
    );
  };

  function flushLive() {
    const live = state.live;
    liveWriting = liveWriting
      .then(() => liveRef.set({ score: live.score, clubs: live.clubs, updatedAt: Date.now() }))
      .then(() => {
        if (state.live === live) liveDirty = false;
      })
      .catch(failed);
  }

  return {
    kind: "cloud",
    get: () => state,
    subscribe(stateFn, statusFn) {
      onState = stateFn;
      onStatus = statusFn;
      statusFn("loading");
      stateFn(state);

      let gotLive = false;
      let gotMatches = false;
      const timer = setTimeout(() => {
        if (!gotLive || !gotMatches) onStatus("offline");
      }, 10_000);
      const ready = () => {
        if (gotLive && gotMatches) {
          clearTimeout(timer);
          onStatus("synced");
        }
      };
      const lost = () => {
        clearTimeout(timer);
        onStatus("offline");
      };

      const stopLive = liveRef.onSnapshot((snap) => {
        if (!snap.metadata.fromCache) {
          gotLive = true;
          ready();
        }
        if (liveDirty || snap.metadata.hasPendingWrites) return;
        state = { ...state, live: snap.exists ? parseCloudLive(snap.data()) : emptyLiveMatch() };
        emit();
      }, lost);

      const stopMatches = matchesCol.onSnapshot((snap) => {
        if (!snap.metadata.fromCache) {
          gotMatches = true;
          ready();
        }
        state = { ...state, matches: snap.docs.flatMap((d) => parseCloudMatch(d.id, d.data())) };
        emit();
      }, lost);

      const stopRules = rulesRef.onSnapshot((snap) => {
        if (snap.metadata.hasPendingWrites) return;
        state = { ...state, rules: parseRules(snap.exists ? snap.data() : undefined) };
        emit();
      }, lost);

      return () => {
        clearTimeout(timer);
        stopLive();
        stopMatches();
        stopRules();
        onState = () => {};
        onStatus = () => {};
      };
    },
    setLive(live: LiveMatch) {
      state = { ...state, live };
      emit();
      liveDirty = true;
      clearTimeout(liveTimer);
      liveTimer = setTimeout(flushLive, 250);
    },
    addMatch(match: Match) {
      matchesCol
        .doc(match.id)
        .set({ score: match.score, clubs: match.clubs, playedAt: match.playedAt })
        .catch(failed);
    },
    setRules(rules: Rules) {
      state = { ...state, rules };
      emit();
      rulesRef.set({ quitada: rules.quitada }).catch(failed);
    },
    deleteMatch(id: string) {
      matchesCol.doc(id).delete().catch(failed);
    },
  };
}

function parseCloudLive(d: Record<string, unknown> | undefined): LiveMatch {
  if (d && "f" in d && !("score" in d))
    return parseLive({ score: { felipe: d["f"], kaua: d["k"] } });
  return parseLive(d);
}

function parseCloudMatch(id: string, d: Record<string, unknown> | undefined): Match[] {
  if (d && "f" in d && !("score" in d)) {
    const at = Number(d["at"]);
    return parseMatch({
      id,
      score: { felipe: d["f"], kaua: d["k"] },
      playedAt: new Date(Number.isFinite(at) ? at : 0).toISOString(),
    });
  }
  return parseMatch({ ...d, id });
}
