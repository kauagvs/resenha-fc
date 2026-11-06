import { MotionConfig } from "motion/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Quem pede "reduzir movimento" no aparelho não vê as animações. */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
);
