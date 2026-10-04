import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Star, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TrailerModal from '../../../components/common/TrailerModal';
import { getMovieDetails, getTVShowDetails } from '../service/movie.api.js';
import toast from 'react-hot-toast';

const HeroSection = () => {
  const { trending, trendingTV } = useSelector((state) => state.movies);
  const trendingItems = useMemo(
    () => [...(trending || []), ...(trendingTV || [])],
    [trending, trendingTV]
  );
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const movie =
    trendingItems.find((item) => item.id === selectedMovieId) ||
    trendingItems[0] ||
    null;
  const currentMovieId = movie?.id;
  const navigate = useNavigate();

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
    if (!trendingItems.length) return;
    const candidates =
      trendingItems.length > 1
        ? trendingItems.filter((item) => item.id !== currentMovieId)
        : trendingItems;
    const nextMovie = candidates[Math.floor(Math.random() * candidates.length)];
    setSelectedMovieId(nextMovie.id);
    setTrailerVideoId(null);
    setVisibleTrailerId(null);
    setPlayerState({ trailerId: null, player: null });
  }, [currentMovieId, trendingItems]);

  // Rotate featured titles while avoiding state updates from inside render-time updaters.
  useEffect(() => {
    if (!movie) return undefined;
    const interval = setInterval(switchMovie, 45000);
    return () => clearInterval(interval);
  }, [movie, switchMovie]);

  // Fetch trailer for backdrop
  useEffect(() => {
    const fetchTrailerForBackdrop = async () => {
      if (!movie || trailerVideoId) return;
      setFetchingTrailer(true);
      try {
        const mediaType = movie.mediaType || movie.media_type || 'movie';
        const request = mediaType === 'tv'
          ? getTVShowDetails(movie.id)
          : getMovieDetails(movie.id);
        const { data } = await request;
        const trailer = data.data.videos?.results?.find(
          (vid) => vid.site === 'YouTube' && vid.type === 'Trailer'
        ) || data.data.videos?.results?.[0];
        
        if (trailer) {
          setTrailerVideoId(trailer.key);
        }
      } catch (error) {
        console.error("Failed to fetch trailer for hero backdrop", error);
      } finally {
        setFetchingTrailer(false);
      }
    };

    fetchTrailerForBackdrop();
  }, [movie, trailerVideoId]);

  // Set up delay timer to display trailer in background
  useEffect(() => {
    if (!movie || !trailerVideoId) return;

    const timer = setTimeout(() => {
      setVisibleTrailerId(trailerVideoId);
    }, 4000);

    return () => clearTimeout(timer);
  }, [movie, trailerVideoId]);

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
            }
          }
        });
      } catch (error) {
        console.error("Error creating YT Player", error);
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
            console.error("Error destroying YT Player", error);
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
      // Explicitly tell the player to play, as unmuting an autoplayed video 
      // can sometimes cause browsers to pause it automatically.
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
      toast.error("No trailer available for this title.");
    }
  };

  const handleMoreDetails = () => {
    const mediaType = movie.mediaType || movie.media_type || 'movie';
    navigate(`/${mediaType === 'tv' ? 'tv' : 'movie'}/${movie.id}`);
  };

  if (!movie) {
    return (
      <div className="relative h-[75vh] md:h-[85vh] w-full flex items-center justify-start overflow-hidden pt-16 mt-[-64px]">
        <div className="h-full w-full animate-pulse bg-white/10" />
      </div>
    );
  }

  const title = movie.title || movie.name;
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const releaseDate = movie.release_date || movie.first_air_date || '';
  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` 
    : (trailerVideoId 
        ? `https://img.youtube.com/vi/${trailerVideoId}/maxresdefault.jpg` 
        : (movie.posterUrl || (movie.poster_path ? `https://image.tmdb.org/t/p/w1280${movie.poster_path}` : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoWcWg0E8pSjBNi0TtiZsqu8uD2PAr_K11DA&s')));

  return (
    <div className="relative h-[85vh] md:h-[90vh] w-full flex items-center justify-start overflow-hidden pt-72 md:pt-46">
      <AnimatePresence mode="wait">
        <motion.div 
          key={movie.id}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1.02 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0 z-0 origin-center"
        >
          {/* Background Image with Ken Burns Zoom */}
          <motion.img
            src={backdropUrl}
            alt={title}
            initial={{ scale: 1 }}
            animate={{ scale: 1.15 }}
            transition={{ 
              duration: 45, 
              ease: "linear",
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="w-full h-full object-cover"
          />

          {/* Active Video Trailer Layer */}
          {showVideo && trailerVideoId && (
            <motion.div
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1.02 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 z-0 overflow-hidden bg-background flex items-center justify-center"
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
                  border: 'none'
                }}
                allow="autoplay; encrypted-media"
                title="Trailer"
              />
            </motion.div>
          )}
          
          {/* Premium Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/70 to-transparent z-10" />
          <div className="absolute inset-0 bg-black/10 z-0" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={movie.id + "_content"}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="container mx-auto px-4 md:px-12 z-20 relative"
        >
          <div className="max-w-4xl">
            <div className="flex items-center flex-wrap gap-4 mb-4">
              <span className="bg-primary/15 backdrop-blur-md text-primary border border-primary/20 text-xs md:text-sm px-4 py-1.5 font-medium tracking-wide rounded-full">
                {movie?.mediaType === 'tv' ? 'Featured Series' : 'Featured Movie'}
              </span>

              <div className="flex items-center gap-1.5 text-yellow-500 font-medium bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm">{rating}</span>
              </div>

              {releaseDate && (
                <span className="text-sm font-medium text-foreground/80 bg-white/5 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 tracking-wide">
                  {releaseDate.substring(0, 4)}
                </span>
              )}
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-5 text-foreground drop-shadow-lg line-clamp-2 leading-[1.1]">
              {title}
            </h1>
            
            <p className="text-lg md:text-xl text-foreground/80 mb-8 line-clamp-3 leading-relaxed max-w-2xl font-normal drop-shadow-md">
              {movie.overview}
            </p>

            <div className="flex flex-nowrap gap-4 md:gap-5 items-center">
              <button
                type="button"
                className="h-12 md:h-14 flex-1 md:flex-none px-6 md:px-8 font-semibold tracking-wide text-sm gap-2 rounded-full transition-all hover:scale-105 active:scale-95 bg-primary text-primary-foreground group shadow-lg shadow-primary/25"
                onClick={handleWatchTrailer}
                disabled={fetchingTrailer}
              >
                {fetchingTrailer ? (
                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                ) : (
                   <Play className="h-5 w-5 fill-current transition-transform group-hover:scale-110" />
                )}
                <span>Watch Trailer</span>
              </button>

              <button
                type="button"
                className="h-12 md:h-14 flex-1 md:flex-none px-6 md:px-8 font-semibold tracking-wide text-sm gap-2 rounded-full backdrop-blur-md bg-white/5 hover:bg-white/15 transition-all active:scale-95 border-white/20 text-white"
                onClick={handleMoreDetails}
              >
                <Info className="h-5 w-5" /> <span>Details</span>
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Volume/Mute Controller */}
      {showVideo && player && (
        <button
          type="button"
          onClick={handleToggleMute}
          className="absolute bottom-6 right-6 md:right-12 z-30 h-12 w-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-md hover:bg-black/60 text-white transition-all scale-90 md:scale-100"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5 text-primary" />
          )}
        </button>
      )}

      <TrailerModal 
        isOpen={isTrailerOpen} 
        onClose={() => setIsTrailerOpen(false)} 
        trailerKey={trailerVideoId}
        title={title}
      />
    </div>
  );
};

export default HeroSection;


// use MovieVideosHeroSection.jsx in movie and tv show pages to display the hero section with trailer and details.
