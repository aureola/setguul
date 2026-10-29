import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import PageForm from "@/components/admin/PageForm";
import PageHeader from "@/components/admin/ui/PageHeader";

export default async function NewPagePage() {
  const session = await auth();
  if (!hasPermission(session!.user.role, "pages.manage")) redirect("/admin/dashboard");

  return (
    <div>
      <PageHeader title="Хуудас нэмэх" />
      <PageForm />
    </div>
  );
}
