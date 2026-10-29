import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center text-foreground">
      <p className="text-sm font-bold uppercase tracking-wide text-accent">404</p>
      <h1 className="text-3xl font-black uppercase leading-tight">Хуудас олдсонгүй</h1>
      <p className="max-w-md text-sm text-muted">
        Таны хандсан холбоос алдаатай эсвэл мэдээлэл байхгүй байна.
      </p>
      <Link
        href="/"
        className="mt-2 inline-block rounded-md bg-accent px-6 py-3 text-sm font-bold text-accent-contrast transition hover:opacity-90"
      >
        НҮҮР ХУУДАС РУУ БУЦАХ
      </Link>
    </div>
  );
}
