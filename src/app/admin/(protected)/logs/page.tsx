import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import PageHeader from "@/components/admin/ui/PageHeader";
import { TableCard, theadRowClass, thClass, tdClass, trClass } from "@/components/admin/ui/Table";
import { formatDateTime } from "@/lib/format";

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!hasPermission(session!.user.role, "logs.view")) redirect("/admin/dashboard");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const pageSize = 50;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <PageHeader title="Үйлдлийн лог" description="Админ панелд хийгдсэн үйлдлүүдийн түүх" />

      <TableCard>
        <thead>
          <tr className={theadRowClass}>
            <th className={thClass}>Огноо</th>
            <th className={thClass}>Хэрэглэгч</th>
            <th className={thClass}>Үйлдэл</th>
            <th className={thClass}>Объект</th>
            <th className={thClass}>IP</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className={`${trClass} align-top`}>
              <td className={`${tdClass} whitespace-nowrap text-muted`}>{formatDateTime(log.createdAt)}</td>
              <td className={tdClass}>{log.user ? `${log.user.name} (${log.user.email})` : "—"}</td>
              <td className={`${tdClass} font-semibold`}>{log.action}</td>
              <td className={tdClass}>
                {log.entityType}
                {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
              </td>
              <td className={`${tdClass} text-muted`}>{log.ip ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </TableCard>

      <div className="mt-6 flex items-center gap-4 text-sm">
        {page > 1 && (
          <a href={`/admin/logs?page=${page - 1}`} className="font-semibold text-accent hover:underline">
            ← Өмнөх
          </a>
        )}
        <span className="text-muted">
          {page} / {totalPages}
        </span>
        {page < totalPages && (
          <a href={`/admin/logs?page=${page + 1}`} className="font-semibold text-accent hover:underline">
            Дараах →
          </a>
        )}
      </div>
    </div>
  );
}
