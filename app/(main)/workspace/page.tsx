import { WorkspaceClient } from "@/components/workspace";
import { getWorkspaceUser, getWorkspaceById } from "@/actions/workspace";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const instant = false;

interface WorkspacePageProps {
  searchParams: Promise<{ prompt?: string; id?: string }>;
}

async function WorkspaceLoader({ searchParams }: WorkspacePageProps) {
  const { prompt, id } = await searchParams;

  const user = await getWorkspaceUser();

  let workspace = null;
  if (id) {
    workspace = await getWorkspaceById(id, user.id);
  }

  return (
    <WorkspaceClient
      initialPrompt={prompt ?? null}
      workspace={workspace}
      userCredits={user.credits}
      userId={user.id}
      userPlan={user.plan}
    />
  );
}

export default function WorkspacePage(props: WorkspacePageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white/40">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          <span>Loading workspace...</span>
        </div>
      }
    >
      <WorkspaceLoader {...props} />
    </Suspense>
  );
}
