"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Card from "./ui/Card";
import { fieldClass, buttonPrimaryClass } from "./ui/styles";

export default function ProfileForm({ initial }: { initial: { name: string; email: string } }) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const emailChanged = email !== initial.email;
  const wantsPasswordChange = newPassword.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (wantsPasswordChange && newPassword !== confirmPassword) {
      setError("Шинэ нууц үг таарахгүй байна");
      return;
    }

    if ((emailChanged || wantsPasswordChange) && !currentPassword) {
      setError("Имэйл эсвэл нууц үг солихын тулд одоогийн нууц үгээ оруулна уу");
      return;
    }

    setSaving(true);

    const payload: Record<string, unknown> = { name, email };
    if (emailChanged || wantsPasswordChange) {
      payload.currentPassword = currentPassword;
    }
    if (wantsPasswordChange) {
      payload.newPassword = newPassword;
    }

    const res = await fetch("/api/admin/profile", {
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

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSaved(true);
    router.refresh();
  }

  return (
    <Card className="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block text-sm font-semibold">
          Нэр
          <input value={name} onChange={(e) => setName(e.target.value)} required className={`mt-1.5 font-normal ${fieldClass}`} />
        </label>

        <label className="block text-sm font-semibold">
          Нэвтрэх нэр
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`mt-1.5 font-normal ${fieldClass}`}
          />
        </label>

        <div className="border-t border-border pt-5">
          <p className="mb-3 text-sm font-semibold">Нууц үг солих (заавал биш)</p>
          <div className="space-y-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Шинэ нууц үг"
              className={`font-normal ${fieldClass}`}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Шинэ нууц үг давтах"
              className={`font-normal ${fieldClass}`}
            />
          </div>
        </div>

        {(emailChanged || wantsPasswordChange) && (
          <label className="block text-sm font-semibold">
            Одоогийн нууц үг
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="И-мэйл эсвэл нууц үгээ солихдоо баталгаажуулна уу"
              className={`mt-1.5 font-normal ${fieldClass}`}
            />
          </label>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className={buttonPrimaryClass}>
            {saving ? "Хадгалж байна..." : "Хадгалах"}
          </button>
          {saved && <span className="text-sm font-semibold text-accent">Хадгалагдлаа</span>}
        </div>
      </form>
    </Card>
  );
}
