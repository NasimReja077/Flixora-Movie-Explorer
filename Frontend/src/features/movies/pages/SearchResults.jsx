import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Film, Sparkles } from 'lucide-react';
import { searchTMDB } from '../service/movie.api.js';
import MovieCard, { MovieCardSkeleton } from '../../../components/common/MovieCard.jsx';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() || '';
  const [result, setResult] = useState({
    query: '',
    results: [],
    loading: Boolean(query),
    error: '',
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
              (item) => item.media_type === 'movie' || item.media_type === 'tv'
            ),
            loading: false,
            error: '',
          });
        }
      })
      .catch((error) => {
        console.error('Could not search titles.', error);
        if (active) {
          setResult({
            query,
            results: [],
            loading: false,
            error: error.response?.data?.message || 'Could not search titles. Please try again.',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [query]);

  const currentResult = result.query === query ? result : null;

  return (
    <main className="min-h-screen bg-[#090909] px-6 pb-20 pt-28 text-white selection:bg-[#8b5cf6] selection:text-white md:px-12">
      <section className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-3 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2">
            <span className="flex h-6 items-center gap-1.5 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-3 text-xs font-semibold uppercase tracking-wider text-[#a78bfa]">
              <Search className="h-3 w-3" />
              Search Library
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {query ? (
              <>
                Results for <span className="bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] bg-clip-text text-transparent">“{query}”</span>
              </>
            ) : (
              'Search Titles'
            )}
          </h1>

          {currentResult && !currentResult.loading && (
            <p className="text-xs sm:text-sm text-white/50">
              Found {currentResult.results.length} titles matching your query
            </p>
          )}
        </div>

        {/* Content */}
        {!query ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-24 text-center">
            <Search className="mx-auto h-12 w-12 text-white/20 mb-4" />
            <p className="text-base text-white/60">Enter a movie or series title in the search bar to find matching releases.</p>
          </div>
        ) : !currentResult || currentResult.loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {[...Array(12)].map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : currentResult?.error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-200">
            <p className="font-semibold">{currentResult.error}</p>
          </div>
        ) : currentResult?.results.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {currentResult.results.map((item) => (
              <MovieCard
                key={`${item.media_type || 'title'}-${item.id}`}
                movie={item}
                mediaType={item.media_type}
                showMediaType={true}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-24 text-center">
            <Film className="mx-auto h-12 w-12 text-white/20 mb-4" />
            <h3 className="text-lg font-bold text-white">No titles found</h3>
            <p className="mt-1 text-sm text-white/50">
              We couldn’t find any matches for “{query}”. Try checking for typos or searching with different keywords.
            </p>
          </div>
        )}
      </section>
    </main>
  );
};

export default SearchResults;
