import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-canvas text-muted">
        {icon}
      </span>
      <div>
        <p className="font-medium text-ink">{title}</p>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
