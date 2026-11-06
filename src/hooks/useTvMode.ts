import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Modo TV: só o placar, ocupando a tela. Tenta tela cheia de verdade e manter a tela acesa;
 * se o navegador recusar (alguns apps e celulares), o placar ocupa a janela mesmo assim.
 */
export function useTvMode() {
  const [tv, setTv] = useState(false);
  const usingFullscreen = useRef(false);
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  const releaseWakeLock = () => {
    void wakeLock.current?.release().catch(() => {});
    wakeLock.current = null;
  };

  const enterTv = useCallback(async () => {
    setTv(true);
    try {
      await document.documentElement.requestFullscreen();
      usingFullscreen.current = true;
    } catch {
      usingFullscreen.current = false;
    }
    try {
      wakeLock.current = await navigator.wakeLock.request("screen");
    } catch {
      // Sem wake lock: a tela segue a configuração do aparelho.
    }
  }, []);

  const exitTv = useCallback(() => {
    setTv(false);
    releaseWakeLock();
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    usingFullscreen.current = false;
  }, []);

  // Saiu da tela cheia pelo navegador (Esc, F11, gesto): sai do modo TV também.
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement && usingFullscreen.current) exitTv();
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [exitTv]);

  return { tv, enterTv, exitTv };
}
