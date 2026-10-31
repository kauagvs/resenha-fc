import { useEffect, useState } from "react";

type Props = {
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
  className?: string;
  ariaLabel?: string;
};

/** Botão de ação destrutiva: o primeiro toque arma, o segundo (em até 3 s) confirma. */
export function ConfirmButton({
  label,
  confirmLabel,
  onConfirm,
  className = "",
  ariaLabel,
}: Props) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={`${className} ${armed ? "border-danger! text-danger!" : ""}`}
      onClick={() => {
        if (!armed) return setArmed(true);
        setArmed(false);
        onConfirm();
      }}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}
