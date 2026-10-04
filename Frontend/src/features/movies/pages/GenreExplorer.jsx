import { useEffect, useState } from "react";
import {
  discoverMovies,
  discoverTVShows,
  getGenres,
} from "../service/movie.api.js";

const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342";
const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most popular" },
  { value: "vote_average.desc", label: "Highest rated" },
  { value: "release_date.desc", label: "Newest" },
];

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Something went wrong. Please try again.";

export default function GenreExplorer() {
  const [mediaType, setMediaType] = useState("movie");
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genreSearch, setGenreSearch] = useState("");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
  const [page, setPage] = useState(1);
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalResults: 0 });
  const [genresLoading, setGenresLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [genresError, setGenresError] = useState("");
  const [resultsError, setResultsError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    getGenres(mediaType)
      .then(({ data }) => {
        if (!active) return;
        setGenres(data?.data?.genres || []);
        setSelectedGenre(null);
        setPage(1);
        setGenresError("");
      })
      .catch((error) => {
        if (active) setGenresError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setGenresLoading(false);
      });

    return () => {
      active = false;
    };
  }, [mediaType]);

  useEffect(() => {
    let active = true;
    const discover = mediaType === "movie" ? discoverMovies : discoverTVShows;
    const selectedSort = mediaType === "tv" && sortBy.startsWith("release_date.")
      ? sortBy.replace("release_date.", "first_air_date.")
      : sortBy;
    const params = { page, sort_by: selectedSort };
    const request = discover({
      ...params,
      ...(selectedGenre ? { with_genres: selectedGenre } : {}),
    });

    request
      .then(({ data }) => {
        if (!active) return;
        setResults(data?.data?.results || []);
        setPagination(
          data?.data?.pagination || { page: 1, totalPages: 1, totalResults: 0 }
        );
        setResultsError("");
      })
      .catch((error) => {
        if (active) {
          setResults([]);
          setResultsError(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (active) setResultsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [mediaType, page, retryCount, selectedGenre, sortBy]);

  const visibleGenres = genres.filter((genre) =>
    genre.name.toLowerCase().includes(genreSearch.trim().toLowerCase())
  );
  const selectedGenreName = genres.find((genre) => genre.id === selectedGenre)?.name;

  const chooseGenre = (genreId) => {
    setResultsLoading(true);
    setSelectedGenre(genreId);
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <a href="/" className="text-2xl font-extrabold tracking-tight text-red-500">
            FLIXORA
          </a>
          <span className="hidden text-sm text-white/50 sm:block">Discover something worth watching</span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 sm:pt-16">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-red-400">
              Your next favorite
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Browse by genre</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
              Pick a genre and explore movies or series curated just for that mood.
            </p>
          </div>

          <div className="flex w-fit rounded-lg border border-white/10 bg-white/[0.04] p-1" aria-label="Choose what to browse">
            {[
              { value: "movie", label: "Movies" },
              { value: "tv", label: "TV Shows" },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => {
                  if (mediaType !== type.value) {
                    setGenresLoading(true);
                    setResultsLoading(true);
                    setSelectedGenre(null);
                    setPage(1);
                    setMediaType(type.value);
                  }
                }}
                className={`rounded-md px-4 py-2 text-sm font-bold transition ${
                  mediaType === type.value
                    ? "bg-red-600 text-white"
                    : "text-white/55 hover:text-white"
                }`}
                aria-pressed={mediaType === type.value}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <section className="mb-10 rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-7" aria-label="Genre filters">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-extrabold">Choose a genre</h2>
              <p className="mt-1 text-sm text-white/45">Showing {selectedGenreName || "all genres"}</p>
            </div>
            <label className="w-full sm:max-w-xs">
              <span className="sr-only">Search genres</span>
              <input
                type="search"
                value={genreSearch}
                onChange={(event) => setGenreSearch(event.target.value)}
                placeholder="Find a genre..."
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500/70"
              />
            </label>
          </div>

          {genresError ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200" role="alert">
              Could not load genres: {genresError}
            </div>
          ) : genresLoading ? (
            <p className="py-4 text-sm text-white/50" role="status">Loading genres...</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => chooseGenre(null)}
                aria-pressed={selectedGenre === null}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  selectedGenre === null
                    ? "border-red-500 bg-red-600 text-white"
                    : "border-white/10 bg-black/20 text-white/65 hover:border-white/30 hover:text-white"
                }`}
              >
                All
              </button>
              {visibleGenres.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => chooseGenre(genre.id)}
                  aria-pressed={selectedGenre === genre.id}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                    selectedGenre === genre.id
                      ? "border-red-500 bg-red-600 text-white"
                      : "border-white/10 bg-black/20 text-white/65 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {genre.name}
                </button>
              ))}
              {!visibleGenres.length && (
                <p className="py-3 text-sm text-white/45">No genres match “{genreSearch}”.</p>
              )}
            </div>
          )}
        </section>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">
              {selectedGenreName || (mediaType === "movie" ? "Popular movies" : "Popular TV shows")}
            </h2>
            {!resultsError && (
              <p className="mt-1 text-sm text-white/45">
                {pagination.totalResults.toLocaleString()} titles to explore
              </p>
            )}
          </div>
          <label className="flex items-center gap-3 text-sm text-white/55">
            Sort by
            <select
              value={sortBy}
              onChange={(event) => {
                setResultsLoading(true);
                setSortBy(event.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-white/10 bg-[#151515] px-3 py-2 text-white outline-none focus:border-red-500/70"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        {resultsError ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200" role="alert">
            <p>Could not load titles: {resultsError}</p>
            <button
              type="button"
              onClick={() => {
                setResultsLoading(true);
                setResultsError("");
                setRetryCount((count) => count + 1);
              }}
              className="mt-3 rounded-lg border border-red-200/30 px-3 py-1.5 font-bold hover:bg-red-200/10"
            >
              Retry
            </button>
          </div>
        ) : resultsLoading ? (
          <p className="py-14 text-center text-sm text-white/50" role="status">Finding titles for you...</p>
        ) : results.length ? (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {results.map((item) => {
                const title = item.title || item.name;
                const releaseDate = item.release_date || item.first_air_date;
                const year = releaseDate ? releaseDate.slice(0, 4) : "Year unknown";

                return (
                  <article key={item.id} className="group overflow-hidden rounded-xl border border-white/[0.07] bg-[#121212] transition hover:-translate-y-1 hover:border-white/20">
                    <div className="relative aspect-[2/3] overflow-hidden bg-white/[0.04]">
                      {item.poster_path ? (
                        <img
                          src={`${POSTER_BASE_URL}${item.poster_path}`}
                          alt={`${title} poster`}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center p-4 text-center text-sm font-bold text-white/35">
                          Poster unavailable
                        </div>
                      )}
                      <span className="absolute right-2 top-2 rounded-md bg-black/75 px-2 py-1 text-xs font-bold text-amber-300">
                        ★ {Number(item.vote_average || 0).toFixed(1)}
                      </span>
                    </div>
                    <div className="p-3.5">
                      <h3 className="line-clamp-2 min-h-10 text-sm font-extrabold leading-5">{title}</h3>
                      <p className="mt-1 text-xs text-white/45">{year}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <nav className="mt-10 flex items-center justify-center gap-5" aria-label="Results pagination">
              <button
                type="button"
                onClick={() => {
                  setResultsLoading(true);
                  setPage((currentPage) => Math.max(1, currentPage - 1));
                }}
                disabled={page <= 1}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-bold transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-35"
              >
                Previous
              </button>
              <span className="text-sm text-white/55">Page {pagination.page} of {pagination.totalPages}</span>
              <button
                type="button"
                onClick={() => {
                  setResultsLoading(true);
                  setPage((currentPage) => Math.min(pagination.totalPages, currentPage + 1));
                }}
                disabled={page >= pagination.totalPages}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-bold transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-35"
              >
                Next
              </button>
            </nav>
          </>
        ) : (
          <p className="rounded-xl border border-white/10 bg-white/[0.03] py-14 text-center text-sm text-white/50">
            No titles found for this selection.
          </p>
        )}
      </section>
    </main>
  );
}
