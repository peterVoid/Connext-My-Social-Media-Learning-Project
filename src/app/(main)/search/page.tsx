import SearchContent from "./SearchContent";

interface PageProps {
  searchParams: Promise<{ q: string }>;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const { q } = await searchParams;

  return {
    title: `${q} Search results`,
  };
}

export default async function Page({ searchParams }: PageProps) {
  const { q } = await searchParams;

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-black p-5 shadow-sm">
          <h1 className="line-clamp-2 break-all text-center text-2xl font-bold">
            Results for &quot;{q} &quot;
          </h1>
        </div>
        <SearchContent q={q} />
      </div>
    </main>
  );
}
