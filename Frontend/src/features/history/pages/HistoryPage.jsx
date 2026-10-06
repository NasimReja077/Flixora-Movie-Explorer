import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  History,
  Play,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { useHistory } from "../hooks/useHistory.js";

const getPosterUrl = (movieData = {}, fallback) => {
  if (movieData.posterUrl) return movieData.posterUrl;
  if (movieData.poster_path) return `https://image.tmdb.org/t/p/w500${movieData.poster_path}`;
  return fallback;
};

const getTitle = (movieData = {}) => {
  return movieData.title || movieData.name || "Untitled title";
};

const getReleaseYear = (movieData = {}) => {
  if (movieData.releaseDate) return movieData.releaseDate.slice(0, 4);
  if (movieData.release_date) return movieData.release_date.slice(0, 4);
  if (movieData.first_air_date) return movieData.first_air_date.slice(0, 4);
  return "N/A";
};

const formatWatchedAt = (value) => {
  if (!value) return "Recently watched";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently watched";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const HistoryPage = () => {
  const { items, loading, error, fetchHistory, clearHistory } = useHistory();

  useEffect(() => {
    fetchHistory(20);
  }, [fetchHistory]);

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-28 sm:px-8 lg:px-10">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#8b5cf6]">
              Your activity
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Watch History
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70">
              <History className="h-4 w-4 text-[#8b5cf6]" />
              <span>{items.length} titles</span>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-100 transition hover:border-red-400/50 hover:bg-red-500/15"
              >
                <Trash2 className="h-4 w-4" />
                Clear all
              </button>
            )}
          </div>
        </header>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-3xl border border-white/10 bg-white/5"
              >
                <div className="h-80 bg-white/10" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 rounded bg-white/10" />
                  <div className="h-3 w-1/3 rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-100">
            {error}
          </div>
        ) : items.length === 0 ? (
          <section className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-dashed border-white/15 bg-white/[0.03] px-6 text-center">
            <div className="max-w-lg">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#8b5cf6]/10">
                <History className="h-8 w-8 text-[#8b5cf6]" />
              </div>
              <h2 className="text-2xl font-bold text-white">No watch history yet</h2>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Start watching titles and your recent picks will appear here for quick access.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#d62b70] to-[#8b5cf6] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(214,43,112,0.35)] transition hover:brightness-110"
              >
                Discover titles
                <Sparkles className="h-4 w-4" />
              </Link>
            </div>
          </section>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((historyItem) => {
              const mediaType = historyItem.movieType || "movie";
              const title = getTitle(historyItem.movieData || {});
              const poster = getPosterUrl(
                historyItem.movieData || {},
                "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop"
              );
              const year = getReleaseYear(historyItem.movieData || {});
              const rating = historyItem.movieData?.rating ?? 0;
              const watchedOn = formatWatchedAt(historyItem.watchedAt);

              return (
                <article
                  key={`${historyItem.movieId}-${historyItem.movieType || "movie"}-${historyItem.watchedAt || "recent"}`}
                  className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] shadow-[0_18px_40px_rgba(0,0,0,0.25)] transition-transform duration-300 hover:-translate-y-1 hover:border-white/20"
                >
                  <div className="relative">
                    <Link to={`/${mediaType === "tv" ? "tv" : "movie"}/${historyItem.movieId}`} className="block">
                      <div className="relative overflow-hidden">
                        <img
                          src={poster}
                          alt={title}
                          className="h-[320px] w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-transparent" />

                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-3">
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm">
                            <Play className="h-3 w-3 fill-current" />
                            {mediaType === "tv" ? "Series" : "Movie"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={`/${mediaType === "tv" ? "tv" : "movie"}/${historyItem.movieId}`}
                        className="text-lg font-bold leading-snug text-white transition hover:text-[#c4b5fd]"
                      >
                        {title}
                      </Link>

                      <div className="inline-flex items-center gap-1 rounded-full bg-[#fbbf24]/10 px-2 py-1 text-[11px] font-semibold text-[#fcd34d]">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {Number(rating || 0).toFixed(1)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-white/55">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {year}
                      </span>
                      <span className="uppercase tracking-[0.18em] text-white/60">
                        {mediaType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-2.5 py-2 text-[11px] text-white/65">
                      <Clock3 className="h-3.5 w-3.5 text-[#8b5cf6]" />
                      <span>Watched {watchedOn}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
};

export default HistoryPage;
