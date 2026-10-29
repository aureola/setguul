import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/admin/ProfileForm";
import PageHeader from "@/components/admin/ui/PageHeader";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });
  if (!user) redirect("/admin/login");

  return (
    <div>
      <PageHeader title="Миний профайл" description="Өөрийн нэр, и-мэйл болон нууц үгээ шинэчлэх" />
      <ProfileForm initial={{ name: user.name, email: user.email }} />
    </div>
  );
}
