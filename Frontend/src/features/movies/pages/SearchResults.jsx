import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchTMDB } from "../service/movie.api.js";

const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const [result, setResult] = useState({
    query: "",
    results: [],
    loading: Boolean(query),
    error: "",
  });

  useEffect(() => {
    if (!query) return undefined;

    let active = true;

    searchTMDB(query)
      .then(({ data }) => {
        if (active) {
          setResult({
            query,
            results: (data?.data?.results || []).filter(
              (item) => item.media_type === "movie" || item.media_type === "tv"
            ),
            loading: false,
            error: "",
          });
        }
      })
      .catch((error) => {
        console.error("Could not search titles.", error);
        if (active) {
          setResult({
            query,
            results: [],
            loading: false,
            error: error.response?.data?.message || "Could not search titles. Please try again.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [query]);

  const currentResult = result.query === query ? result : null;

  return (
    <main className="min-h-screen bg-primary px-5 pb-16 pt-10 text-white sm:px-8 md:px-12">
      <section className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-3xl font-black sm:text-4xl">
          {query ? `Search results for “${query}”` : "Search"}
        </h1>

        {!query ? (
          <p className="mt-6 text-white/60">Enter a title in the search bar to find movies and TV shows.</p>
        ) : !currentResult || currentResult.loading ? (
          <p className="mt-6 text-white/60" role="status">Searching titles...</p>
        ) : currentResult?.error ? (
          <p className="mt-6 text-red-400" role="alert">{currentResult.error}</p>
        ) : currentResult?.results.length ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {currentResult.results.map((item) => {
              const title = item.title || item.name;
              const releaseDate = item.release_date || item.first_air_date;
              const detailPath = item.media_type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;

              return (
                <Link
                  key={`${item.media_type}-${item.id}`}
                  to={detailPath}
                  className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-white/25"
                >
                  <div className="aspect-[2/3] bg-white/5">
                    {item.poster_path ? (
                      <img
                        src={`${POSTER_BASE_URL}${item.poster_path}`}
                        alt={`${title} poster`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-white/45">
                        Poster unavailable
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h2 className="line-clamp-2 text-sm font-bold">{title}</h2>
                    <p className="mt-1 text-xs text-white/50">
                      {item.media_type === "tv" ? "TV show" : "Movie"}
                      {releaseDate ? ` · ${releaseDate.slice(0, 4)}` : ""}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="mt-6 text-white/60">No titles matched your search.</p>
        )}
      </section>
    </main>
  );
};

export default SearchResults;
