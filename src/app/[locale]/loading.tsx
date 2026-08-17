export default function LocaleLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="h-3 w-24 animate-pulse bg-line" />
      <div className="mt-6 h-10 w-2/3 max-w-md animate-pulse bg-line" />
      <div className="mt-4 h-4 w-full max-w-xl animate-pulse bg-line/70" />
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse bg-line/60" />
        ))}
      </div>
    </div>
  );
}
