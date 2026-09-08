import { AuthGate } from "@/app/components/auth-gate";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import { SectionView } from "@/app/dashboard/section-view";

export default async function DashboardSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  return (
    <AuthGate>
      <WorkspaceShell>
        <SectionView section={section} />
      </WorkspaceShell>
    </AuthGate>
  );
}
