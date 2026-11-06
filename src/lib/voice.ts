import type { MatchDay, Player, Score } from "@/domain/match";
import { PLAYERS, outcomeOf } from "@/domain/match";

/** Um trecho da narração. `rate` baixo estica a palavra ("Gooool"), `pitch` alto empolga. */
export type Line = string | { text: string; rate?: number; pitch?: number };

/**
 * Narração com a voz do próprio aparelho (Web Speech API), em português.
 * Cada narração interrompe a anterior, para gols seguidos não ficarem em fila.
 */
export function say(lines: Line[]) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const voices = synth.getVoices();
    const voice =
      voices.find((v) => v.lang.toLowerCase() === "pt-br") ??
      voices.find((v) => v.lang.toLowerCase().startsWith("pt"));
    for (const line of lines) {
      const { text, rate = 1.05, pitch = 1.1 } = typeof line === "string" ? { text: line } : line;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "pt-BR";
      u.rate = rate;
      u.pitch = pitch;
      if (voice) u.voice = voice;
      synth.speak(u);
    }
  } catch {
    // Aparelho sem voz disponível: segue em silêncio.
  }
}

const pick = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]!;

/** Placar falado do ponto de vista de quem está na frente: "2 a 1". */
function spoken(score: Score): { leader: Player | null; text: string } {
  const outcome = outcomeOf(score);
  if (outcome === "draw") return { leader: null, text: `${score.felipe} a ${score.kaua}` };
  const other: Player = outcome === "felipe" ? "kaua" : "felipe";
  return { leader: outcome, text: `${score[outcome]} a ${score[other]}` };
}

/** "2 a 1 para o Kauã" / "tudo igual, 1 a 1" */
function scoreLine(score: Score): string {
  const { leader, text } = spoken(score);
  return leader ? `${text} para o ${PLAYERS[leader].name}` : `tudo igual, ${text}`;
}

/** Grito de gol de narrador: "Gooool" esticado, "gol, gol, gol", o nome e o placar. */
export function goalCall(player: Player, score: Score): Line[] {
  const name = PLAYERS[player].name;
  return [
    { text: "Gol!", rate: 0.35, pitch: 1.5 },
    {
      text: pick(["Gol, gol, gol, gol!", "É gol, é gol, é gol!", "Gol, gol, gol!"]),
      rate: 1.35,
      pitch: 1.4,
    },
    {
      text: pick([
        `É do ${name}!`,
        `Gol do ${name}!`,
        `Golaço do ${name}!`,
        `Que golaço, ${name}!`,
      ]),
      rate: 1.15,
      pitch: 1.3,
    },
    `${scoreLine(score)}.`,
  ];
}

export const undoCall = (): Line[] => [pick(["Gol anulado.", "Volta, volta. Gol anulado."])];

/** Quando alguém abre a diferença da quitada. */
export function quitadaCall(player: Player, score: Score): Line[] {
  const name = PLAYERS[player].name;
  return [
    { text: "Quitou!", rate: 0.5, pitch: 1.5 },
    { text: `Quitada do ${name}! ${spoken(score).text}!`, rate: 1.2, pitch: 1.35 },
    "Acabou, pode encerrar a partida.",
  ];
}

export function finalCall(score: Score, day: MatchDay | undefined, quitada: Player | null): Line[] {
  const { leader, text } = spoken(score);
  const result = quitada
    ? `Fim de jogo! Quitada do ${PLAYERS[quitada].name}, ${text}.`
    : leader
      ? `Fim de jogo! Vitória do ${PLAYERS[leader].name}, ${text}.`
      : `Fim de jogo! Empate, ${text}.`;
  if (!day) return [result];
  const dayScore = spoken(day.wins);
  const dayLine = dayScore.leader
    ? `No dia, ${PLAYERS[dayScore.leader].name} na frente, ${dayScore.text}.`
    : `O dia está empatado, ${dayScore.text}.`;
  return [result, dayLine];
}
