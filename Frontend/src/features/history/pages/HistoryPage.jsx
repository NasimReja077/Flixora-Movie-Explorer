import { useEffect } from "react";
import { Link } from "react-router-dom";
import { History, Sparkles, Trash2, Clock3 } from "lucide-react";
import { motion } from "framer-motion";
import { useHistory } from "../hooks/useHistory.js";
import MovieCard from "../../../components/common/MovieCard.jsx";

const formatWatchedAt = (value) => {
  if (!value) return "Recently watched";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently watched";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const HistoryPage = () => {
  const { items, loading, error, fetchHistory, clearHistory } = useHistory();

  useEffect(() => {
    fetchHistory(20);
  }, [fetchHistory]);

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-24 sm:px-8 lg:px-10">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#8b5cf6]">
              Your activity
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Watch History</h1>
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
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl skeleton" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-100">{error}</div>
        ) : items.length === 0 ? (
          <section className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-dashed border-white/15 bg-white/[0.03] px-6 text-center">
            <div className="max-w-lg">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#8b5cf6]/10 shadow-[0_0_40px_rgba(139,92,246,0.3)]">
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >
            {items.map((historyItem, idx) => {
              const mediaType = historyItem.movieType || "movie";
              const movie = historyItem.movieData || {};
              const title = movie.title || movie.name || "Untitled";
              const rating = movie.vote_average ?? movie.voteAverage ?? movie.rating ?? 0;
              const year = (movie.release_date || movie.releaseDate || movie.first_air_date || "").slice(0, 4);
              const posterPath = movie.poster_path || movie.posterPath;
              const watchedOn = formatWatchedAt(historyItem.watchedAt);

              const movieObj = {
                id: historyItem.movieId,
                title,
                poster_path: posterPath,
                vote_average: rating,
                release_date: year ? `${year}-01-01` : undefined,
                media_type: mediaType,
              };

              return (
                <motion.div
                  key={`${historyItem.movieId}-${historyItem.movieType || "movie"}-${historyItem.watchedAt || "recent"}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex flex-col gap-1"
                >
                  <MovieCard
                    movie={movieObj}
                    mediaType={mediaType}
                  />
                  <div className="flex items-center gap-1.5 px-1 text-[11px] text-white/40">
                    <Clock3 className="h-3 w-3 text-[#8b5cf6]" />
                    <span>{watchedOn}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default HistoryPage;
