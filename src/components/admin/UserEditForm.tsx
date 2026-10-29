"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Role } from "@prisma/client";
import Card from "./ui/Card";
import { fieldClass, selectClass, buttonPrimaryClass, buttonSecondaryClass } from "./ui/styles";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
}

export default function UserEditForm({
  initial,
  isSelf,
}: {
  initial: UserData;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [role, setRole] = useState<Role>(initial.role);
  const [isActive, setIsActive] = useState(initial.isActive);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload: Record<string, unknown> = { name };
    if (!isSelf) {
      payload.role = role;
      payload.isActive = isActive;
    }
    if (password.trim()) payload.password = password.trim();

    const res = await fetch(`/api/admin/users/${initial.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(typeof data?.error === "string" ? data.error : "Хадгалахад алдаа гарлаа");
      return;
    }

    router.push("/admin/users");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-6">
      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
          {error}
        </p>
      )}

      <Card className="space-y-5">
        <label className="block text-sm font-semibold">
          Нэвтрэх нэр
          <input value={initial.email} disabled className={`mt-1.5 font-normal opacity-60 ${fieldClass}`} />
        </label>

        <label className="block text-sm font-semibold">
          Бүтэн нэр
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={`mt-1.5 font-normal ${fieldClass}`}
          />
        </label>

        <label className="block text-sm font-semibold">
          Шинэ нууц үг
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Өөрчлөхгүй бол хоосон орхино уу"
            className={`mt-1.5 font-normal ${fieldClass}`}
          />
        </label>

        {!isSelf && (
          <>
            <label className="block text-sm font-semibold">
              Эрх
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className={`mt-1.5 ${selectClass}`}
              >
                <option value="ADMINISTRATOR">Administrator</option>
                <option value="MODERATOR">Moderator</option>
                <option value="EDITOR">Editor</option>
              </select>
            </label>

            <label className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-accent"
              />
              Идэвхтэй
            </label>
          </>
        )}
      </Card>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className={buttonPrimaryClass}>
          {saving ? "Хадгалж байна..." : "Хадгалах"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/users")}
          className={buttonSecondaryClass}
        >
          Цуцлах
        </button>
      </div>
    </form>
  );
}
