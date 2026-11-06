import { useEffect, useMemo, useRef, useState } from "react";
import { MatchHistory } from "./components/MatchHistory";
import { Scoreboard } from "./components/Scoreboard";
import { SeriesSummary } from "./components/SeriesSummary";
import { Switch } from "./components/Switch";
import { TodayPanel } from "./components/TodayPanel";
import type { Player } from "./domain/match";
import { dayKeyOf, groupByDay } from "./domain/match";
import { useScoreboard } from "./hooks/useScoreboard";
import { useSkin } from "./hooks/useSkin";
import { useVoice } from "./hooks/useVoice";
import { blip } from "./lib/blip";
import { finalCall, goalCall, say, undoCall } from "./lib/voice";
import { exportBackup, parseBackup } from "./storage/matches";
import type { StoreStatus } from "./storage/store";

const STATUS: Record<StoreStatus, { text: string; warn?: boolean }> = {
  loading: { text: "Conectando…" },
  synced: { text: "Sincronizado online" },
  offline: { text: "Sem conexão com o placar salvo", warn: true },
  error: { text: "Não deu para salvar. Tente de novo.", warn: true },
  readonly: { text: "Você só pode ver este placar", warn: true },
  full: { text: "Limite de partidas atingido. Apague algumas antigas.", warn: true },
  local: { text: "Salvo neste aparelho" },
  "local-failed": { text: "Não foi possível salvar neste navegador", warn: true },
};

export function App() {
  const board = useScoreboard();
  const { state } = board;
  const { skin, toggleSkin } = useSkin();
  const pixel = skin === "pixel";
  const { voiceOn, toggleVoice } = useVoice();
  const todayKey = useTodayKey();
  const today = useMemo(
    () => groupByDay(state.matches).find((d) => d.key === todayKey),
    [state.matches, todayKey],
  );

  function onGoal(player: Player, delta: 1 | -1) {
    const current = state.live.score;
    if (delta < 0 && current[player] === 0) return;
    if (pixel) blip(delta > 0 ? "goal" : "undo");
    if (voiceOn) {
      const next = { ...current, [player]: current[player] + delta };
      say(delta > 0 ? goalCall(player, next) : undoCall());
    }
    board.addGoal(player, delta);
  }

  function onFinish() {
    const finished = board.finishMatch();
    if (!finished) return;
    if (pixel) blip("whistle");
    if (voiceOn) {
      const day = groupByDay(finished.matches).find(
        (d) => d.key === dayKeyOf(finished.match.playedAt),
      );
      say(finalCall(finished.match.score, day));
    }
  }
  const fileInput = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function downloadBackup() {
    const url = URL.createObjectURL(exportBackup(state));
    const a = document.createElement("a");
    a.href = url;
    a.download = `resenha-fc-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importBackup(file: File) {
    try {
      const next = parseBackup(await file.text());
      board.replaceAll(next);
      setNotice(`Backup restaurado: ${next.matches.length} partidas.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Não deu para ler o backup.");
    }
  }

  return (
    <div className="pr-[max(16px,env(safe-area-inset-right))] pl-[max(16px,env(safe-area-inset-left))] pt-5 pb-10">
      <main className="ui-device mx-auto flex max-w-180 flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-label text-[13px] tracking-[0.14em] text-muted uppercase">
              Resenha FC · Felipe x Kauã
            </span>
            <span
              role="status"
              className={`font-label text-[12px] ${STATUS[board.status].warn ? "text-kaua" : "text-muted"}`}
            >
              {STATUS[board.status].text}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Switch
              label="Narração"
              checked={voiceOn}
              onToggle={() => {
                if (!voiceOn) say("Narração ligada. Bola rolando!");
                toggleVoice();
              }}
            />
            <Switch
              label="8-bit"
              checked={pixel}
              onToggle={() => {
                if (!pixel) blip("whistle");
                toggleSkin();
              }}
            />
          </div>
        </header>

        <Scoreboard
          live={state.live}
          matchNumber={state.matches.length + 1}
          onGoal={onGoal}
          onClub={board.setClub}
          onFinish={onFinish}
          onReset={board.resetScore}
        />

        <TodayPanel todayKey={todayKey} day={today} />

        <SeriesSummary stats={board.stats} />

        <MatchHistory matches={state.matches} todayKey={todayKey} onDelete={board.deleteMatch} />

        {board.kind === "local" && (
          <footer className="ui-footer flex flex-wrap items-center gap-3 text-sm text-muted">
            <button type="button" onClick={downloadBackup} className="underline underline-offset-4">
              Exportar backup
            </button>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="underline underline-offset-4"
            >
              Importar backup
            </button>
            <input
              ref={fileInput}
              id="backup-file"
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importBackup(file);
                e.target.value = "";
              }}
            />
            {notice && <span role="status">{notice}</span>}
          </footer>
        )}
      </main>
    </div>
  );
}

/** Chave do dia atual; atualiza sozinha quando o dia vira (às 5h). */
function useTodayKey() {
  const [key, setKey] = useState(() => dayKeyOf(new Date()));
  useEffect(() => {
    const id = setInterval(() => setKey(dayKeyOf(new Date())), 60_000);
    return () => clearInterval(id);
  }, []);
  return key;
}
