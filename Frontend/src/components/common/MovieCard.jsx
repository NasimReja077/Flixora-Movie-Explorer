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
    const isFav = Boolean(isFavoriteById[movie.id]);
    const isInWatchlist = Boolean(isInWatchlistById[movie.id]);
    const navigate = useNavigate();
    const [showTrailer, setShowTrailer] = useState(false);
    const title = movie.title || movie.name || 'Movie Title';
    const poster = movie.poster || (movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null);
    const rating = movie.rating ?? movie.vote_average?.toFixed(1) ?? '0.0';
    const year = movie.year || (movie.release_date || movie.first_air_date)?.slice(0, 4) || '2024';
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
        } else {
            addFavorite({
                movieId: movie.id,
                movieType: type,
                movieData: movie,
            });
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 group w-[160px] min-w-[160px] sm:w-[200px] sm:min-w-[200px] md:w-[260px] md:min-w-[260px] cursor-pointer"
            >
                {/* Poster Image Container */}
                <div className="relative aspect-2/3 w-full rounded-2xl overflow-hidden shadow-lg border border-white/5 transition-all duration-300 group-hover:shadow-2xl group-hover:border-white/20">
                    <motion.img
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        src={poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop"}
                        alt={title}
                        className="w-full h-full object-cover"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleTrailerClick}
                            className="bg-brand-red text-white p-3 rounded-full shadow-lg"
                        >
                            <Play className="w-6 h-6 fill-current" />
                        </motion.button>
                        <span className="text-white font-bold text-sm tracking-wide">Watch Trailer</span>
                    </div>

                    {/* Heart Icon */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleFavoriteClick}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 backdrop-blur-md p-2 rounded-full text-white transition-colors z-10"
                    >
                        <Heart className={`w-5 h-5 ${isFav ? 'fill-brand-red text-brand-red' : ''}`} />
                    </motion.button>

                    {user && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleWatchlistClick}
                            disabled={!watchlistInitialized || watchlistLoading}
                            aria-label={isInWatchlist ? `Remove ${title} from watchlist` : `Add ${title} to watchlist`}
                            title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                            className="absolute top-4 left-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/80 disabled:cursor-wait disabled:opacity-60"
                        >
                            {isInWatchlist ? <BookmarkCheck className="h-5 w-5 text-[#c4b5fd]" /> : <Bookmark className="h-5 w-5" />}
                        </motion.button>
                    )}

                    {/* Rating Badge */}
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 z-10 border border-white/10">
                        <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                        <span className="text-white text-xs font-bold">{rating}</span>
                    </div>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1 px-1">
                    <h3 className="text-gray-900 dark:text-white font-bold text-base md:text-lg truncate group-hover:text-brand-red transition-colors">{title}</h3>
                    <div className="flex items-center justify-between text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                        <span>{year}</span>
                        <span className="uppercase text-[10px] bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 transition-colors">{type}</span>
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