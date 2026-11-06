import { describe, expect, it } from "vitest";
import { parseCloudLive, parseCloudMatch } from "./cloud";

describe("formato da primeira versão da página", () => {
  it("lê partida antiga { f, k, at }", () => {
    expect(parseCloudMatch("old", { f: 4, k: 7, at: 1793402398287 })).toEqual([
      {
        id: "old",
        score: { felipe: 4, kaua: 7 },
        clubs: { felipe: "", kaua: "" },
        playedAt: "2026-10-30T23:19:58.287Z",
      },
    ]);
  });
  it("lê placar ao vivo antigo { f, k }", () => {
    expect(parseCloudLive({ f: 2, k: 1, updatedAt: 1 }).score).toEqual({ felipe: 2, kaua: 1 });
  });
});

describe("formato atual", () => {
  it("lê partida com score, clubs e playedAt", () => {
    const doc = {
      score: { felipe: 3, kaua: 0 },
      clubs: { felipe: "Real Madrid", kaua: "" },
      playedAt: "2026-11-06T19:29:57.917Z",
    };
    expect(parseCloudMatch("new", doc)).toEqual([{ id: "new", ...doc }]);
  });
  it("ignora documento sem data", () => {
    expect(parseCloudMatch("bad", { score: { felipe: 1, kaua: 0 } })).toEqual([]);
  });
});
