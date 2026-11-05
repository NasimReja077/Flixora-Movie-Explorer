import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Info,
  Star,
  Volume2,
  VolumeX,
  Heart,
  MessageSquarePlus,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TrailerModal from '../../../components/common/TrailerModal';
import { getMovieDetails, getTVShowDetails } from '../service/movie.api.js';
import toast from 'react-hot-toast';

const MovieVideosHeroSection = ({
  mediaItem,
  secondaryAction,
  onWriteReviewClick,
  onFavoriteClick,
  isFavorite = false,
  immediateVideo = false,
  onSwitchToPoster,
}) => {
  const { trending, trendingTV } = useSelector((state) => state.movies);
  const trendingItems = useMemo(
    () => [...(trending || []), ...(trendingTV || [])],
    [trending, trendingTV]
  );
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const movie =
    mediaItem ||
    trendingItems.find((item) => item.id === selectedMovieId) ||
    trendingItems[0] ||
    null;
  const currentMovieId = movie?.id;
  const navigate = useNavigate();
  const currentMediaType = movie?.mediaType || movie?.media_type || 'movie';

  // Trailer states
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [trailerVideoId, setTrailerVideoId] = useState(null);
  const [fetchingTrailer, setFetchingTrailer] = useState(false);

  const [visibleTrailerId, setVisibleTrailerId] = useState(null);
  const showVideo = Boolean(trailerVideoId && visibleTrailerId === trailerVideoId);
  const [isMuted, setIsMuted] = useState(true);
  const [playerState, setPlayerState] = useState({ trailerId: null, player: null });
  const player = playerState.trailerId === trailerVideoId ? playerState.player : null;

  // Load YouTube Iframe API on mount
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  const switchMovie = useCallback(() => {
    if (mediaItem || !trendingItems.length) return;
    const candidates =
      trendingItems.length > 1
        ? trendingItems.filter((item) => item.id !== currentMovieId)
        : trendingItems;
    const nextMovie = candidates[Math.floor(Math.random() * candidates.length)];
    setSelectedMovieId(nextMovie.id);
    setTrailerVideoId(null);
    setVisibleTrailerId(null);
    setPlayerState({ trailerId: null, player: null });
  }, [currentMovieId, mediaItem, trendingItems]);

  // Rotate featured titles while avoiding state updates from inside render-time updaters.
  useEffect(() => {
    if (!movie || mediaItem) return undefined;
    const interval = setInterval(switchMovie, 45000);
    return () => clearInterval(interval);
  }, [mediaItem, movie, switchMovie]);

  // Fetch trailer for backdrop
  useEffect(() => {
    const fetchTrailerForBackdrop = async () => {
      if (!movie || trailerVideoId) return;
      setFetchingTrailer(true);
      try {
        let videos = movie.videos?.results;
        if (!videos) {
          const request =
            currentMediaType === 'tv'
              ? getTVShowDetails(movie.id)
              : getMovieDetails(movie.id);
          const { data } = await request;
          videos = data.data.videos?.results;
        }
        const trailer =
          videos?.find(
            (vid) => vid.site === 'YouTube' && vid.type === 'Trailer'
          ) || videos?.[0];

        if (trailer) {
          setTrailerVideoId(trailer.key);
        }
      } catch (error) {
        console.error('Failed to fetch trailer for hero backdrop', error);
      } finally {
        setFetchingTrailer(false);
      }
    };

    fetchTrailerForBackdrop();
  }, [currentMediaType, movie, trailerVideoId]);

  // Set up delay timer to display trailer in background
  useEffect(() => {
    if (!movie || !trailerVideoId) return;

    if (immediateVideo) {
      const immediateTimer = setTimeout(() => {
        setVisibleTrailerId(trailerVideoId);
      }, 400);
      return () => clearTimeout(immediateTimer);
    }

    const timer = setTimeout(() => {
      setVisibleTrailerId(trailerVideoId);
    }, 3500);

    return () => clearTimeout(timer);
  }, [immediateVideo, movie, trailerVideoId]);

  // Initialize YT Player instance when iframe is mounted
  useEffect(() => {
    if (!showVideo || !trailerVideoId) return;

    let ytPlayer = null;
    const initPlayer = () => {
      try {
        ytPlayer = new window.YT.Player('hero-youtube-player', {
          events: {
            onReady: (event) => {
              if (isMuted) {
                event.target.mute();
              } else {
                event.target.unMute();
                event.target.setVolume(50);
              }
              setPlayerState({ trailerId: trailerVideoId, player: event.target });
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                setVisibleTrailerId(null);
                setTimeout(switchMovie, 1500);
              }
            },
          },
        });
      } catch (error) {
        console.error('Error creating YT Player', error);
      }
    };

    const checkYT = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(checkYT);
        initPlayer();
      }
    }, 200);

    return () => {
      clearInterval(checkYT);
      if (ytPlayer && typeof ytPlayer.destroy === 'function') {
        setTimeout(() => {
          try {
            ytPlayer.destroy();
          } catch (error) {
            console.error('Error destroying YT Player', error);
          }
        }, 0);
      }
    };
  }, [isMuted, showVideo, switchMovie, trailerVideoId]);

  const handleToggleMute = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!player) return;

    if (isMuted) {
      player.unMute();
      player.setVolume(50);
      player.playVideo();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const handleWatchTrailer = () => {
    if (trailerVideoId) {
      setIsTrailerOpen(true);
    } else {
      toast.error('No trailer available for this title.');
    }
  };

  const handleMoreDetails = () => {
    navigate(`/${currentMediaType === 'tv' ? 'tv' : 'movie'}/${movie.id}`);
  };

  if (!movie) {
    return (
      <div className="relative flex h-[75vh] w-full items-center justify-start overflow-hidden bg-[#090909] pt-16 md:h-[85vh]">
        <div className="h-full w-full animate-pulse bg-white/5" />
      </div>
    );
  }

  const title = movie.title || movie.name;
  const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : '8.5';
  const voteCount = movie.vote_count
    ? movie.vote_count > 1000
      ? `${(movie.vote_count / 1000).toFixed(1)}k`
      : movie.vote_count
    : '12.4k';
  const releaseDate = movie.release_date || movie.first_air_date || '';
  const releaseYear = releaseDate ? releaseDate.substring(0, 4) : '';
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : movie.number_of_seasons
    ? `${movie.number_of_seasons} Season${movie.number_of_seasons > 1 ? 's' : ''}`
    : null;
  const genres = movie.genres || [];

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : trailerVideoId
    ? `https://img.youtube.com/vi/${trailerVideoId}/maxresdefault.jpg`
    : movie.posterUrl ||
      (movie.poster_path
        ? `https://image.tmdb.org/t/p/w1280${movie.poster_path}`
        : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop');

  return (
    <div className="relative min-h-[82vh] md:min-h-[88vh] lg:min-h-[92vh] w-full overflow-hidden flex items-end pb-12 pt-32 bg-[#090909]">
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-0 origin-center"
        >
          {/* Background image with subtle slow zoom */}
          <motion.img
            src={backdropUrl}
            alt={title}
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{
              duration: 35,
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="h-full w-full object-cover object-center"
          />

          {/* Active video trailer layer */}
          {showVideo && trailerVideoId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-black"
            >
              <iframe
                id="hero-youtube-player"
                src={`https://www.youtube.com/embed/${trailerVideoId}?enablejsapi=1&autoplay=1&mute=1&controls=0&playsinline=1&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1`}
                className="pointer-events-none shrink-0"
                style={{
                  width: '105vw',
                  height: '59.06vw',
                  minWidth: '158.66vh',
                  minHeight: '89.25vh',
                  border: 'none',
                }}
                allow="autoplay; encrypted-media"
                title="Trailer"
              />
            </motion.div>
          )}

          {/* Atmospheric gradient scrims for cinematic immersion */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/65 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090909]/95 via-[#090909]/55 to-transparent z-10" />
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#090909]/80 to-transparent z-10" />

          {/* Ambient colored lighting glows */}
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-96 w-96 rounded-full bg-[#8b5cf6]/20 blur-[130px] z-10" />
          <div className="pointer-events-none absolute top-1/3 right-1/4 h-80 w-80 rounded-full bg-[#d62b70]/15 blur-[120px] z-10" />
        </motion.div>
      </AnimatePresence>

      {/* Top right Audio / Atmos indicator */}
      {showVideo && player && (
        <div className="absolute top-28 right-6 md:right-12 z-20 flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleMute}
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-xl transition hover:border-white/30 hover:bg-black/80"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-white/70" />
            ) : (
              <Volume2 className="h-4 w-4 text-[#8b5cf6]" />
            )}
            <span className="text-white/80 group-hover:text-white">
              {isMuted ? 'Muted' : 'Dolby Atmos Active'}
            </span>
          </button>
        </div>
      )}

      {/* Hero Content Cluster */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-6 md:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={movie.id + '_content'}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            {/* Genre Pills & Tags */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gradient-to-r from-[#8b5cf6]/30 to-[#d62b70]/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#d0bcff] border border-[#8b5cf6]/40 backdrop-blur-md">
                {currentMediaType === 'tv' ? 'Featured Series' : 'Featured Movie'}
              </span>

              {genres.slice(0, 3).map((genre) => (
                <span
                  key={genre.id || genre}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/75 backdrop-blur-md"
                >
                  {genre.name || genre}
                </span>
              ))}

              <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[#fbbf24]/30 bg-[#fbbf24]/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-[#fbbf24] uppercase">
                <Sparkles className="h-3 w-3" /> 4K Ultra HD
              </span>
            </div>

            {/* Movie Title */}
            <h1 className="mb-4 text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] leading-[1.08]">
              {title}
            </h1>

            {/* Metadata Strip */}
            <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-white/70">
              {releaseYear && <span className="text-white font-bold">{releaseYear}</span>}
              {runtime && (
                <>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span>{runtime}</span>
                </>
              )}
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <div className="flex items-center gap-1.5 rounded-full border border-[#fbbf24]/30 bg-[#fbbf24]/15 px-3 py-1 text-xs font-bold text-[#fbbf24]">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>{rating}</span>
                <span className="font-normal text-white/60">/ 10 ({voteCount} votes)</span>
              </div>
              <span className="hidden md:inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-bold text-white/80 uppercase">
                IMAX Enhanced
              </span>
            </div>

            {/* Synopsis */}
            {movie.overview && (
              <p className="mb-8 max-w-2xl text-base sm:text-lg leading-relaxed text-white/80 line-clamp-3 drop-shadow-md">
                {movie.overview}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Play Trailer Primary Button */}
              <button
                type="button"
                onClick={handleWatchTrailer}
                disabled={fetchingTrailer}
                className="group flex h-12 sm:h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#b20056] to-[#d62b70] px-6 sm:px-8 text-sm sm:text-base font-bold text-white shadow-[0_12px_32px_-6px_rgba(139,92,246,0.55)] transition-all hover:scale-105 active:scale-95 disabled:cursor-wait"
              >
                {fetchingTrailer ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Play className="h-5 w-5 fill-current transition-transform group-hover:scale-110" />
                )}
                <span>Play Trailer</span>
              </button>

              {/* Secondary Watchlist Action */}
              {secondaryAction}

              {/* Favorite Action */}
              {onFavoriteClick && (
                <button
                  type="button"
                  onClick={onFavoriteClick}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur-xl transition hover:bg-white/15 active:scale-95 shadow-md group"
                >
                  <Heart
                    className={`h-5 w-5 transition-colors ${
                      isFavorite
                        ? 'fill-[#d62b70] text-[#d62b70]'
                        : 'group-hover:text-[#d62b70]'
                    }`}
                  />
                </button>
              )}

              {/* Write Review Action (if provided) */}
              {onWriteReviewClick && (
                <button
                  type="button"
                  onClick={onWriteReviewClick}
                  className="flex h-12 sm:h-14 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 sm:px-6 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/15 active:scale-95 shadow-md"
                >
                  <MessageSquarePlus className="h-4 w-4 text-[#8b5cf6]" />
                  <span>Write a Review</span>
                </button>
              )}

              {/* Details link when on home slider */}
              {!mediaItem && (
                <button
                  type="button"
                  onClick={handleMoreDetails}
                  className="flex h-12 sm:h-14 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/15 active:scale-95"
                >
                  <Info className="h-4 w-4" />
                  <span>Details</span>
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerKey={trailerVideoId}
        title={title}
      />
    </div>
  );
};

export default MovieVideosHeroSection;
