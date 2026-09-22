import { cn } from "@/lib/cn";
import { daysUntil, describeDeadline, formatDate } from "@/lib/format";
import type { ProjectStatus } from "@/lib/types";

/** Completed work is not late, however far past its date it sits. */
export function DeadlineCell({ deadline, status }: { deadline: string; status: ProjectStatus }) {
  const days = daysUntil(deadline);
  const overdue = status !== "completed" && days < 0;
  const imminent = status !== "completed" && days >= 0 && days <= 7;

  return (
    <div className="flex flex-col">
      <span className="text-ink">{formatDate(deadline)}</span>
      {status !== "completed" && (
        <span
          className={cn(
            "text-xs",
            overdue ? "font-medium text-danger" : imminent ? "text-amber-600" : "text-muted",
          )}
        >
          {describeDeadline(deadline)}
        </span>
      )}
    </div>
  );
}
