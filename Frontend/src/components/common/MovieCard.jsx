import { useState } from 'react';
import { Bookmark, BookmarkCheck, Heart, Star, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useFavorites } from '../../features/favorites/hooks/useFavorites';
import { useWatchlist } from '../../features/watchlist/hooks/useWatchlist';
import { motion } from 'framer-motion';
import TrailerModal from './TrailerModal';
import toast from 'react-hot-toast';

const MovieCard = ({ movie: movieProp, item, mediaType }) => {
  const movie = movieProp || item;
  const { isFavoriteById, addFavorite, removeFavorite } = useFavorites();
  const {
    isInWatchlistById,
    initialized: watchlistInitialized,
    loading: watchlistLoading,
    addToWatchlist,
    removeFromWatchlist,
  } = useWatchlist();
  const { user } = useAuth();
  const isFav = Boolean(isFavoriteById[movie?.id]);
  const isInWatchlist = Boolean(isInWatchlistById[movie?.id]);
  const navigate = useNavigate();
  const [showTrailer, setShowTrailer] = useState(false);

  if (!movie) return null;

  const title = movie.title || movie.name || 'Movie Title';
  const poster =
    movie.poster ||
    (movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null);
  const rating =
    movie.rating != null
      ? Number(movie.rating).toFixed(1)
      : movie.vote_average != null
      ? Number(movie.vote_average).toFixed(1)
      : '8.0';
  const year =
    movie.year ||
    (movie.release_date || movie.first_air_date)?.slice(0, 4) ||
    '2024';
  const type = movie.media_type || mediaType || 'movie';

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (isFav) {
      removeFavorite(movie.id);
      toast.success('Removed from favorites');
    } else {
      addFavorite({
        movieId: movie.id,
        movieType: type,
        movieData: movie,
      });
      toast.success('Saved to favorites');
    }
  };

  const handleWatchlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!watchlistInitialized || watchlistLoading) return;

    try {
      if (isInWatchlist) {
        await removeFromWatchlist(movie.id).unwrap();
        toast.success('Removed from your watchlist');
      } else {
        await addToWatchlist({
          movieId: movie.id,
          movieType: type,
          movieData: {
            title,
            posterPath: movie.poster_path || movie.posterPath || movie.poster || '',
            voteAverage: Number(movie.vote_average ?? movie.voteAverage ?? movie.rating ?? 0),
            releaseDate: movie.release_date || movie.first_air_date || movie.releaseDate || '',
          },
        }).unwrap();
        toast.success('Added to your watchlist');
      }
    } catch (error) {
      toast.error(error || 'Could not update your watchlist');
    }
  };

  const handleCardClick = () => {
    navigate(`/${type === 'tv' ? 'tv' : 'movie'}/${movie.id}`);
  };

  const handleTrailerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTrailer(true);
  };

  return (
    <>
      <motion.div
        onClick={handleCardClick}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25 }}
        className="group relative flex w-full flex-col cursor-pointer"
      >
        {/* 2:3 Aspect ratio poster frame */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#161619] shadow-xl transition-all duration-300 group-hover:border-[#8b5cf6]/50 group-hover:shadow-[0_20px_40px_-10px_rgba(139,92,246,0.35)]">
          <img
            src={
              poster ||
              'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop'
            }
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-60" />

          {/* Hover Overlay with play trailer */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 opacity-0 backdrop-blur-xs transition-opacity duration-300 group-hover:opacity-100">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleTrailerClick}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] text-white shadow-xl"
            >
              <Play className="h-5 w-5 fill-current ml-0.5" />
            </motion.button>
            <span className="text-xs font-bold tracking-wider uppercase text-white/90">
              Watch Trailer
            </span>
          </div>

          {/* Top-right Rating Pill */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full border border-[#fbbf24]/30 bg-black/70 px-2.5 py-1 text-xs font-bold text-[#fbbf24] backdrop-blur-md shadow">
            <Star className="h-3 w-3 fill-current" />
            <span>{rating}</span>
          </div>

          {/* Quick Action Buttons (Favorite & Watchlist) */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavoriteClick}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-black/80"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  isFav ? 'fill-[#d62b70] text-[#d62b70]' : 'text-white'
                }`}
              />
            </motion.button>

            {user && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWatchlistClick}
                disabled={!watchlistInitialized || watchlistLoading}
                aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-black/80"
              >
                {isInWatchlist ? (
                  <BookmarkCheck className="h-4 w-4 text-[#8b5cf6]" />
                ) : (
                  <Bookmark className="h-4 w-4 text-white" />
                )}
              </motion.button>
            )}
          </div>

          {/* Bottom tag row */}
          <div className="absolute bottom-2.5 left-3 right-3 z-10 flex items-center justify-between text-[11px] font-semibold text-white/80">
            <span>{year}</span>
            <span className="rounded bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#d0bcff]">
              {type === 'tv' ? 'Series' : 'Film'}
            </span>
          </div>
        </div>

        {/* Text info */}
        <div className="mt-2.5 flex flex-col gap-0.5 px-0.5">
          <h3 className="truncate text-sm sm:text-base font-bold text-white transition-colors group-hover:text-[#8b5cf6]">
            {title}
          </h3>
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>{year}</span>
            <span className="text-[10px] uppercase tracking-wider text-white/40">
              4K HDR
            </span>
          </div>
        </div>
      </motion.div>

      <TrailerModal
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        trailerKey={movie.trailerKey || movie.key}
        title={title}
      />
    </>
  );
};

export default MovieCard;
