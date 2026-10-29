"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Role } from "@prisma/client";
import { hasPermission } from "@/lib/permissions";
import { useAdminTheme } from "./AdminThemeProvider";
import { SunIcon, MoonIcon, PowerIcon } from "./ui/icons";

interface NavItem {
  href: string;
  label: string;
  show: (role: Role) => boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Үндсэн",
    items: [
      { href: "/admin/dashboard", label: "Хянах самбар", show: () => true },
      { href: "/admin/articles", label: "Мэдээ", show: () => true },
    ],
  },
  {
    title: "Агуулга",
    items: [
      { href: "/admin/categories", label: "Ангилал", show: (role) => hasPermission(role, "category.manage") },
      { href: "/admin/banners", label: "Баннер", show: (role) => hasPermission(role, "banner.manage") },
      { href: "/admin/menu", label: "Цэс", show: (role) => hasPermission(role, "menu.manage") },
      { href: "/admin/pages", label: "Хуудас", show: (role) => hasPermission(role, "pages.manage") },
      { href: "/admin/comments", label: "Сэтгэгдэл", show: (role) => hasPermission(role, "comments.manage") },
      { href: "/admin/media", label: "Файлын сан", show: (role) => hasPermission(role, "media.manage") },
    ],
  },
  {
    title: "Систем",
    items: [
      { href: "/admin/settings", label: "Тохиргоо / Theme", show: (role) => hasPermission(role, "settings.manage") },
      { href: "/admin/users", label: "Хэрэглэгчид", show: (role) => hasPermission(role, "users.manage") },
      { href: "/admin/logs", label: "Үйлдлийн лог", show: (role) => hasPermission(role, "logs.view") },
    ],
  },
];

export default function AdminSidebar({
  role,
  name,
}: {
  role: Role;
  name: string;
}) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useAdminTheme();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border p-6">
        <Link href="/admin/dashboard" className="text-xl font-extrabold tracking-tight">
          <span className="text-accent">setguul</span>.mn
        </Link>
        <p className="mt-1 text-xs text-muted">Админ панел</p>
      </div>

      <Link
        href="/admin/profile"
        className={`flex items-center gap-3 border-b border-border p-4 transition hover:bg-border/40 ${
          pathname.startsWith("/admin/profile") ? "bg-accent/10" : ""
        }`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-accent-contrast">
          {name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="text-xs text-muted">{roleLabel(role)}</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {NAV_SECTIONS.map((section) => {
          const items = section.items.filter((item) => item.show(role));
          if (items.length === 0) return null;
          return (
            <div key={section.title}>
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-muted">
                {section.title}
              </p>
              <div className="space-y-1">
                {items.map((item) => {
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative block rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        active
                          ? "bg-accent/15 text-accent"
                          : "text-foreground hover:bg-border/60"
                      }`}
                    >
                      {active && (
                        <span className="absolute inset-y-1 left-0 w-1 rounded-full bg-accent" />
                      )}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 border-t border-border p-4">
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Light" : "Dark"}
          aria-label={theme === "dark" ? "Light" : "Dark"}
          className="flex flex-1 gap-2 items-center justify-center rounded-lg border border-border px-3 py-2 transition hover:border-accent text-xs"
        >
          {theme === "dark" ? "Light" : "Dark"} {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          title="Гарах"
          aria-label="Гарах"
          className="flex shrink-0 items-center justify-center rounded-lg border border-border px-3 py-2 text-red-400 transition hover:border-red-400 hover:bg-red-500/10"
        >
          <PowerIcon className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}

function roleLabel(role: Role) {
  switch (role) {
    case "ADMINISTRATOR":
      return "Administrator";
    case "MODERATOR":
      return "Moderator";
    case "EDITOR":
      return "Editor";
  }
}
