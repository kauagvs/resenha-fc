import type { MatchDay, Player, Score } from "../domain/match";
import { PLAYERS, outcomeOf } from "../domain/match";

/**
 * Narração com a voz do próprio aparelho (Web Speech API), em português.
 * Cada fala interrompe a anterior, para gols seguidos não ficarem em fila.
 */
export function say(text: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    u.rate = 1.05;
    u.pitch = 1.1;
    const voices = synth.getVoices();
    const voice =
      voices.find((v) => v.lang.toLowerCase() === "pt-br") ??
      voices.find((v) => v.lang.toLowerCase().startsWith("pt"));
    if (voice) u.voice = voice;
    synth.speak(u);
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

export function goalCall(player: Player, score: Score): string {
  const name = PLAYERS[player].name;
  const call = pick([
    `Gol do ${name}!`,
    `É gol! ${name}!`,
    `Golaço do ${name}!`,
    `Gol! Gol do ${name}!`,
  ]);
  return `${call} ${scoreLine(score)}.`;
}

export const undoCall = () => pick(["Gol anulado.", "Volta, volta. Gol anulado."]);

export function finalCall(score: Score, day: MatchDay | undefined): string {
  const { leader, text } = spoken(score);
  const result = leader
    ? `Fim de jogo! Vitória do ${PLAYERS[leader].name}, ${text}.`
    : `Fim de jogo! Empate, ${text}.`;
  if (!day) return result;
  const dayScore = spoken(day.wins);
  const dayLine = dayScore.leader
    ? `No dia, ${PLAYERS[dayScore.leader].name} na frente, ${dayScore.text}.`
    : `O dia está empatado, ${dayScore.text}.`;
  return `${result} ${dayLine}`;
}
