"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Role } from "@prisma/client";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import { TableCard, theadRowClass, thClass, tdClass, trClass } from "./ui/Table";
import { fieldClass, selectClass, buttonPrimaryClass, iconButtonEditClass } from "./ui/styles";
import { EditIcon } from "./ui/icons";

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  _count: { articles: number };
}

export default function UserManager({ initial }: { initial: UserRow[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("EDITOR");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password, role }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(typeof data?.error === "string" ? data.error : "Хэрэглэгч нэмэхэд алдаа гарлаа");
      return;
    }
    setEmail("");
    setName("");
    setPassword("");
    setRole("EDITOR");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <Card className="max-w-md">
        <form onSubmit={handleCreate} className="space-y-3">
          <h2 className="font-bold">Шинэ хэрэглэгч</h2>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Нэвтрэх нэр"
            className={fieldClass}
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Бүтэн нэр"
            className={fieldClass}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Нууц үг"
            className={fieldClass}
          />
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} className={selectClass}>
            <option value="ADMINISTRATOR">Administrator</option>
            <option value="MODERATOR">Moderator</option>
            <option value="EDITOR">Editor</option>
          </select>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={saving} className={`w-full ${buttonPrimaryClass}`}>
            Нэмэх
          </button>
        </form>
      </Card>

      <TableCard>
        <thead>
          <tr className={theadRowClass}>
            <th className={thClass}>Нэвтрэх нэр</th>
            <th className={thClass}>Нэр</th>
            <th className={thClass}>Эрх</th>
            <th className={thClass}>Мэдээ</th>
            <th className={thClass}>Төлөв</th>
            <th className={thClass}></th>
          </tr>
        </thead>
        <tbody>
          {initial.map((u) => (
            <tr key={u.id} className={trClass}>
              <td className={tdClass}>{u.email}</td>
              <td className={`${tdClass} font-semibold`}>{u.name}</td>
              <td className={tdClass}>{u.role}</td>
              <td className={tdClass}>
                <Link href={`/author/${u.id}`} target="_blank" className="hover:text-accent hover:underline">
                  {u._count.articles}
                </Link>
              </td>
              <td className={tdClass}>
                <Badge variant={u.isActive ? "accent" : "muted"}>{u.isActive ? "Идэвхтэй" : "Идэвхгүй"}</Badge>
              </td>
              <td className={`${tdClass} text-right`}>
                <Link
                  href={`/admin/users/${u.id}`}
                  title="Засах"
                  aria-label="Засах"
                  className={iconButtonEditClass}
                >
                  <EditIcon />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </div>
  );
}
