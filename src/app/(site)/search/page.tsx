import ArticleCard from "@/components/site/ArticleCard";
import { searchArticles } from "@/lib/articles";
import { getSetting } from "@/lib/settings";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [results, urlMode] = await Promise.all([
    q ? searchArticles(q) : Promise.resolve([]),
    getSetting("article_url_mode"),
  ]);

  return (
    <div className="container-page py-12">
      <form className="mb-10 flex max-w-xl gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Мэдээ хайх..."
          className="w-full rounded-md border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-md bg-accent px-5 py-3 text-sm font-bold text-accent-contrast"
        >
          Хайх
        </button>
      </form>

      {q && (
        <p className="mb-6 text-sm text-muted">
          &quot;{q}&quot; гэсэн хайлтаар {results.length} илэрц олдлоо
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {results.map((article) => (
          <ArticleCard key={article.id} article={article} urlMode={urlMode} />
        ))}
      </div>
    </div>
  );
}
