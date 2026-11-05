import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Sparkles, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useWatchlist } from "../hooks/useWatchlist.js";
import MovieCard from "../../../components/common/MovieCard.jsx";

const WatchlistPage = () => {
  const {
    items,
    loading,
    initialized,
    error,
    fetchWatchlist,
    removeFromWatchlist,
  } = useWatchlist();

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-24 sm:px-8 lg:px-10">
        {/* Page Header */}
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#8b5cf6]">
              Save for later
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              My Watchlist
            </h1>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70">
            <Bookmark className="h-4 w-4 text-[#c4b5fd]" />
            <span>{items.length} {items.length === 1 ? "title" : "titles"}</span>
          </div>
        </header>

        {/* Loading */}
        {!initialized ? (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl skeleton" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-100" role="alert">
            {error}
          </div>
        ) : items.length === 0 ? (
          /* Empty state */
          <section className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-dashed border-white/15 bg-white/[0.03] px-6 text-center">
            <div className="max-w-lg">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#8b5cf6]/10 shadow-[0_0_40px_rgba(139,92,246,0.3)]">
                <Bookmark className="h-8 w-8 text-[#8b5cf6]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Your watchlist is empty</h2>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Bookmark movies and series you want to watch, and find them here later.
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
          /* Grid */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >
            {items.map((item, idx) => {
              const movie = item.movieData || {};
              const mediaType = item.movieType || "movie";
              const title = movie.title || movie.name || "Untitled";
              const rating = movie.vote_average ?? movie.voteAverage ?? movie.rating ?? 0;
              const year = (movie.release_date || movie.releaseDate || movie.first_air_date || "").slice(0, 4);
              const posterPath = movie.poster_path || movie.posterPath;

              const movieObj = {
                id: item.movieId,
                title,
                poster_path: posterPath,
                vote_average: rating,
                release_date: year ? `${year}-01-01` : undefined,
                media_type: mediaType,
              };

              return (
                <motion.div
                  key={`${item.movieId}-${mediaType}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="relative group"
                >
                  <MovieCard
                    movie={movieObj}
                    mediaType={mediaType}
                  />
                  {/* Remove button */}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => removeFromWatchlist(item.movieId)}
                    aria-label={`Remove ${title} from watchlist`}
                    className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm text-white/70 hover:text-red-400 hover:border-red-400/30 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default WatchlistPage;
