import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  CalendarDays,
  Play,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { useWatchlist } from "../hooks/useWatchlist.js";

const getPosterUrl = (movie = {}) =>
  movie.posterUrl ||
  movie.posterPath?.startsWith("/") && `https://image.tmdb.org/t/p/w500${movie.posterPath}` ||
  movie.poster_path && `https://image.tmdb.org/t/p/w500${movie.poster_path}` ||
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop";

const getYear = (movie = {}) =>
  (movie.releaseDate || movie.release_date || movie.first_air_date || "").slice(0, 4) || "N/A";

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
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 lg:px-10">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#8b5cf6]">
              Save for later
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">My Watchlist</h1>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70">
            <Bookmark className="h-4 w-4 text-[#c4b5fd]" />
            <span>{items.length} {items.length === 1 ? "title" : "titles"}</span>
          </div>
        </header>

        {!initialized ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                <div className="h-80 bg-white/10" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 rounded bg-white/10" />
                  <div className="h-3 w-1/3 rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-100" role="alert">
            {error}
          </div>
        ) : items.length === 0 ? (
          <section className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-dashed border-white/15 bg-white/[0.03] px-6 text-center">
            <div className="max-w-lg">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#8b5cf6]/10">
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
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => {
              const movie = item.movieData || {};
              const mediaType = item.movieType || "movie";
              const title = movie.title || movie.name || "Untitled title";
              const rating = movie.voteAverage ?? movie.rating ?? movie.vote_average ?? 0;

              return (
                <article
                  key={`${item.movieId}-${mediaType}`}
                  className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] shadow-[0_18px_40px_rgba(0,0,0,0.25)] transition-transform duration-300 hover:-translate-y-1 hover:border-white/20"
                >
                  <Link to={`/${mediaType === "tv" ? "tv" : "movie"}/${item.movieId}`} className="relative block overflow-hidden">
                    <img
                      src={getPosterUrl(movie)}
                      alt={title}
                      className="h-[320px] w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm">
                      <Play className="h-3 w-3 fill-current" />
                      {mediaType === "tv" ? "Series" : "Movie"}
                    </span>
                  </Link>

                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={`/${mediaType === "tv" ? "tv" : "movie"}/${item.movieId}`}
                        className="text-lg font-bold leading-snug text-white transition hover:text-[#c4b5fd]"
                      >
                        {title}
                      </Link>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#fbbf24]/10 px-2 py-1 text-[11px] font-semibold text-[#fcd34d]">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {Number(rating || 0).toFixed(1)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-white/55">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {getYear(movie)}
                      </span>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => removeFromWatchlist(item.movieId)}
                        aria-label={`Remove ${title} from your watchlist`}
                        className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-red-200 transition hover:bg-red-500/10 hover:text-red-100 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
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

export default WatchlistPage;
