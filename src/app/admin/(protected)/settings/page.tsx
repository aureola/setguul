import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { hasPermission } from "@/lib/permissions";
import SettingsForm from "@/components/admin/SettingsForm";
import PageHeader from "@/components/admin/ui/PageHeader";

export default async function SettingsPage() {
  const session = await auth();
  if (!hasPermission(session!.user.role, "settings.manage")) redirect("/admin/dashboard");

  const settings = await getSettings();

  return (
    <div>
      <PageHeader title="Тохиргоо / Theme" description="Сайтын ерөнхий тохиргоо, харагдах байдал" />
      <SettingsForm initial={settings} />
    </div>
  );
}
