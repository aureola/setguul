import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/pages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return {};
  return {
    title: page.title,
    alternates: { canonical: `/page/${slug}` },
  };
}

export default async function StaticPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  return (
    <div className="container-page py-16">
      <h1 className="text-3xl font-extrabold uppercase">{page.title}</h1>
      <div
        className="prose prose-invert mt-8 max-w-none prose-headings:uppercase prose-a:text-accent"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
