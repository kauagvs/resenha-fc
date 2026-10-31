import { useRef, useState } from "react";
import { MatchHistory } from "./components/MatchHistory";
import { Scoreboard } from "./components/Scoreboard";
import { SeriesSummary } from "./components/SeriesSummary";
import { useScoreboard } from "./hooks/useScoreboard";
import { exportBackup, parseBackup } from "./storage/matches";

export function App() {
  const board = useScoreboard();
  const { state } = board;
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
    <main className="mx-auto flex max-w-180 flex-col gap-6 pr-[max(16px,env(safe-area-inset-right))] pl-[max(16px,env(safe-area-inset-left))] pt-5 pb-10">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <span className="font-label text-[13px] tracking-[0.14em] text-muted uppercase">
          Resenha FC · Felipe x Kauã
        </span>
        <span className={`font-label text-[13px] ${board.saveFailed ? "text-kaua" : "text-muted"}`}>
          {board.saveFailed ? "Não foi possível salvar neste navegador" : "Salvo neste aparelho"}
        </span>
      </header>

      <Scoreboard
        live={state.live}
        matchNumber={state.matches.length + 1}
        onGoal={board.addGoal}
        onClub={board.setClub}
        onFinish={board.finishMatch}
        onReset={board.resetScore}
      />

      <SeriesSummary stats={board.stats} />

      <MatchHistory matches={state.matches} onDelete={board.deleteMatch} />

      <footer className="flex flex-wrap items-center gap-3 text-sm text-muted">
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
  );
}
