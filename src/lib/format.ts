import { dateOfDayKey } from "@/domain/match";

const dayFmt = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const timeFmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

/** "sex., 6 de nov." */
export const dayLabel = (key: string) => dayFmt.format(dateOfDayKey(key));

/** "17:53" */
export const timeLabel = (iso: string) => timeFmt.format(new Date(iso));
