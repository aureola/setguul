import Link from "next/link";

function pageHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

export default function Pagination({
  basePath,
  currentPage,
  totalPages,
}: {
  basePath: string;
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Хуудаслалт">
      <Link
        href={pageHref(basePath, currentPage - 1)}
        aria-disabled={currentPage <= 1}
        className={`rounded-md border border-border px-3 py-2 text-sm font-medium ${
          currentPage <= 1 ? "pointer-events-none opacity-40" : "hover:border-accent"
        }`}
      >
        Өмнөх
      </Link>

      {pages.map((page) => (
        <Link
          key={page}
          href={pageHref(basePath, page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`rounded-md border px-3 py-2 text-sm font-medium ${
            page === currentPage
              ? "border-accent bg-accent text-accent-contrast"
              : "border-border hover:border-accent"
          }`}
        >
          {page}
        </Link>
      ))}

      <Link
        href={pageHref(basePath, currentPage + 1)}
        aria-disabled={currentPage >= totalPages}
        className={`rounded-md border border-border px-3 py-2 text-sm font-medium ${
          currentPage >= totalPages ? "pointer-events-none opacity-40" : "hover:border-accent"
        }`}
      >
        Дараах
      </Link>
    </nav>
  );
}
