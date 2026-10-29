import type { Role } from "@prisma/client";

export type Permission =
  | "article.create"
  | "article.editAny"
  | "article.editOwn"
  | "article.deleteAny"
  | "article.deleteOwn"
  | "article.publish"
  | "banner.manage"
  | "menu.manage"
  | "category.manage"
  | "pages.manage"
  | "comments.manage"
  | "settings.manage"
  | "users.manage"
  | "logs.view"
  | "media.manage";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMINISTRATOR: [
    "article.create",
    "article.editAny",
    "article.editOwn",
    "article.deleteAny",
    "article.deleteOwn",
    "article.publish",
    "banner.manage",
    "menu.manage",
    "category.manage",
    "pages.manage",
    "comments.manage",
    "settings.manage",
    "users.manage",
    "logs.view",
    "media.manage",
  ],
  MODERATOR: [
    "article.create",
    "article.editAny",
    "article.editOwn",
    "article.deleteAny",
    "article.deleteOwn",
    "article.publish",
    "banner.manage",
    "comments.manage",
    "media.manage",
  ],
  EDITOR: ["article.create", "article.editOwn", "article.deleteOwn"],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canEditArticle(role: Role, authorId: string, userId: string): boolean {
  if (hasPermission(role, "article.editAny")) return true;
  return hasPermission(role, "article.editOwn") && authorId === userId;
}

export function canDeleteArticle(role: Role, authorId: string, userId: string): boolean {
  if (hasPermission(role, "article.deleteAny")) return true;
  return hasPermission(role, "article.deleteOwn") && authorId === userId;
}
