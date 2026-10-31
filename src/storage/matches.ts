import type { LiveMatch, Match } from "../domain/match";
import { emptyLiveMatch } from "../domain/match";

/** Persistência no navegador (localStorage), backup em JSON e leitura tolerante dos dados salvos. */

const KEY = "resenha-fc:v1";
/** Chave usada quando o app se chamava "placar-fifa"; lida uma vez para não perder partidas. */
const LEGACY_KEY = "placar-fifa:v1";
const BACKUP_IDS = ["resenha-fc", "placar-fifa"];

export type StoredState = {
  live: LiveMatch;
  matches: Match[];
};

const initialState = (): StoredState => ({ live: emptyLiveMatch(), matches: [] });

export function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (!raw) return initialState();
    return parseState(JSON.parse(raw));
  } catch {
    return initialState();
  }
}

export function saveState(state: StoredState): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    localStorage.removeItem(LEGACY_KEY);
    return true;
  } catch {
    return false;
  }
}

export function exportBackup(state: StoredState): Blob {
  return new Blob([JSON.stringify({ app: "resenha-fc", version: 1, ...state }, null, 2)], {
    type: "application/json",
  });
}

/** Lança erro com mensagem amigável se o arquivo não for um backup válido. */
export function parseBackup(text: string): StoredState {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("O arquivo não é um JSON válido.");
  }
  if (!isRecord(json) || !BACKUP_IDS.includes(String(json["app"]))) {
    throw new Error("Esse arquivo não é um backup do placar.");
  }
  return parseState(json);
}

function parseState(json: unknown): StoredState {
  if (!isRecord(json)) return initialState();
  const matches = Array.isArray(json["matches"]) ? json["matches"].flatMap(parseMatch) : [];
  const live = parseLive(json["live"]);
  return { live, matches };
}

export function parseLive(v: unknown): LiveMatch {
  if (!isRecord(v)) return emptyLiveMatch();
  return { score: parseScore(v["score"]), clubs: parseClubs(v["clubs"]) };
}

export function parseMatch(v: unknown): Match[] {
  if (!isRecord(v) || typeof v["id"] !== "string" || typeof v["playedAt"] !== "string") return [];
  return [
    {
      id: v["id"],
      playedAt: v["playedAt"],
      score: parseScore(v["score"]),
      clubs: parseClubs(v["clubs"]),
    },
  ];
}

function parseScore(v: unknown) {
  const s = isRecord(v) ? v : {};
  return { felipe: toGoals(s["felipe"]), kaua: toGoals(s["kaua"]) };
}

function parseClubs(v: unknown) {
  const c = isRecord(v) ? v : {};
  return {
    felipe: typeof c["felipe"] === "string" ? c["felipe"] : "",
    kaua: typeof c["kaua"] === "string" ? c["kaua"] : "",
  };
}

function toGoals(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
