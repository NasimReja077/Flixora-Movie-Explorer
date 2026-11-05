import { useState } from 'react';
import { Bookmark, BookmarkCheck, Heart, Star, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useFavorites } from '../../features/favorites/hooks/useFavorites';
import { useWatchlist } from '../../features/watchlist/hooks/useWatchlist';
import { motion } from 'framer-motion';
import TrailerModal from './TrailerModal';
import toast from 'react-hot-toast';

export const MovieCardSkeleton = ({ className = '' }) => {
  return (
    <div className={`flex w-full flex-col gap-2.5 ${className}`}>
      <div className="relative aspect-[2/3] w-full rounded-2xl skeleton" />
      <div className="h-4 w-3/4 rounded-lg skeleton mt-1" />
      <div className="h-3 w-1/2 rounded skeleton" />
    </div>
  );
};

const MovieCard = ({
  movie: movieProp,
  item,
  mediaType,
  showMediaType = true,
  isLoading = false,
  className = '',
}) => {
  if (isLoading) {
    return <MovieCardSkeleton className={className} />;
  }

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
  const navigate = useNavigate();

  const isFav = Boolean(isFavoriteById[movie?.id]);
  const isInWatchlist = Boolean(isInWatchlistById[movie?.id]);
  const [showTrailer, setShowTrailer] = useState(false);

  if (!movie) return null;

  const title = movie.title || movie.name || 'Untitled';
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
    '';
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
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.04 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className={`group relative flex w-full flex-col cursor-pointer ${className}`}
      >
        {/* 2:3 Aspect Ratio Poster Frame with hairline border and violet glow on hover */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#121214] shadow-lg transition-all duration-300 group-hover:border-[#8b5cf6]/50 group-hover:shadow-[0_20px_40px_-10px_rgba(139,92,246,0.38)]">
          {poster ? (
            <img
              src={poster}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-white/5 p-4 text-center">
              <span className="text-2xl font-black text-white/20">FLIX</span>
              <span className="mt-2 text-xs font-semibold text-white/50">{title}</span>
            </div>
          )}

          {/* Smooth Dark Gradient Scrim From Bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-95" />

          {/* Clean Top-Right Fixed Rating Badge with Glass Background */}
          {rating && rating !== '0.0' && (
            <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 rounded-full border border-white/15 bg-black/60 px-2 py-0.5 text-xs font-bold text-[#fbbf24] backdrop-blur-md shadow-md">
              <Star className="h-3 w-3 fill-current" />
              <span>{rating}</span>
            </div>
          )}

          {/* Optional Media Type Badge (Top Left) */}
          {showMediaType && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/70 backdrop-blur-md">
                {type === 'tv' ? 'TV' : 'Movie'}
              </span>
            </div>
          )}

          {/* Hover Controls Overlay (Subtle Play Icon + Action Capsules) */}
          <div className="absolute inset-0 flex flex-col justify-between p-3 opacity-0 transition-opacity duration-250 group-hover:opacity-100">
            {/* Action Capsules top */}
            <div className="flex items-center justify-between pt-7">
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleFavoriteClick}
                aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-black/80"
              >
                <Heart
                  className={`h-3.5 w-3.5 transition-colors ${
                    isFav ? 'fill-[#d62b70] text-[#d62b70]' : 'text-white'
                  }`}
                />
              </motion.button>

              {user && (
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleWatchlistClick}
                  disabled={!watchlistInitialized || watchlistLoading}
                  aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-black/80"
                >
                  {isInWatchlist ? (
                    <BookmarkCheck className="h-3.5 w-3.5 text-[#8b5cf6]" />
                  ) : (
                    <Bookmark className="h-3.5 w-3.5 text-white" />
                  )}
                </motion.button>
              )}
            </div>

            {/* Centered Small Play Icon (Appears cleanly on hover to open trailer) */}
            <div className="flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleTrailerClick}
                aria-label={`Watch trailer for ${title}`}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] text-white shadow-xl"
              >
                <Play className="h-4 w-4 fill-current ml-0.5" />
              </motion.button>
            </div>

            {/* Bottom quick metadata on hover */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-white/90">
              <span className="truncate">{year}</span>
              <span className="rounded bg-[#8b5cf6]/20 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-[#d0bcff]">
                HD
              </span>
            </div>
          </div>
        </div>

        {/* Clean Title and Year Under the Poster */}
        <div className="mt-2.5 flex flex-col gap-0.5 px-0.5">
          <h3 className="truncate text-sm font-bold tracking-tight text-white transition-colors group-hover:text-[#8b5cf6]">
            {title}
          </h3>
          <p className="text-xs text-white/50">
            {year || (type === 'tv' ? 'Series' : 'Feature Film')}
          </p>
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
