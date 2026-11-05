import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  Film,
  Tv,
  ArrowRight,
  RefreshCw,
  Search,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  discoverMovies,
  discoverTVShows,
  getGenres,
} from '../service/movie.api.js';
import MovieCard, { MovieCardSkeleton } from '../../../components/common/MovieCard.jsx';

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'release_date.desc', label: 'Newest Releases' },
  { value: 'revenue.desc', label: 'Top Box Office' },
];

const GENRE_METADATA = {
  Action: {
    tagline: 'High-octane spectacles, thrilling combat, and relentless adrenaline.',
    backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
    color: 'from-amber-600/40 via-red-600/30 to-purple-900/40',
  },
  Adventure: {
    tagline: 'Epic expeditions into uncharted territories and mythical quests.',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    color: 'from-emerald-600/40 via-teal-600/30 to-blue-950/40',
  },
  Animation: {
    tagline: 'Boundless imagination, vibrant artistry, and heartwarming wonder.',
    backdrop: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
    color: 'from-pink-600/40 via-purple-600/30 to-indigo-950/40',
  },
  Comedy: {
    tagline: 'Witty banter, laugh-out-loud escapades, and feel-good stories.',
    backdrop: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=1200&auto=format&fit=crop',
    color: 'from-yellow-600/40 via-amber-600/30 to-red-950/40',
  },
  Crime: {
    tagline: 'Tense heists, dark underworld syndicates, and forensic investigations.',
    backdrop: 'https://images.unsplash.com/photo-1453873531674-2151bcd01707?q=80&w=1200&auto=format&fit=crop',
    color: 'from-stone-700/40 via-zinc-800/30 to-black/60',
  },
  Documentary: {
    tagline: 'Gripping real-world accounts, human resilience, and profound truths.',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
    color: 'from-cyan-700/40 via-sky-800/30 to-blue-950/40',
  },
  Drama: {
    tagline: 'Deep emotional resonance, complex human conflicts, and masterclass acting.',
    backdrop: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format&fit=crop',
    color: 'from-purple-800/40 via-indigo-900/30 to-black/60',
  },
  Family: {
    tagline: 'Wholesome journeys, enchanting tales, and timeless family favorites.',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
    color: 'from-blue-600/40 via-cyan-600/30 to-teal-950/40',
  },
  Fantasy: {
    tagline: 'Mythical realms, ancient sorcery, and legends of the extraordinary.',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    color: 'from-violet-700/40 via-fuchsia-800/30 to-indigo-950/40',
  },
  History: {
    tagline: 'Monumental epochs, historical triumphs, and empires that shaped our world.',
    backdrop: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1200&auto=format&fit=crop',
    color: 'from-amber-800/40 via-yellow-900/30 to-stone-950/40',
  },
  Horror: {
    tagline: 'Bone-chilling suspense, psychological nightmare, and supernatural thrills.',
    backdrop: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=1200&auto=format&fit=crop',
    color: 'from-red-950/60 via-zinc-900/40 to-black/70',
  },
  Music: {
    tagline: 'Symphonic masterpieces, legendary concertos, and iconic sonic legends.',
    backdrop: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
    color: 'from-fuchsia-700/40 via-rose-700/30 to-purple-950/40',
  },
  Mystery: {
    tagline: 'Mind-bending whodunits, hidden clues, and jaw-dropping revelations.',
    backdrop: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=1200&auto=format&fit=crop',
    color: 'from-indigo-900/40 via-slate-800/30 to-black/60',
  },
  Romance: {
    tagline: 'Intoxicating passion, star-crossed encounters, and tender love stories.',
    backdrop: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format&fit=crop',
    color: 'from-pink-700/40 via-rose-800/30 to-red-950/40',
  },
  'Science Fiction': {
    tagline: 'Interstellar voyages, cyberpunk futures, and AI singularity.',
    backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    color: 'from-cyan-600/40 via-blue-700/30 to-violet-950/40',
  },
  'Sci-Fi & Fantasy': {
    tagline: 'Futuristic galaxies collided with ancient mythic realms.',
    backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    color: 'from-cyan-600/40 via-purple-700/30 to-violet-950/40',
  },
  Thriller: {
    tagline: 'Edge-of-your-seat dread, cat-and-mouse tension, and high stakes.',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    color: 'from-slate-900/40 via-red-950/30 to-black/60',
  },
  War: {
    tagline: 'Courage under fire, devastating battlefronts, and heroic sacrifice.',
    backdrop: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1200&auto=format&fit=crop',
    color: 'from-stone-800/40 via-amber-950/30 to-zinc-950/40',
  },
  'War & Politics': {
    tagline: 'Epic tactical clashes, political conspiracies, and global intrigue.',
    backdrop: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1200&auto=format&fit=crop',
    color: 'from-stone-800/40 via-amber-950/30 to-zinc-950/40',
  },
  Western: {
    tagline: 'Dusty frontier towns, lone bounty hunters, and classic shootouts.',
    backdrop: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?q=80&w=1200&auto=format&fit=crop',
    color: 'from-amber-900/40 via-orange-950/30 to-stone-950/40',
  },
};

const DEFAULT_METADATA = {
  tagline: 'Immerse yourself in top-tier cinematic storytelling curated for this genre.',
  backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop',
  color: 'from-[#8b5cf6]/30 via-[#d62b70]/20 to-black/60',
};

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong. Please try again.';

export default function GenreExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialGenreParam = searchParams.get('genre');
  const initialTypeParam = searchParams.get('type') || 'movie';

  const [mediaType, setMediaType] = useState(initialTypeParam);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(
    initialGenreParam ? Number(initialGenreParam) : null
  );
  const [genreSearch, setGenreSearch] = useState('');
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
  const [page, setPage] = useState(1);
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalResults: 0 });
  const [genresLoading, setGenresLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [genresError, setGenresError] = useState('');
  const [resultsError, setResultsError] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch genres
  useEffect(() => {
    let active = true;
    setGenresLoading(true);

    getGenres(mediaType)
      .then(({ data }) => {
        if (!active) return;
        const fetchedGenres = data?.data?.genres || [];
        setGenres(fetchedGenres);
        setGenresError('');
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

  // Fetch titles when genre or filters change
  useEffect(() => {
    if (!selectedGenre) {
      setResults([]);
      return;
    }

    let active = true;
    if (page === 1) {
      setResultsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    const discover = mediaType === 'movie' ? discoverMovies : discoverTVShows;
    const selectedSort =
      mediaType === 'tv' && sortBy.startsWith('release_date.')
        ? sortBy.replace('release_date.', 'first_air_date.')
        : sortBy;

    const params = {
      page,
      sort_by: selectedSort,
      with_genres: selectedGenre,
    };

    discover(params)
      .then(({ data }) => {
        if (!active) return;
        const newResults = data?.data?.results || [];
        setResults((prev) => (page === 1 ? newResults : [...prev, ...newResults]));
        setPagination(
          data?.data?.pagination || { page: 1, totalPages: 1, totalResults: 0 }
        );
        setResultsError('');
      })
      .catch((error) => {
        if (active) {
          if (page === 1) setResults([]);
          setResultsError(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (active) {
          setResultsLoading(false);
          setIsLoadingMore(false);
        }
      });

    return () => {
      active = false;
    };
  }, [mediaType, page, selectedGenre, sortBy]);

  const selectedGenreObj = useMemo(
    () => genres.find((g) => g.id === selectedGenre),
    [genres, selectedGenre]
  );

  const selectedGenreMeta = useMemo(() => {
    if (!selectedGenreObj) return DEFAULT_METADATA;
    return GENRE_METADATA[selectedGenreObj.name] || DEFAULT_METADATA;
  }, [selectedGenreObj]);

  const visibleGenres = useMemo(() => {
    if (!genreSearch.trim()) return genres;
    return genres.filter((genre) =>
      genre.name.toLowerCase().includes(genreSearch.trim().toLowerCase())
    );
  }, [genres, genreSearch]);

  const chooseGenre = (genreId) => {
    setSelectedGenre(genreId);
    setPage(1);
    if (genreId) {
      setSearchParams({ genre: String(genreId), type: mediaType });
    } else {
      setSearchParams({ type: mediaType });
    }
  };

  const handleMediaTypeChange = (type) => {
    if (mediaType === type) return;
    setMediaType(type);
    setSelectedGenre(null);
    setPage(1);
    setSearchParams({ type });
  };

  return (
    <main className="min-h-screen bg-[#090909] text-white selection:bg-[#8b5cf6] selection:text-white">
      {/* 1. Dynamic Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10 pt-28 pb-16 md:pt-36 md:pb-20">
        {/* Ambient lighting glows */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#8b5cf6]/20 blur-[140px]" />
        <div className="pointer-events-none absolute top-10 right-0 h-96 w-96 rounded-full bg-[#d62b70]/15 blur-[140px]" />

        {/* Dynamic backdrop image when genre is active */}
        {selectedGenre && (
          <div className="absolute inset-0 z-0 opacity-25">
            <img
              src={selectedGenreMeta.backdrop}
              alt=""
              className="h-full w-full object-cover object-center blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/70 to-[#090909]/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#090909] via-transparent to-[#090909]" />
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12">
          {/* Breadcrumb / Mode toggle */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 items-center gap-1.5 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-3 text-xs font-semibold uppercase tracking-wider text-[#a78bfa]">
                <Compass className="h-3 w-3" />
                Genre Explorer
              </span>
              {selectedGenreObj && (
                <>
                  <span className="text-white/30">/</span>
                  <span className="text-sm font-medium text-white/70">{selectedGenreObj.name}</span>
                </>
              )}
            </div>

            {/* Media Type Switcher: Movies / TV */}
            <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md">
              <button
                type="button"
                onClick={() => handleMediaTypeChange('movie')}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  mediaType === 'movie'
                    ? 'bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Film className="h-3.5 w-3.5" />
                Movies
              </button>
              <button
                type="button"
                onClick={() => handleMediaTypeChange('tv')}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  mediaType === 'tv'
                    ? 'bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Tv className="h-3.5 w-3.5" />
                TV Shows
              </button>
            </div>
          </div>

          {/* Hero Titles */}
          <div className="max-w-3xl">
            {selectedGenreObj ? (
              <motion.div
                key={selectedGenreObj.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white capitalize">
                  {selectedGenreObj.name}
                </h1>
                <p className="mt-4 text-base sm:text-lg leading-relaxed text-white/70">
                  {selectedGenreMeta.tagline}
                </p>
                <div className="mt-5 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => chooseGenre(null)}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#a78bfa] transition hover:text-white"
                  >
                    ← View All Genres Vault
                  </button>
                  <span className="text-white/20">•</span>
                  <span className="text-xs font-medium text-white/50">
                    {pagination.totalResults.toLocaleString()} Titles Available
                  </span>
                </div>
              </motion.div>
            ) : (
              <div>
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
                  Discover by Genre
                </h1>
                <p className="mt-4 text-base sm:text-lg leading-relaxed text-white/70">
                  Dive into handcrafted sonic and visual universes. Pick any genre pill or explore our curated discovery vault below.
                </p>
              </div>
            )}
          </div>

          {/* Horizontal Selectable Genre Pills */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                Filter by Genre
              </span>
              {/* Optional Search */}
              <div className="relative w-48 sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                <input
                  type="text"
                  value={genreSearch}
                  onChange={(e) => setGenreSearch(e.target.value)}
                  placeholder="Filter genres..."
                  className="w-full rounded-full border border-white/10 bg-white/5 pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 outline-none transition focus:border-[#8b5cf6]/60 focus:bg-white/10"
                />
              </div>
            </div>

            {genresLoading ? (
              <div className="flex gap-2 overflow-x-auto py-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-9 w-24 rounded-full bg-white/5 animate-pulse shrink-0" />
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
                <button
                  type="button"
                  onClick={() => chooseGenre(null)}
                  className={`shrink-0 rounded-full px-5 py-2 text-xs font-bold tracking-wide transition active:scale-95 ${
                    selectedGenre === null
                      ? 'bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] text-white shadow-lg shadow-[#8b5cf6]/20'
                      : 'border border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  All Genres
                </button>
                {visibleGenres.map((genre) => {
                  const isSelected = selectedGenre === genre.id;
                  return (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => chooseGenre(genre.id)}
                      className={`shrink-0 rounded-full px-5 py-2 text-xs font-bold tracking-wide transition active:scale-95 ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] text-white shadow-lg shadow-[#8b5cf6]/20'
                          : 'border border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {genre.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Main Content Area */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-12">
        {/* CASE A: No Genre Selected -> Show Curated Discovery Grid of All Genres */}
        {selectedGenre === null ? (
          <div>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Curated Genre Vault
                </h2>
                <p className="mt-1 text-sm text-white/55">
                  Select a category to reveal all critically-acclaimed {mediaType === 'movie' ? 'movies' : 'shows'} in that realm.
                </p>
              </div>
            </div>

            {genresLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-56 rounded-2xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {visibleGenres.map((genre) => {
                  const meta = GENRE_METADATA[genre.name] || DEFAULT_METADATA;
                  return (
                    <motion.div
                      key={genre.id}
                      whileHover={{ y: -6, scale: 1.02 }}
                      transition={{ duration: 0.25 }}
                      onClick={() => chooseGenre(genre.id)}
                      className="group relative h-60 cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#121212] transition shadow-xl hover:border-[#8b5cf6]/60 hover:shadow-2xl hover:shadow-[#8b5cf6]/10"
                    >
                      {/* Backdrop image */}
                      <img
                        src={meta.backdrop}
                        alt={genre.name}
                        loading="lazy"
                        className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-110"
                      />

                      {/* Color Scrim */}
                      <div className={`absolute inset-0 bg-gradient-to-t ${meta.color} mix-blend-multiply opacity-80`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col justify-end p-5">
                        <span className="mb-1 text-[11px] font-bold uppercase tracking-widest text-[#a78bfa]">
                          {mediaType === 'movie' ? 'Movie Realm' : 'TV Realm'}
                        </span>
                        <h3 className="text-2xl font-black text-white group-hover:text-[#a78bfa] transition">
                          {genre.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/70">
                          {meta.tagline}
                        </p>

                        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                          <span className="text-xs font-semibold text-white/50 group-hover:text-white transition">
                            Explore Titles
                          </span>
                          <ArrowRight className="h-4 w-4 text-[#8b5cf6] transition group-hover:translate-x-1" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* CASE B: Genre Selected -> Grid of Filtered MovieCards */
          <div>
            {/* Filter and Sort Toolbar */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                  <span>{selectedGenreObj?.name} {mediaType === 'movie' ? 'Movies' : 'Series'}</span>
                  {!resultsLoading && (
                    <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-bold text-white/70">
                      {pagination.totalResults.toLocaleString()}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-white/50 mt-1">
                  Sorted by {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
                </p>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Sort By:</span>
                </div>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
                    className="appearance-none rounded-xl border border-white/10 bg-[#151515] px-4 py-2 pr-9 text-xs font-semibold text-white outline-none transition hover:border-white/20 focus:border-[#8b5cf6]"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#151515] text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/50" />
                </div>
              </div>
            </div>

            {/* Results Grid */}
            {resultsError ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-200">
                <p className="font-semibold">{resultsError}</p>
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-300/30 px-5 py-2 text-xs font-bold text-white hover:bg-red-500/20"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Retry
                </button>
              </div>
            ) : resultsLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {[...Array(18)].map((_, i) => (
                  <MovieCardSkeleton key={i} />
                ))}
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {results.map((item) => (
                    <MovieCard
                      key={`${mediaType}-${item.id}`}
                      movie={item}
                      mediaType={mediaType}
                    />
                  ))}
                </div>

                {/* Pagination / Load More */}
                <div className="mt-14 flex flex-col items-center justify-center gap-4">
                  {page < pagination.totalPages && (
                    <button
                      type="button"
                      disabled={isLoadingMore}
                      onClick={() => setPage((prev) => prev + 1)}
                      className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-3 text-sm font-bold text-white backdrop-blur-xl transition hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/10 active:scale-95 disabled:opacity-50"
                    >
                      {isLoadingMore ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Loading More Titles...</span>
                        </>
                      ) : (
                        <>
                          <span>Load More {selectedGenreObj?.name} Titles</span>
                          <ArrowRight className="h-4 w-4 text-[#8b5cf6] transition group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  )}
                  <p className="text-xs text-white/40">
                    Showing {results.length} of {pagination.totalResults.toLocaleString()} titles
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-20 text-center">
                <Film className="mx-auto h-12 w-12 text-white/20 mb-4" />
                <h3 className="text-lg font-bold text-white">No titles found</h3>
                <p className="mt-1 text-sm text-white/50">
                  We could not find any titles matching this genre and sort selection.
                </p>
                <button
                  type="button"
                  onClick={() => chooseGenre(null)}
                  className="mt-6 rounded-full border border-white/15 bg-white/5 px-6 py-2 text-xs font-bold text-white hover:bg-white/10"
                >
                  View All Genres
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
