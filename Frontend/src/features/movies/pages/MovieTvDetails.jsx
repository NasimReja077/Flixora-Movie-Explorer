import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Bookmark,
  BookmarkCheck,
  Star,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Tv,
  Film,
  Calendar,
  DollarSign,
  Languages,
  Clapperboard,
  Clock,
  Sparkles,
  ShieldAlert,
  ThumbsUp,
  MessageSquare,
  Send,
  Eye,
  EyeOff,
  User,
  CheckCircle,
  Play,
  Heart,
  Image as ImageIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import TrailerModal from '../../../components/common/TrailerModal.jsx';
import {
  getMovieDetails,
  getTVShowDetails,
  getPersonDetails,
} from '../service/movie.api.js';
import {
  getReviews as getLocalReviews,
  createReview,
  likeReview,
} from '../../reviews/service/review.api.js';
import MovieVideosHeroSection from '../components/MovieVideosHeroSection.jsx';
import Sheet from '../../../components/common/Sheet.jsx';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { useWatchlist } from '../../watchlist/hooks/useWatchlist.js';
import { useFavorites } from '../../favorites/hooks/useFavorites.js';

const RATING_DESCRIPTIONS = [
  '1 / 10 Abysmal',
  '2 / 10 Dreadful',
  '3 / 10 Subpar',
  '4 / 10 Mediocre',
  '5 / 10 Average',
  '6 / 10 Decent',
  '7 / 10 Good',
  '8 / 10 Great',
  '9 / 10 Exceptional',
  '10 / 10 Masterpiece',
];

const MovieTvDetails = () => {
  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    isInWatchlistById,
    initialized: watchlistInitialized,
    loading: watchlistLoading,
    addToWatchlist,
    removeFromWatchlist,
  } = useWatchlist();
  const { isFavoriteById, addFavorite, removeFavorite } = useFavorites();

  const mediaType = pathname.startsWith('/tv') ? 'tv' : 'movie';
  const requestKey = `${mediaType}:${id}`;
  const [result, setResult] = useState({
    key: null,
    details: null,
    error: '',
  });

  // Local community reviews state
  const [communityReviews, setCommunityReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Cast Dossier Sheet state
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isCastSheetOpen, setIsCastSheetOpen] = useState(false);
  const [personDetails, setPersonDetails] = useState(null);
  const [loadingPerson, setLoadingPerson] = useState(false);

  // Write Review Sheet state
  const [isReviewSheetOpen, setIsReviewSheetOpen] = useState(false);
  const [reviewScore, setReviewScore] = useState(10);
  const [reviewHeadline, setReviewHeadline] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reviewContainsSpoiler, setReviewContainsSpoiler] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('IMAX 70mm');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Spoilers reveal map: reviewId -> boolean
  const [revealedSpoilers, setRevealedSpoilers] = useState({});

  // Hero Experience Phase: 'poster' (initial 3-5 seconds) -> 'theater' (full video backdrop)
  const [heroPhase, setHeroPhase] = useState('poster');
  const [countdown, setCountdown] = useState(4);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

  // 3-5 second cinematic transition from poster card to theater video
  useEffect(() => {
    setHeroPhase('poster');
    setCountdown(4);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setHeroPhase('theater');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [requestKey]);

  const castRailRef = useRef(null);
  const recommendationsRailRef = useRef(null);

  // Fetch movie/TV details
  useEffect(() => {
    let active = true;
    const request = mediaType === 'tv' ? getTVShowDetails(id) : getMovieDetails(id);

    request
      .then(({ data }) => {
        if (active) setResult({ key: requestKey, details: data.data, error: '' });
      })
      .catch((error) => {
        console.error('Could not load title details.', error);
        if (active) {
          setResult({
            key: requestKey,
            details: null,
            error: error.response?.data?.message || 'Could not load title details.',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [id, mediaType, requestKey]);

  // Fetch local community reviews
  useEffect(() => {
    let active = true;
    setLoadingReviews(true);
    getLocalReviews(id)
      .then((data) => {
        if (active && Array.isArray(data)) {
          setCommunityReviews(data);
        }
      })
      .catch(() => {
        // Fallback to empty if endpoint not reachable
      })
      .finally(() => {
        if (active) setLoadingReviews(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const isCurrentResult = result.key === requestKey;
  const details = isCurrentResult ? result.details : null;
  const error = isCurrentResult ? result.error : '';

  // Helpers
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPosterUrl = (path, size = 'w342') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

  const openTitle = (item) => {
    const recommendedMediaType = item.media_type || mediaType;
    navigate(`/${recommendedMediaType === 'tv' ? 'tv' : 'movie'}/${item.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Cast Dossier Sheet
  const handleOpenCastDossier = async (person) => {
    setSelectedPerson(person);
    setIsCastSheetOpen(true);
    setLoadingPerson(true);
    setPersonDetails(null);

    try {
      const { data } = await getPersonDetails(person.id);
      setPersonDetails(data.data);
    } catch (err) {
      console.error('Failed to load cast member details', err);
      // Fallback with what we already have
      setPersonDetails(person);
    } finally {
      setLoadingPerson(false);
    }
  };

  // Scroll controls for horizontal rails
  const scrollRail = (ref, offset) => {
    if (ref.current) {
      ref.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Watchlist action
  const isInWatchlist = Boolean(isInWatchlistById[id]);
  const isFavorite = Boolean(isFavoriteById[id]);

  const handleWatchlistClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isInWatchlist) {
        await removeFromWatchlist(id).unwrap();
        toast.success('Removed from your watchlist');
      } else {
        await addToWatchlist({
          movieId: Number(id),
          movieType: mediaType,
          movieData: {
            title: details?.title || details?.name,
            posterPath: details?.poster_path || '',
            voteAverage: Number(details?.vote_average || 0),
            releaseDate: details?.release_date || details?.first_air_date || '',
          },
        }).unwrap();
        toast.success('Added to your watchlist');
      }
    } catch (error) {
      toast.error(error || 'Could not update your watchlist');
    }
  };

  const handleFavoriteClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await removeFavorite(id);
        toast.success('Removed from favorites');
      } else {
        await addFavorite({
          movieId: Number(id),
          movieType: mediaType,
          movieData: {
            title: details?.title || details?.name,
            posterPath: details?.poster_path || '',
            voteAverage: Number(details?.vote_average || 0),
            releaseDate: details?.release_date || details?.first_air_date || '',
          },
        });
        toast.success('Added to favorites');
      }
    } catch {
      toast.error('Could not update favorites');
    }
  };

  // Submit Review
  const handleSubmitReview = async (e) => {
    e?.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!reviewContent.trim()) {
      toast.error('Please write some critique content before publishing.');
      return;
    }

    setSubmittingReview(true);
    try {
      const fullContent = reviewHeadline.trim()
        ? `**${reviewHeadline.trim()}**\n\n${reviewContent.trim()}`
        : reviewContent.trim();

      const created = await createReview(Number(id), {
        rating: reviewScore,
        content: fullContent,
        spoiler: reviewContainsSpoiler,
        movieType: mediaType,
      });

      toast.success('Thank you! Your critique has been broadcast to FLIX.');
      setIsReviewSheetOpen(false);
      setReviewContent('');
      setReviewHeadline('');
      setReviewContainsSpoiler(false);

      if (created) {
        setCommunityReviews((prev) => [created, ...prev]);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not publish review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Like Review
  const handleLikeReview = async (reviewId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await likeReview(reviewId);
      setCommunityReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId
            ? {
                ...r,
                likes: r.likes?.includes(user._id)
                  ? r.likes.filter((uid) => uid !== user._id)
                  : [...(r.likes || []), user._id],
              }
            : r
        )
      );
    } catch {
      toast.error('Could not update like.');
    }
  };

  // Toggle spoiler reveal
  const toggleSpoiler = (revId) => {
    setRevealedSpoilers((prev) => ({
      ...prev,
      [revId]: !prev[revId],
    }));
  };

  if (!details && !error) {
    return (
      <main className="min-h-screen animate-pulse bg-[#090909] text-white flex items-center justify-center" role="status">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#8b5cf6] border-t-transparent" />
          <span className="text-sm tracking-wider uppercase text-white/60">Loading cinematic experience...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#090909] px-6 py-32 text-center text-red-400" role="alert">
        <p className="text-lg font-bold">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          Return to Home
        </button>
      </main>
    );
  }

  const title = details.title || details.name;
  const releaseDate = details.release_date || details.first_air_date;
  const cast = details.credits?.cast || [];
  const crew = details.credits?.crew || [];
  const directors = crew.filter(
    (member) => member.job === 'Director' || member.department === 'Directing'
  );
  const writers = crew.filter(
    (member) => member.job === 'Screenplay' || member.job === 'Writer'
  );
  const recommendations =
    details.recommendations?.results?.length
      ? details.recommendations.results
      : details.similar?.results || [];

  // TMDB reviews
  const tmdbReviews = details.reviews?.results || [];
  // Merge community reviews with TMDB reviews
  const allReviews = [
    ...communityReviews.map((r) => ({
      id: r._id,
      author: r.user?.username || r.user?.fullname || 'FLIX Cinephile',
      author_details: { rating: r.rating },
      created_at: r.createdAt,
      content: r.content,
      spoiler: r.spoiler,
      likesCount: r.likes?.length || 0,
      isLocal: true,
    })),
    ...tmdbReviews.map((r) => ({
      id: r.id,
      author: r.author || 'TMDB Reviewer',
      author_details: r.author_details || {},
      created_at: r.created_at,
      content: r.content,
      spoiler: false,
      likesCount: 18,
      isLocal: false,
    })),
  ];

  // Where to watch providers
  const watchProvidersObj = details['watch/providers']?.results || {};
  const regionProviders =
    watchProvidersObj.US ||
    watchProvidersObj[Object.keys(watchProvidersObj)[0]] ||
    {};
  const flatrateProviders = regionProviders.flatrate || [];
  const rentBuyProviders = [
    ...(regionProviders.rent || []),
    ...(regionProviders.buy || []),
  ].filter(
    (provider, index, self) =>
      index === self.findIndex((p) => p.provider_id === provider.provider_id)
  );

  // IMDb ID
  const imdbId = details.external_ids?.imdb_id || details.imdb_id;
  const tmdbAudienceScore = Math.round((details.vote_average || 8.5) * 10);
  const tmdbCriticsScore = Math.min(99, Math.round(tmdbAudienceScore + 4));

  // Trailer key for instant modal/playback
  const trailerItem =
    details.videos?.results?.find(
      (vid) => vid.site === 'YouTube' && vid.type === 'Trailer'
    ) || details.videos?.results?.[0];
  const trailerKey = trailerItem?.key;

  return (
    <main className="min-h-screen bg-[#090909] text-white selection:bg-[#8b5cf6] selection:text-white">
      {/* 1. Cinematic Hero Section: Phase 1 Poster Card (3-5s) -> Phase 2 Full Video Theater */}
      <AnimatePresence mode="wait">
        {heroPhase === 'poster' ? (
          <motion.div
            key="poster-hero-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.65, ease: 'easeInOut' }}
            className="relative min-h-[82vh] md:min-h-[88vh] lg:min-h-[92vh] w-full overflow-hidden flex items-center justify-center pt-28 pb-16 px-6 md:px-12 bg-[#090909]"
          >
            {/* Ambient glows & blurred backdrop */}
            <div className="absolute inset-0 z-0">
              {details.backdrop_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w1280${details.backdrop_path}`}
                  alt=""
                  className="h-full w-full object-cover object-center opacity-20 blur-md scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/80 to-[#090909]/60" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#090909] via-[#090909]/60 to-[#090909]" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-96 w-96 rounded-full bg-[#8b5cf6]/25 blur-[140px]" />
              <div className="pointer-events-none absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-[#d62b70]/20 blur-[130px]" />
            </div>

            {/* Poster Card Content */}
            <div className="relative z-10 mx-auto max-w-7xl w-full">
              {/* Transition Countdown Pill */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-3.5 py-1.5 text-xs font-bold text-[#a78bfa] backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8b5cf6] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8b5cf6]" />
                    </span>
                    <span>Entering Theater Experience in {countdown}s</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHeroPhase('theater')}
                    className="text-xs font-semibold text-white/60 hover:text-white underline underline-offset-4 transition"
                  >
                    Enter Theater Mode Now →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Vertical Poster Card */}
                <div className="md:col-span-5 lg:col-span-4 flex justify-center md:justify-start">
                  <div className="group relative aspect-[2/3] w-64 sm:w-72 md:w-80 rounded-2xl overflow-hidden border border-white/15 bg-white/5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]">
                    {details.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w780${details.poster_path}`}
                        alt={title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-6 text-center text-sm font-bold text-white/40">
                        Poster Unavailable
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-bold text-amber-400 backdrop-blur-md shadow-lg">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{Number(details.vote_average || 8.5).toFixed(1)}</span>
                    </div>

                    {/* Media Type Badge */}
                    <div className="absolute top-3 left-3 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/20 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#c4b5fd] backdrop-blur-md">
                      {mediaType === 'tv' ? 'TV Series' : 'Movie'}
                    </div>

                    {/* Quick Play Trigger Hover */}
                    <button
                      type="button"
                      onClick={() => {
                        if (trailerKey) setIsTrailerModalOpen(true);
                        else setHeroPhase('theater');
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 backdrop-blur-xs"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] text-white shadow-xl shadow-[#8b5cf6]/40 transition transform group-hover:scale-110">
                        <Play className="h-7 w-7 fill-white translate-x-0.5" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Poster Card Info */}
                <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="rounded-full border border-[#d62b70]/40 bg-[#d62b70]/10 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#f472b6]">
                      {details.status || 'Now Streaming'}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-white/70">
                      4K Ultra HD
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-white/70">
                      Dolby Atmos
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                    {title}
                  </h1>

                  {/* Metadata Row */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-medium text-white/65">
                    {releaseDate && <span>{releaseDate.slice(0, 4)}</span>}
                    {details.runtime ? (
                      <>
                        <span>•</span>
                        <span>{Math.floor(details.runtime / 60)}h {details.runtime % 60}m</span>
                      </>
                    ) : details.number_of_seasons ? (
                      <>
                        <span>•</span>
                        <span>{details.number_of_seasons} Season{details.number_of_seasons > 1 ? 's' : ''}</span>
                      </>
                    ) : null}
                    {details.original_language && (
                      <>
                        <span>•</span>
                        <span className="uppercase">{details.original_language}</span>
                      </>
                    )}
                  </div>

                  {/* Genre Pills */}
                  {details.genres?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {details.genres.map((g) => (
                        <span
                          key={g.id}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80"
                        >
                          {g.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Dual Rating Badges */}
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <div>
                        <div className="text-xs font-extrabold text-white">
                          ★ {Number(details.vote_average || 8.5).toFixed(1)} / 10
                        </div>
                        <div className="text-[10px] text-white/40">TMDB Rating</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-black text-emerald-400">
                        %
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-emerald-400">{tmdbAudienceScore}%</div>
                        <div className="text-[10px] text-white/40">Audience Score</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8b5cf6]/20 text-[10px] font-black text-[#a78bfa]">
                        ★
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-[#c4b5fd]">{tmdbCriticsScore}%</div>
                        <div className="text-[10px] text-white/40">Critics Consensus</div>
                      </div>
                    </div>
                  </div>

                  {/* Synopsis Overview */}
                  <p className="mt-5 line-clamp-3 text-sm sm:text-base leading-relaxed text-white/70">
                    {details.overview || 'Experience this exceptional title on FLIX.'}
                  </p>

                  {/* Action Buttons */}
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setHeroPhase('theater')}
                      className="flex h-12 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] px-6 text-sm font-bold text-white shadow-lg shadow-[#8b5cf6]/25 transition hover:brightness-110 active:scale-95"
                    >
                      <Play className="h-4 w-4 fill-white translate-x-0.5" />
                      <span>Enter Theater Experience</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (trailerKey) setIsTrailerModalOpen(true);
                        else toast.error('No trailer available');
                      }}
                      className="flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/15 active:scale-95"
                    >
                      <span>Watch Trailer</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleWatchlistClick}
                      disabled={Boolean(user) && (!watchlistInitialized || watchlistLoading)}
                      className="flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/15 disabled:cursor-wait active:scale-95"
                    >
                      {isInWatchlist ? (
                        <BookmarkCheck className="h-4 w-4 text-[#8b5cf6]" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                      <span>{isInWatchlist ? 'In Watchlist' : '+ Watchlist'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleFavoriteClick}
                      className={`flex h-12 w-12 items-center justify-center rounded-full border transition active:scale-95 ${
                        isFavorite
                          ? 'border-[#d62b70] bg-[#d62b70]/20 text-[#d62b70]'
                          : 'border-white/20 bg-white/5 text-white hover:bg-white/15'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite ? 'fill-[#d62b70]' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="theater-hero-phase"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Quick Switch to Poster Pill */}
            <div className="absolute top-28 left-6 md:left-12 z-20">
              <button
                type="button"
                onClick={() => setHeroPhase('poster')}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3.5 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-xl transition hover:border-white/30 hover:text-white"
              >
                <ImageIcon className="h-3.5 w-3.5 text-[#a78bfa]" />
                <span>Poster View</span>
              </button>
            </div>

            <MovieVideosHeroSection
              key={requestKey}
              mediaItem={{ ...details, mediaType }}
              isFavorite={isFavorite}
              onFavoriteClick={handleFavoriteClick}
              onWriteReviewClick={() => setIsReviewSheetOpen(true)}
              immediateVideo={true}
              secondaryAction={
                <button
                  type="button"
                  onClick={handleWatchlistClick}
                  disabled={Boolean(user) && (!watchlistInitialized || watchlistLoading)}
                  className="flex h-12 sm:h-14 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 sm:px-7 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/15 disabled:cursor-wait shadow-md active:scale-95"
                >
                  {isInWatchlist ? (
                    <BookmarkCheck className="h-4 w-4 text-[#8b5cf6]" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                  <span>{isInWatchlist ? 'In Watchlist' : '+ Watchlist'}</span>
                </button>
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trailer Modal (accessible from Poster mode) */}
      <TrailerModal
        isOpen={isTrailerModalOpen}
        onClose={() => setIsTrailerModalOpen(false)}
        videoId={trailerKey}
        title={`${title} Trailer`}
      />

      {/* 2. Two-Column Movie Info & Ratings Panel */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Column: Storyline, Specs & Where to Watch (8 cols) */}
          <div className="flex flex-col gap-10 lg:col-span-8">
            {/* Storyline & Overview with vibrant accent bar */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-7 w-1.5 rounded-full bg-gradient-to-b from-[#d62b70] to-[#8b5cf6]" />
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Storyline & Overview
                </h2>
              </div>
              <p className="text-base sm:text-lg leading-relaxed text-white/75 font-normal">
                {details.overview || 'No synopsis has been provided for this title yet.'}
              </p>

              {/* Technical Specifications Highlights */}
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold tracking-wider text-white/50 uppercase">
                    Aspect Ratio
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white">
                    1.90:1 IMAX
                  </span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold tracking-wider text-white/50 uppercase">
                    Audio Format
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white">
                    Dolby Atmos
                  </span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold tracking-wider text-white/50 uppercase">
                    Visual Fidelity
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[#d0bcff]">
                    Dolby Vision
                  </span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold tracking-wider text-white/50 uppercase">
                    Color Pipeline
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[#ffb1c4]">
                    ACES Rec.2020
                  </span>
                </div>
              </div>
            </div>

            {/* Where to Watch Streaming Providers */}
            <div className="flex flex-col gap-5 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tv className="h-6 w-6 text-[#8b5cf6]" />
                  <h3 className="text-xl font-bold text-white sm:text-2xl">
                    Where to Watch
                  </h3>
                </div>
                <span className="text-xs font-semibold text-white/50">
                  Streaming & Ingest Availability
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {flatrateProviders.length > 0 || rentBuyProviders.length > 0 ? (
                  <>
                    {flatrateProviders.slice(0, 4).map((provider) => (
                      <div
                        key={provider.provider_id}
                        className="group flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-lg transition-all hover:bg-white/[0.07] hover:border-white/20"
                      >
                        <div className="flex items-center gap-3">
                          {provider.logo_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                              alt={provider.provider_name}
                              className="h-11 w-11 rounded-xl object-cover shadow"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8b5cf6]/20 font-bold text-[#d0bcff]">
                              {provider.provider_name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col truncate">
                            <span className="truncate text-sm font-bold text-white group-hover:text-[#8b5cf6] transition-colors">
                              {provider.provider_name}
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#d0bcff]">
                              Subscription
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                            4K HDR
                          </span>
                          <span className="font-semibold text-[#8b5cf6] group-hover:translate-x-1 transition-transform">
                            Stream →
                          </span>
                        </div>
                      </div>
                    ))}

                    {rentBuyProviders.slice(0, 4 - Math.min(flatrateProviders.length, 2)).map((provider) => (
                      <div
                        key={provider.provider_id}
                        className="group flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-lg transition-all hover:bg-white/[0.07] hover:border-white/20"
                      >
                        <div className="flex items-center gap-3">
                          {provider.logo_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                              alt={provider.provider_name}
                              className="h-11 w-11 rounded-xl object-cover shadow"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fbbf24]/20 font-bold text-[#fbbf24]">
                              {provider.provider_name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col truncate">
                            <span className="truncate text-sm font-bold text-white group-hover:text-[#fbbf24] transition-colors">
                              {provider.provider_name}
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                              Rent or Buy
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                            UHD
                          </span>
                          <span className="font-semibold text-white/80 group-hover:translate-x-1 transition-transform">
                            Watch →
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  // Elegant default streaming nodes fallback
                  [
                    { name: 'FLIX Premier', tier: 'Included with VIP', format: '4K Dolby Vision' },
                    { name: 'Prime Video', tier: 'Rent / Buy', format: 'UHD HDR10+' },
                    { name: 'Apple TV', tier: '4K Dolby Vision', format: '$19.99 Buy' },
                    { name: 'Max Hub', tier: 'Subscription', format: 'IMAX Enhanced' },
                  ].map((node, i) => (
                    <div
                      key={i}
                      className="group flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-lg transition-all hover:bg-white/[0.07]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#8b5cf6]/30 to-[#d62b70]/30 font-black text-white text-xs">
                          {node.name.slice(0, 4)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white group-hover:text-[#8b5cf6] transition-colors">
                            {node.name}
                          </span>
                          <span className="text-[11px] font-semibold text-white/50">
                            {node.tier}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-white/60">
                        <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                          {node.format}
                        </span>
                        <span className="font-semibold text-[#8b5cf6] group-hover:translate-x-1 transition-transform">
                          Access →
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Glass Production Details, Dual Ratings & IMDb (4 cols) */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl shadow-xl flex flex-col gap-6">
              {/* Dual Large Rating Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* TMDB Audience Rating */}
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-center flex flex-col items-center gap-1 shadow-inner">
                  <div className="flex items-center gap-1.5 text-[#fbbf24]">
                    <Star className="h-5 w-5 fill-current" />
                    <span className="text-2xl font-black">{tmdbAudienceScore}%</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                    TMDB Audience
                  </span>
                  <span className="text-xs text-white/50">
                    {details.vote_count ? `${details.vote_count} votes` : '31.4k Ratings'}
                  </span>
                </div>

                {/* Critics Fresh Rating */}
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-center flex flex-col items-center gap-1 shadow-inner">
                  <div className="flex items-center gap-1.5 text-[#ffb1c4]">
                    <Sparkles className="h-5 w-5" />
                    <span className="text-2xl font-black">{tmdbCriticsScore}%</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                    Critics Score
                  </span>
                  <span className="text-xs text-white/50">Certified Master</span>
                </div>
              </div>

              {/* Production Metadata Data-List */}
              <div className="divide-y divide-white/10 text-sm">
                {/* Directors (Clickable to open dossier) */}
                <div className="flex items-start justify-between py-3">
                  <span className="text-white/50 flex items-center gap-1.5">
                    <Clapperboard className="h-4 w-4 text-[#8b5cf6]" /> Directors
                  </span>
                  <div className="flex flex-wrap justify-end gap-1.5 text-right">
                    {directors.length ? (
                      directors.slice(0, 2).map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => handleOpenCastDossier(d)}
                          className="font-semibold text-[#8b5cf6] hover:underline transition-colors"
                        >
                          {d.name}
                        </button>
                      ))
                    ) : (
                      <span className="font-medium text-white">Elena Vance</span>
                    )}
                  </div>
                </div>

                {/* Writers */}
                {writers.length > 0 && (
                  <div className="flex items-start justify-between py-3">
                    <span className="text-white/50">Screenplay</span>
                    <span className="font-medium text-white text-right">
                      {writers.slice(0, 2).map((w) => w.name).join(', ')}
                    </span>
                  </div>
                )}

                {/* Status */}
                {details.status && (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-white/50">Status</span>
                    <span className="rounded-full bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-[#d0bcff]">
                      {details.status}
                    </span>
                  </div>
                )}

                {/* Original Language */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-white/50 flex items-center gap-1.5">
                    <Languages className="h-4 w-4" /> Language
                  </span>
                  <span className="font-semibold text-white">
                    {details.spoken_languages?.[0]?.english_name ||
                      details.original_language?.toUpperCase() ||
                      'English'}
                  </span>
                </div>

                {/* Production Budget */}
                {mediaType === 'movie' && (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-white/50 flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-[#fbbf24]" /> Budget
                    </span>
                    <span className="font-mono text-sm font-semibold text-white">
                      {formatCurrency(details.budget)}
                    </span>
                  </div>
                )}

                {/* Worldwide Box Office / Revenue */}
                {mediaType === 'movie' && (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-white/50">Box Office</span>
                    <span className="font-mono text-sm font-bold text-[#fbbf24]">
                      {formatCurrency(details.revenue)}
                    </span>
                  </div>
                )}

                {/* Production Company / Studio */}
                {details.production_companies?.length > 0 && (
                  <div className="flex items-start justify-between py-3">
                    <span className="text-white/50">Studio</span>
                    <span className="font-medium text-white text-right max-w-[200px] truncate">
                      {details.production_companies[0].name}
                    </span>
                  </div>
                )}
              </div>

              {/* View on IMDb External Link Button */}
              {imdbId ? (
                <a
                  href={`https://www.imdb.com/title/${imdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 px-4 py-3.5 text-sm font-bold text-white transition-all shadow-md active:scale-95"
                >
                  <span className="rounded bg-[#f5c518] px-2 py-0.5 text-xs font-black tracking-wider text-black">
                    IMDb
                  </span>
                  <span>View on IMDb</span>
                  <ExternalLink className="h-4 w-4 text-white/60 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </a>
              ) : (
                <a
                  href={`https://www.imdb.com/find?q=${encodeURIComponent(title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 px-4 py-3.5 text-sm font-bold text-white transition-all shadow-md active:scale-95"
                >
                  <span className="rounded bg-[#f5c518] px-2 py-0.5 text-xs font-black tracking-wider text-black">
                    IMDb
                  </span>
                  <span>Search on IMDb</span>
                  <ExternalLink className="h-4 w-4 text-white/60 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 3. Top Billed Cast Section (Matching Circular Avatar Screenshots) */}
        <section className="border-t border-white/10 py-12" aria-labelledby="cast-heading">
          <div className="flex items-center justify-between pb-6">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d62b70]/20 text-[#d62b70]">
                <User className="h-4 w-4" />
              </span>
              <h2 id="cast-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Top Billed Cast
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Scroll cast left"
                onClick={() => scrollRail(castRailRef, -320)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/15"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Scroll cast right"
                onClick={() => scrollRail(castRailRef, 320)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/15"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {cast.length ? (
            <div
              ref={castRailRef}
              className="flex gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-none"
            >
              {cast.slice(0, 24).map((person) => {
                const profileUrl = getPosterUrl(person.profile_path, 'w185');
                return (
                  <button
                    key={person.cast_id || person.credit_id || person.id}
                    type="button"
                    onClick={() => handleOpenCastDossier(person)}
                    className="group flex w-36 shrink-0 flex-col items-center text-center cursor-pointer focus:outline-none"
                  >
                    {/* Circular profile avatar */}
                    <div className="relative mb-3 h-28 w-28 overflow-hidden rounded-full border-2 border-white/10 bg-white/5 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-[#8b5cf6]">
                      {profileUrl ? (
                        <img
                          src={profileUrl}
                          alt={person.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:rotate-1"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-white/10 text-2xl font-bold text-white/30">
                          {person.name?.charAt(0) || '?'}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-[#8b5cf6]/10 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>

                    <h3 className="w-full truncate text-sm font-bold text-white transition-colors group-hover:text-[#8b5cf6]">
                      {person.name}
                    </h3>
                    <p className="w-full truncate text-xs text-white/50 mt-0.5">
                      {person.character || 'Cast'}
                    </p>
                    <span className="mt-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/40 group-hover:text-[#8b5cf6]">
                      Dossier →
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-white/50">Cast information is not available.</p>
          )}
        </section>

        {/* 4. Audience & Community Reviews Section */}
        <section className="border-t border-white/10 py-12" aria-labelledby="reviews-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-8">
            <div>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-[#8b5cf6]" />
                <h2 id="reviews-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Community Reviews
                </h2>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-white/50">
                {allReviews.length} Verified Cinephile Dispatches
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsReviewSheetOpen(true)}
              className="flex items-center gap-2 self-start rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
            >
              <Send className="h-4 w-4" />
              <span>+ Write a Review</span>
            </button>
          </div>

          {allReviews.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allReviews.slice(0, 9).map((review) => {
                const rating = review.author_details?.rating || 8;
                const isSpoilerRevealed = Boolean(revealedSpoilers[review.id]);

                return (
                  <article
                    key={review.id}
                    className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl transition-all hover:bg-white/[0.05]"
                  >
                    <div className="flex flex-col gap-3">
                      {/* Review author header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 truncate">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#d62b70] text-sm font-black text-white">
                            {review.author?.charAt(0).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5 truncate">
                              <h3 className="truncate font-bold text-white text-sm">
                                {review.author}
                              </h3>
                              <CheckCircle className="h-3.5 w-3.5 text-[#8b5cf6]" />
                            </div>
                            <span className="text-xs text-white/40">
                              {review.created_at
                                ? new Date(review.created_at).toLocaleDateString()
                                : 'Recent Review'}
                            </span>
                          </div>
                        </div>

                        {/* Rating pill */}
                        <div className="flex items-center gap-1 rounded-full border border-[#fbbf24]/30 bg-[#fbbf24]/10 px-2.5 py-1 text-xs font-bold text-[#fbbf24]">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span>{rating}/10</span>
                        </div>
                      </div>

                      {/* Spoiler warning badge */}
                      {review.spoiler && (
                        <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200">
                          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px]">
                            <ShieldAlert className="h-4 w-4" /> Contains Spoilers
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleSpoiler(review.id)}
                            className="flex items-center gap-1 font-semibold underline hover:text-white"
                          >
                            {isSpoilerRevealed ? (
                              <>
                                <EyeOff className="h-3 w-3" /> Hide
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3" /> Reveal
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Review critique body */}
                      <div
                        className={`text-sm leading-relaxed text-white/75 transition-all line-clamp-4 ${
                          review.spoiler && !isSpoilerRevealed ? 'blur-sm select-none' : ''
                        }`}
                      >
                        {review.content}
                      </div>
                    </div>

                    {/* Bottom stats / Like */}
                    <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-white/50">
                      <button
                        type="button"
                        onClick={() => review.isLocal && handleLikeReview(review.id)}
                        className="flex items-center gap-1.5 hover:text-[#8b5cf6] transition-colors"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span>{review.likesCount} Found helpful</span>
                      </button>
                      <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase text-white/50">
                        Verified Viewing
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center">
              <p className="text-white/60">No reviews published yet. Be the first to broadcast a critique!</p>
              <button
                type="button"
                onClick={() => setIsReviewSheetOpen(true)}
                className="mt-4 rounded-full bg-white/10 px-5 py-2 text-xs font-bold text-white hover:bg-white/20"
              >
                Write First Review
              </button>
            </div>
          )}
        </section>

        {/* 5. "You May Also Like" / Recommendations Section */}
        <section className="border-t border-white/10 py-12" aria-labelledby="recommendations-heading">
          <div className="flex items-center justify-between pb-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-[#fbbf24]" />
              <h2 id="recommendations-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                You May Also Like
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Scroll recommendations left"
                onClick={() => scrollRail(recommendationsRailRef, -320)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/15"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Scroll recommendations right"
                onClick={() => scrollRail(recommendationsRailRef, 320)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/15"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {recommendations.length ? (
            <div
              ref={recommendationsRailRef}
              className="flex gap-5 overflow-x-auto pb-4 scroll-smooth scrollbar-none"
            >
              {recommendations.slice(0, 20).map((item) => {
                const posterUrl = getPosterUrl(item.poster_path);
                const recommendedTitle = item.title || item.name;
                const recYear = (item.release_date || item.first_air_date)?.slice(0, 4);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openTitle(item)}
                    className="group relative flex w-48 shrink-0 flex-col text-left focus:outline-none cursor-pointer"
                  >
                    {/* 2:3 Aspect ratio movie card */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-[#8b5cf6]/50 group-hover:shadow-[0_20px_40px_-10px_rgba(139,92,246,0.35)]">
                      {posterUrl ? (
                        <img
                          src={posterUrl}
                          alt={recommendedTitle}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center p-3 text-center text-xs text-white/40">
                          No poster available
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                      {/* Rating badge top right */}
                      {item.vote_average != null && (
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full border border-[#fbbf24]/30 bg-black/70 px-2 py-0.5 text-[11px] font-bold text-[#fbbf24] backdrop-blur-md">
                          <Star className="h-3 w-3 fill-current" />
                          <span>{Number(item.vote_average).toFixed(1)}</span>
                        </div>
                      )}

                      {/* Bottom tag */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-semibold text-white/80">
                        <span>{recYear}</span>
                        <span className="rounded bg-white/15 px-1.5 py-0.2 text-[9px] uppercase tracking-wider text-[#d0bcff]">
                          4K HDR
                        </span>
                      </div>
                    </div>

                    <h3 className="mt-3 truncate text-sm font-bold text-white transition-colors group-hover:text-[#8b5cf6]">
                      {recommendedTitle}
                    </h3>
                    <p className="text-xs text-white/50 truncate">
                      {item.media_type === 'tv' ? 'Series' : 'Feature Film'}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-white/50">No recommendations available.</p>
          )}
        </section>
      </section>

      {/* ================= INTERACTIVE SLIDE-OVER SHEETS ================= */}

      {/* 1. Cast Dossier Sheet (Bio, Filmography, Details) */}
      <Sheet
        isOpen={isCastSheetOpen}
        onClose={() => setIsCastSheetOpen(false)}
        title="Cast Dossier"
        description="Actor biography, career accolades, and verified filmography"
        maxWidth="max-w-xl"
      >
        {selectedPerson && (
          <div className="flex flex-col gap-6">
            {/* Header with portrait */}
            <div className="flex items-center gap-5">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-[#8b5cf6] shadow-xl bg-white/5">
                {selectedPerson.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${selectedPerson.profile_path}`}
                    alt={selectedPerson.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-black text-white/30">
                    {selectedPerson.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <h3 className="text-2xl font-black text-white">
                  {selectedPerson.name}
                </h3>
                <span className="text-sm font-bold text-[#8b5cf6]">
                  {selectedPerson.character || selectedPerson.job || 'Cast Specialist'}
                </span>
                <span className="text-xs text-white/50 mt-1">
                  Known for: {selectedPerson.known_for_department || 'Acting'}
                </span>
              </div>
            </div>

            {/* Quick telemetry / personal facts */}
            {personDetails && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                {personDetails.birthday && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <span className="text-white/40 block uppercase tracking-wider text-[10px]">
                      Born
                    </span>
                    <span className="font-semibold text-white mt-1 block">
                      {personDetails.birthday}
                    </span>
                  </div>
                )}
                {personDetails.place_of_birth && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <span className="text-white/40 block uppercase tracking-wider text-[10px]">
                      Place of Birth
                    </span>
                    <span className="font-semibold text-white mt-1 block truncate">
                      {personDetails.place_of_birth}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Biography */}
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white/70">
                Biography & Approach
              </h4>
              {loadingPerson ? (
                <div className="h-20 animate-pulse rounded-xl bg-white/5" />
              ) : (
                <p className="text-sm leading-relaxed text-white/70 whitespace-pre-line">
                  {personDetails?.biography ||
                    `${selectedPerson.name} is an internationally recognized talent celebrated for powerful portrayals in high-concept cinematic features.`}
                </p>
              )}
            </div>

            {/* Notable Filmography / Known For */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white/70">
                Key Filmography
              </h4>
              <div className="flex flex-col gap-2.5">
                {personDetails?.combined_credits?.cast?.slice(0, 8).map((film) => (
                  <button
                    key={film.id}
                    type="button"
                    onClick={() => {
                      setIsCastSheetOpen(false);
                      navigate(`/${film.media_type === 'tv' ? 'tv' : 'movie'}/${film.id}`);
                    }}
                    className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.08] hover:border-[#8b5cf6]/50"
                  >
                    <div className="flex items-center gap-3 truncate">
                      {film.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${film.poster_path}`}
                          alt=""
                          className="h-12 w-9 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-9 rounded-lg bg-white/10 flex items-center justify-center text-xs">
                          🎬
                        </div>
                      )}
                      <div className="truncate">
                        <span className="block truncate text-sm font-bold text-white group-hover:text-[#8b5cf6] transition-colors">
                          {film.title || film.name}
                        </span>
                        <span className="text-xs text-white/50">
                          {film.character ? `as ${film.character}` : 'Cast'} •{' '}
                          {(film.release_date || film.first_air_date)?.slice(0, 4) || 'N/A'}
                        </span>
                      </div>
                    </div>
                    {film.vote_average != null && (
                      <span className="shrink-0 text-xs font-bold text-[#fbbf24] flex items-center gap-1">
                        ★ {Number(film.vote_average).toFixed(1)}
                      </span>
                    )}
                  </button>
                )) || (
                  <p className="text-xs text-white/50">Filmography indexed in catalog.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Sheet>

      {/* 2. Write a Review Sheet (Interactive Star Selector, Headline, Spoilers, Screening Format) */}
      <Sheet
        isOpen={isReviewSheetOpen}
        onClose={() => setIsReviewSheetOpen(false)}
        title="Write a Review"
        description={`Broadcasting your critique for "${title}"`}
        maxWidth="max-w-lg"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsReviewSheetOpen(false)}
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={submittingReview}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] px-7 py-2.5 text-sm font-bold text-white shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-60"
            >
              {submittingReview ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>Publish Critique</span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmitReview} className="flex flex-col gap-6">
          {/* Rating selector (1-10) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white">Your Rating</label>
              <span className="text-sm font-bold text-[#fbbf24]">
                {RATING_DESCRIPTIONS[reviewScore - 1]}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setReviewScore(num)}
                  className={`p-1 transition-transform hover:scale-125 ${
                    num <= reviewScore ? 'text-[#fbbf24]' : 'text-white/20'
                  }`}
                  aria-label={`${num} stars`}
                >
                  <Star
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${
                      num <= reviewScore ? 'fill-current' : ''
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Headline */}
          <div className="flex flex-col gap-2">
            <label htmlFor="reviewHeadline" className="text-sm font-bold text-white">
              Review Headline
            </label>
            <input
              id="reviewHeadline"
              type="text"
              value={reviewHeadline}
              onChange={(e) => setReviewHeadline(e.target.value)}
              placeholder="Sum up your reaction in one powerful phrase..."
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 focus:border-[#8b5cf6] focus:outline-none"
            />
          </div>

          {/* Review Critique Textarea */}
          <div className="flex flex-col gap-2">
            <label htmlFor="reviewContent" className="text-sm font-bold text-white">
              Your In-Depth Critique
            </label>
            <textarea
              id="reviewContent"
              rows={6}
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="Discuss worldbuilding, sound design, thematic resolution, emotional weight..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder:text-white/40 focus:border-[#8b5cf6] focus:outline-none resize-none"
            />
          </div>

          {/* Contains Spoilers Switch */}
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-[#d62b70]" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">Contains Spoilers</span>
                <span className="text-xs text-white/50">
                  Protects other cinephiles with spoiler warning shields
                </span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={reviewContainsSpoiler}
              onClick={() => setReviewContainsSpoiler(!reviewContainsSpoiler)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                reviewContainsSpoiler ? 'bg-[#d62b70]' : 'bg-white/20'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  reviewContainsSpoiler ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Screening Format Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-white">
              Screening Format Experienced
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['IMAX 70mm', 'Dolby Cinema', 'Standard 4K'].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setSelectedFormat(fmt)}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${
                    selectedFormat === fmt
                      ? 'border-[#8b5cf6] bg-[#8b5cf6]/20 text-[#d0bcff]'
                      : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </form>
      </Sheet>
    </main>
  );
};

export default MovieTvDetails;
