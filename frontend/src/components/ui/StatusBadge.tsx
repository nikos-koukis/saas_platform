import { cn } from "@/lib/cn";
import { STATUS_LABELS, type ProjectStatus } from "@/lib/types";

const TONES: Record<ProjectStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  on_hold: "bg-amber-50 text-amber-700 ring-amber-600/20",
  completed: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        TONES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
