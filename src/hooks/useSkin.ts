import { useCallback, useEffect, useState } from "react";

export type Skin = "classic" | "pixel";

/** Também lida em index.html, antes do React, para a página não piscar no visual errado. */
const KEY = "resenha-fc:skin";

function readSkin(): Skin {
  try {
    return localStorage.getItem(KEY) === "pixel" ? "pixel" : "classic";
  } catch {
    return "classic";
  }
}

export function useSkin() {
  const [skin, setSkin] = useState<Skin>(readSkin);

  useEffect(() => {
    document.documentElement.dataset["skin"] = skin;
    try {
      localStorage.setItem(KEY, skin);
    } catch {
      // Sem storage o visual vale só para esta visita.
    }
  }, [skin]);

  const toggleSkin = useCallback(() => setSkin((s) => (s === "pixel" ? "classic" : "pixel")), []);

  return { skin, toggleSkin };
}
