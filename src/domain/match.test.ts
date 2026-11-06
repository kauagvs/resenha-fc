import { describe, expect, it } from "vitest";
import type { Match } from "./match";
import { dayKeyOf, groupByDay, outcomeOf, quitadaOf, seriesStats } from "./match";

const match = (playedAt: string, felipe: number, kaua: number): Match => ({
  id: playedAt,
  playedAt,
  score: { felipe, kaua },
  clubs: { felipe: "", kaua: "" },
});

/** As 10 partidas reais até 06/11/2026 (horários em UTC). */
const REAL = [
  match("2026-10-30T23:04:33.247Z", 4, 1),
  match("2026-10-30T23:19:58.287Z", 4, 7),
  match("2026-11-06T19:17:29.250Z", 0, 3),
  match("2026-11-06T19:29:57.917Z", 3, 0),
  match("2026-11-06T19:50:03.819Z", 6, 3),
  match("2026-11-06T20:00:42.887Z", 0, 3),
  match("2026-11-06T20:07:09.482Z", 0, 3),
  match("2026-11-06T20:19:37.944Z", 3, 6),
  match("2026-11-06T20:37:59.263Z", 4, 6),
  match("2026-11-06T20:53:32.959Z", 3, 4),
];

describe("outcomeOf", () => {
  it("aponta quem fez mais gols ou empate", () => {
    expect(outcomeOf({ felipe: 2, kaua: 1 })).toBe("felipe");
    expect(outcomeOf({ felipe: 0, kaua: 3 })).toBe("kaua");
    expect(outcomeOf({ felipe: 2, kaua: 2 })).toBe("draw");
  });
});

describe("quitadaOf", () => {
  const on = { quitada: true };
  it("quita com 3 gols de diferença", () => {
    expect(quitadaOf({ felipe: 3, kaua: 0 }, on)).toBe("felipe");
    expect(quitadaOf({ felipe: 1, kaua: 4 }, on)).toBe("kaua");
  });
  it("não quita com menos de 3", () => {
    expect(quitadaOf({ felipe: 2, kaua: 0 }, on)).toBeNull();
  });
  it("não quita com a regra desligada", () => {
    expect(quitadaOf({ felipe: 5, kaua: 0 }, { quitada: false })).toBeNull();
  });
});

describe("dayKeyOf", () => {
  it("usa o dia local de São Paulo", () => {
    expect(dayKeyOf("2026-11-06T20:53:32.959Z")).toBe("2026-11-06"); // 17:53
  });
  it("conta a madrugada (antes das 5h) no dia anterior", () => {
    expect(dayKeyOf("2026-11-07T06:30:00Z")).toBe("2026-11-06"); // 03:30
    expect(dayKeyOf("2026-11-07T08:30:00Z")).toBe("2026-11-07"); // 05:30
  });
});

describe("groupByDay", () => {
  it("separa os dias reais: 30/10 empatado em 1×1, 06/11 com Kauã 6×2", () => {
    const [today, first] = groupByDay(REAL);
    expect(today).toMatchObject({
      key: "2026-11-06",
      wins: { felipe: 2, kaua: 6 },
      leader: "kaua",
    });
    expect(today?.matches).toHaveLength(8);
    expect(first).toMatchObject({
      key: "2026-10-30",
      wins: { felipe: 1, kaua: 1 },
      leader: "draw",
    });
  });
});

describe("seriesStats", () => {
  it("bate com o placar real: Kauã 7 × 3 Felipe", () => {
    const stats = seriesStats(REAL, { quitada: true });
    expect(stats.wins).toEqual({ felipe: 3, kaua: 7 });
    expect(stats.days).toEqual({ felipe: 0, kaua: 1, draw: 1 });
    expect(stats.quitadas).toEqual({ felipe: 3, kaua: 5 });
    expect(stats.streak).toEqual({ player: "kaua", count: 5 });
  });
  it("zera as quitadas com a regra desligada", () => {
    expect(seriesStats(REAL, { quitada: false }).quitadas).toEqual({ felipe: 0, kaua: 0 });
  });
});
