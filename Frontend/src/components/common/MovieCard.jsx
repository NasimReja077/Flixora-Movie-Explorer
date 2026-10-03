import React, { useState } from 'react';
import { Heart, Star, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserActivity } from '../context/UserActivityContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import TrailerModal from './TrailerModal';

const MovieCard = ({ movie }) => {
    const { isFavorite, toggleFavorite } = useUserActivity();
    const { user } = useAuth();
    const isFav = isFavorite(movie.id);
    const navigate = useNavigate();
    const [showTrailer, setShowTrailer] = useState(false);

    const handleFavoriteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        toggleFavorite(movie);
    };

    const handleCardClick = () => {
        navigate(`/movie/${movie.id}`);
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
                        src={movie?.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop"}
                        alt={movie?.title || "Movie Poster"}
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

                    {/* Rating Badge */}
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 z-10 border border-white/10">
                        <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                        <span className="text-white text-xs font-bold">{movie?.rating || "0.0"}</span>
                    </div>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1 px-1">
                    <h3 className="text-gray-900 dark:text-white font-bold text-base md:text-lg truncate group-hover:text-brand-red transition-colors">{movie?.title || "Movie Title"}</h3>
                    <div className="flex items-center justify-between text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                        <span>{movie?.year || "2024"}</span>
                        <span className="uppercase text-[10px] bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 transition-colors">{movie?.media_type || 'Movie'}</span>
                    </div>
                </div>
            </motion.div>

            <TrailerModal
                isOpen={showTrailer}
                onClose={() => setShowTrailer(false)}
                trailerKey={movie?.trailerKey || movie?.key}
                title={movie?.title}
            />
        </>
    );
};

export default MovieCard;