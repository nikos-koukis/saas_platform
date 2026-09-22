import { initials } from "@/lib/format";
import type { TeamMember } from "@/lib/types";

export function Assignee({ member }: { member: TeamMember | null }) {
  if (!member) return <span className="text-sm text-muted">Unassigned</span>;

  return (
    <div className="flex items-center gap-2.5">
      <span
        className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-semibold text-brand"
        aria-hidden
      >
        {initials(member.name)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm text-ink">{member.name}</p>
        <p className="truncate text-xs text-muted">{member.role}</p>
      </div>
    </div>
  );
}
