"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { fieldClass, buttonPrimaryClass } from "@/components/admin/ui/styles";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result || result.error) {
      setError("Нэвтрэх нэр эсвэл нууц үг буруу байна");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-xl border border-border bg-surface p-8"
    >
      <Image
        src="/setguullogo.png"
        alt="setguul.mn"
        width={500}
        height={122}
        className="mb-1 h-9 w-auto"
      />
      <p className="mb-6 text-sm text-muted">Админ панелд нэвтрэх</p>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
          {error}
        </p>
      )}

      <label className="mb-3 block text-sm font-semibold">
        Нэвтрэх нэр
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          className={`mt-1.5 font-normal ${fieldClass}`}
        />
      </label>

      <label className="mb-6 block text-sm font-semibold">
        Нууц үг
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={`mt-1.5 font-normal ${fieldClass}`}
        />
      </label>

      <button type="submit" disabled={loading} className={`w-full ${buttonPrimaryClass}`}>
        {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
