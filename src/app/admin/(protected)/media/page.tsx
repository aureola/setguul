import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { listMediaWithUsage } from "@/lib/media";
import MediaManager from "@/components/admin/MediaManager";
import PageHeader from "@/components/admin/ui/PageHeader";

export default async function MediaPage() {
  const session = await auth();
  if (!hasPermission(session!.user.role, "media.manage")) redirect("/admin/dashboard");

  const files = await listMediaWithUsage();

  return (
    <div>
      <PageHeader title="Файлын сан" description="Байршуулсан бүх зургийг харах, хайх, устгах" />
      <MediaManager initial={files} />
    </div>
  );
}
