import { useCallback, useState } from "react";

const KEY = "resenha-fc:voice";

function readVoice(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

/** Liga/desliga a narração. Começa ligada; a escolha fica salva no navegador. */
export function useVoice() {
  const [voiceOn, setVoiceOn] = useState(readVoice);

  const toggleVoice = useCallback(() => {
    setVoiceOn((on) => {
      try {
        localStorage.setItem(KEY, on ? "off" : "on");
      } catch {
        // Sem storage a escolha vale só para esta visita.
      }
      if (on) window.speechSynthesis?.cancel();
      return !on;
    });
  }, []);

  return { voiceOn, toggleVoice };
}
