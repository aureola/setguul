import path from "path";

// Deliberately outside `public/` — files here are served exclusively through
// the `/uploads/[...path]` route handler (src/app/uploads) rather than as
// static assets. On shared hosting (Apache + Passenger), static files under
// `public/` can be served directly by Apache without ever reaching the Node
// process; on this host that path has shown a propagation delay right after
// a file is written, causing brief 404s. Serving through the app instead
// means every read goes through the same process (and filesystem view) that
// wrote the file, so there's no separate layer that can lag behind.
export const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

export function datePathForNow(): string {
  const now = new Date();
  return [
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("/");
}
