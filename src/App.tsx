import { useRef, useState } from "react";
import { MatchHistory } from "./components/MatchHistory";
import { Scoreboard } from "./components/Scoreboard";
import { SeriesSummary } from "./components/SeriesSummary";
import { useScoreboard } from "./hooks/useScoreboard";
import { useSkin } from "./hooks/useSkin";
import { blip } from "./lib/blip";
import { exportBackup, parseBackup } from "./storage/matches";

export function App() {
  const board = useScoreboard();
  const { state } = board;
  const { skin, toggleSkin } = useSkin();
  const pixel = skin === "pixel";
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
              className={`font-label text-[12px] ${board.saveFailed ? "text-kaua" : "text-muted"}`}
            >
              {board.saveFailed
                ? "Não foi possível salvar neste navegador"
                : "Salvo neste aparelho"}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={pixel}
            onClick={() => {
              if (!pixel) blip("whistle");
              toggleSkin();
            }}
            className="ui-toggle group flex items-center gap-2.5 rounded-full border border-line px-3 py-1.5 font-label text-[13px] font-semibold tracking-[0.12em] text-muted uppercase hover:text-chalk"
          >
            8-bit
            <span className="ui-toggle-track relative h-5 w-9 rounded-full bg-line transition-colors group-aria-checked:bg-felipe">
              <span className="ui-toggle-knob absolute top-0.5 left-0.5 size-4 rounded-full bg-chalk transition-transform group-aria-checked:translate-x-4" />
            </span>
          </button>
        </header>

        <Scoreboard
          live={state.live}
          matchNumber={state.matches.length + 1}
          onGoal={(player, delta) => {
            if (pixel && (delta > 0 || state.live.score[player] > 0))
              blip(delta > 0 ? "goal" : "undo");
            board.addGoal(player, delta);
          }}
          onClub={board.setClub}
          onFinish={() => {
            if (pixel) blip("whistle");
            board.finishMatch();
          }}
          onReset={board.resetScore}
        />

        <SeriesSummary stats={board.stats} />

        <MatchHistory matches={state.matches} onDelete={board.deleteMatch} />

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
      </main>
    </div>
  );
}
