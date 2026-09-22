import { Suspense } from "react";

import { ProjectsView } from "@/components/projects/ProjectsView";
import { Spinner } from "@/components/ui/Spinner";

export default function ProjectsPage() {
  return (
    // useSearchParams reads request-time data, so it needs a boundary above it.
    <Suspense
      fallback={
        <div className="grid place-items-center py-20">
          <Spinner label="Loading projects" />
        </div>
      }
    >
      <ProjectsView />
    </Suspense>
  );
}
