import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  checked: boolean;
  onToggle: () => void;
  icon?: LucideIcon;
};

/** Interruptor liga/desliga (8-bit, narração, regra da quitada). */
export function Switch({ label, checked, onToggle, icon: Icon }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className="ui-toggle group flex items-center gap-2.5 rounded-full border border-line px-3 py-1.5 font-label text-[13px] font-semibold tracking-[0.12em] text-muted uppercase hover:text-chalk"
    >
      {Icon && <Icon aria-hidden className="ui-icon size-4" />}
      {label}
      <span className="ui-toggle-track relative h-5 w-9 rounded-full bg-line transition-colors group-aria-checked:bg-felipe">
        <span className="ui-toggle-knob absolute top-0.5 left-0.5 size-4 rounded-full bg-chalk transition-transform group-aria-checked:translate-x-4" />
      </span>
    </button>
  );
}
