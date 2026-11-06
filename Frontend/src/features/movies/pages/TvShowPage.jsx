import { useCallback, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Tv,
  Sparkles,
  Flame,
  Calendar,
  Play,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import {
  getGenres,
  discoverTVShows,
  getPopularTVShows,
  getTopRatedTVShows,
} from '../service/movie.api.js';
import MovieCard, { MovieCardSkeleton } from '../../../components/common/MovieCard.jsx';
import { useFavorites } from '../../favorites/hooks/useFavorites.js';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { motion } from 'framer-motion';
import { LANGUAGE_OPTIONS } from '../languages.js';

const CATEGORIES = [
  { id: 'popular', label: 'Popular Series', icon: Flame },
  { id: 'top_rated', label: 'Top Rated Series', icon: Sparkles },
  { id: 'now_streaming', label: 'Now In Streaming', icon: Play },
  { id: 'upcoming', label: 'Upcoming', icon: Calendar },
  { id: 'cult_classics', label: 'Cult Classics', icon: Flame },
];

const CULT_CLASSIC_GENRES = '9648|10765';

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'first_air_date.desc', label: 'Newest Broadcasts' },
];

const YEARS = ['All Years', '2025', '2024', '2023', '2022', '2021', '2020'];

const TvShowPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'popular';

  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');

  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { user } = useAuth();
  const { fetchFavorites } = useFavorites();

  useEffect(() => {
    if (user) void fetchFavorites();
  }, [fetchFavorites, user]);

  // Load TV genres
  useEffect(() => {
    let active = true;
    getGenres('tv')
      .then(({ data }) => {
        if (active) setGenres(data.data.genres || []);
      })
      .catch((err) => console.error('Error fetching TV genres:', err));
    return () => {
      active = false;
    };
  }, []);

  // Sync category param
  useEffect(() => {
    if (categoryParam && categoryParam !== activeCategory) {
      setActiveCategory(categoryParam);
      setPage(1);
    }
  }, [categoryParam]);

  // Fetch TV shows based on filters
  useEffect(() => {
    let active = true;
    const isFirstPage = page === 1;
    if (isFirstPage) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const fetchDataset = async () => {
      try {
        let request;
        if (
          selectedGenre ||
          selectedYear ||
          selectedLanguage ||
          minRating ||
          sortBy !== 'popularity.desc' ||
          ['now_streaming', 'upcoming', 'cult_classics'].includes(activeCategory)
        ) {
          const today = new Date().toISOString().slice(0, 10);
          const params = {
            page,
            sort_by: activeCategory === 'upcoming' ? 'first_air_date.asc' : sortBy,
            ...(activeCategory === 'cult_classics'
              ? {
                  with_genres: selectedGenre
                    ? `${CULT_CLASSIC_GENRES},${selectedGenre}`
                    : CULT_CLASSIC_GENRES,
                  'first_air_date.lte': '1999-12-31',
                }
              : selectedGenre
                ? { with_genres: selectedGenre }
                : {}),
            ...(minRating ? { 'vote_average.gte': Number(minRating) } : {}),
            ...(selectedYear && !isNaN(selectedYear) ? { first_air_date_year: Number(selectedYear) } : {}),
            ...(selectedLanguage ? { with_original_language: selectedLanguage } : {}),
            ...(activeCategory === 'upcoming' ? { 'first_air_date.gte': today } : {}),
            ...(activeCategory === 'now_streaming'
              ? {
                  watch_region: 'US',
                  with_watch_monetization_types: 'flatrate|free|ads',
                }
              : {}),
          };
          request = discoverTVShows(params);
        } else {
          if (activeCategory === 'top_rated') {
            request = getTopRatedTVShows(page);
          } else {
            request = getPopularTVShows(page);
          }
        }

        const { data } = await request;
        if (!active) return;
        const results = data.data.results || [];
        const pagination = data.data.pagination || {};

        setShows((prev) => (isFirstPage ? results : [...prev, ...results]));
        setTotalPages(pagination.totalPages || 500);
        setTotalResults(pagination.totalResults || results.length * 10);
      } catch (err) {
        if (active) console.error('Error fetching TV shows:', err);
      } finally {
        if (active) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    fetchDataset();
    if (isFirstPage) window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      active = false;
    };
  }, [activeCategory, minRating, page, selectedGenre, selectedLanguage, selectedYear, sortBy]);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setSearchParams({ category: catId });
    setSelectedGenre('');
    setSelectedYear('');
    setSelectedLanguage('');
    setMinRating('');
    setSortBy('popularity.desc');
    setPage(1);
  };

  const handleResetFilters = () => {
    setSelectedGenre('');
    setSelectedYear('');
    setSelectedLanguage('');
    setMinRating('');
    setSortBy('popularity.desc');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    selectedGenre || selectedYear || selectedLanguage || minRating || sortBy !== 'popularity.desc'
  );

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-[#090909] text-white pt-24 md:pt-28 pb-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2.5 text-[#8b5cf6] text-xs font-bold uppercase tracking-[0.25em] mb-2">
              <Tv className="h-4 w-4" />
              <span>Broadcast & Streaming Catalog</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              TV Shows & Series
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/60 max-w-xl">
              Binge critically acclaimed series, gripping multi-season sagas, and breakout international dramas.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70">
              {totalResults ? `${totalResults.toLocaleString()} Series` : 'Global Series'}
            </span>
          </div>
        </div>

        {/* Category Preset Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleCategoryChange(id)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === id && !hasActiveFilters
                  ? 'bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] text-white shadow-[0_4px_20px_-2px_rgba(139,92,246,0.45)]'
                  : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Filter and Sort Toolbar */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Genre Dropdown */}
            <div className="relative">
              <select
                value={selectedGenre}
                onChange={(e) => {
                  setSelectedGenre(e.target.value);
                  setPage(1);
                }}
                className="appearance-none rounded-xl border border-white/10 bg-[#141416] px-4 py-2 pr-9 text-xs font-bold text-white outline-none focus:border-[#8b5cf6] cursor-pointer"
              >
                <option value="">All Genres</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/50" />
            </div>

            {/* Year Selector */}
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setPage(1);
                }}
                className="appearance-none rounded-xl border border-white/10 bg-[#141416] px-4 py-2 pr-9 text-xs font-bold text-white outline-none focus:border-[#8b5cf6] cursor-pointer"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y === 'All Years' ? '' : y}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/50" />
            </div>

            {/* Original Language */}
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by language"
                className="appearance-none rounded-xl border border-white/10 bg-[#141416] px-4 py-2 pr-9 text-xs font-bold text-white outline-none focus:border-[#8b5cf6] cursor-pointer"
              >
                <option value="">All Languages</option>
                {LANGUAGE_OPTIONS.map((language) => (
                  <option key={language.value} value={language.value}>
                    {language.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/50" />
            </div>

            {/* Minimum Rating */}
            <div className="relative">
              <select
                value={minRating}
                onChange={(e) => {
                  setMinRating(e.target.value);
                  setPage(1);
                }}
                className="appearance-none rounded-xl border border-white/10 bg-[#141416] px-4 py-2 pr-9 text-xs font-bold text-white outline-none focus:border-[#8b5cf6] cursor-pointer"
              >
                <option value="">Any Rating</option>
                <option value="8">★ 8.0+ Exceptional</option>
                <option value="7">★ 7.0+ Recommended</option>
                <option value="6">★ 6.0+ Good</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/50" />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-xs text-[#d62b70] hover:underline font-semibold"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-white/40" />
            <span className="text-xs text-white/50 font-semibold hidden sm:inline">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="appearance-none rounded-xl border border-white/10 bg-[#141416] px-4 py-2 pr-9 text-xs font-bold text-white outline-none focus:border-[#8b5cf6] cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/50" />
            </div>
          </div>
        </div>

        {/* TV Show Cards Grid (2 cols mobile -> 6 cols desktop) */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {Array.from({ length: 18 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : shows.length ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {shows.map((show) => (
                <MovieCard key={show.id} item={show} mediaType="tv" />
              ))}
            </div>

            {/* Load More Button */}
            {page < totalPages && (
              <div className="mt-12 flex justify-center">
                <button
                  type="button"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={loadingMore}
                  className="group flex items-center gap-3 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-8 py-3.5 text-sm font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  {loadingMore ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-[#8b5cf6] group-hover:bg-[#d62b70] transition-colors" />
                  )}
                  <span>{loadingMore ? 'Loading series...' : 'Load More TV Shows'}</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-white/10 bg-white/[0.02]">
            <Tv className="h-12 w-12 text-white/30 mb-3" />
            <h3 className="text-xl font-bold text-white">No Series Match Your Filter</h3>
            <p className="mt-1 text-sm text-white/50 max-w-sm">
              Try adjusting your genre, broadcast year, language, or rating filters to explore more series.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] px-6 py-2.5 text-xs font-bold text-white shadow-lg"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </motion.main>
  );
};

export default TvShowPage;
