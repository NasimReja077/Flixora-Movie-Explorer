import { useCallback, useState, useEffect } from 'react';
import { Star, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { discoverTVShows, getGenres } from '../service/movie.api.js';
import GridCardSkeleton from '../../../components/common/GridCardSkeleton';
import { useFavorites } from '../../favorites/hooks/useFavorites';
import { useAuth } from '../../auth/hooks/useAuth';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import { motion } from 'framer-motion';

const FavoriteMovieCard = ({ movie }) => {
    const { isFavoriteById, addFavorite, removeFavorite } = useFavorites();
    const { user } = useAuth();
    const isFav = Boolean(isFavoriteById[movie.id]);
    const navigate = useNavigate();

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
            addFavorite({ movieId: movie.id, movieType: 'tv', movieData: movie });
        }
    };

    const handleCardClick = () => {
        navigate(`/tv/${movie.id}`);
    };

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            onClick={handleCardClick}
            className="flex flex-col gap-2 group cursor-pointer w-full"
        >
            {/* Poster Image Container */}
            <div className="relative aspect-3/4 w-full rounded-[16px] overflow-hidden bg-gray-200 dark:bg-[#222]">
                {movie.poster ? (
                    <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        <span className="text-white font-medium text-center opacity-80">{movie.title}</span>
                    </div>
                )}

                {/* Rating Badge */}
                <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-[#1A1A1A] px-2 py-1 rounded-[6px] flex items-center gap-1.5 z-10 border border-gray-200 dark:border-white/5">
                    <Star className="w-3.5 h-3.5 fill-[#F2B01E] text-[#F2B01E]" />
                    <span className="text-gray-900 dark:text-white text-[13px] font-bold">{movie.rating}</span>
                </div>

                {/* Heart Icon */}
                <button
                    onClick={handleFavoriteClick}
                    className="absolute top-3 right-3 bg-black/50 hover:bg-black/80 backdrop-blur-md p-1.5 rounded-full text-white transition-colors z-10"
                >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-brand-red text-brand-red' : ''}`} />
                </button>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-0.5 px-0.5 mt-1">
                <h3 className="text-gray-900 dark:text-white font-bold text-[16px] truncate">{movie.title}</h3>
                <div className="flex items-center text-[13px] text-gray-400">
                    <span>{movie.genre}</span>
                    <span className="mx-1.5">•</span>
                    <span>{movie.year}</span>
                </div>
            </div>
        </motion.div>
    );
};

const TvShowPage = () => {
    const [shows, setShows] = useState([]);
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [loading, setLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true); // Added for header loading state
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const { user } = useAuth();
    const { fetchFavorites } = useFavorites();

    const loadMoreShows = useCallback(() => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    }, [hasMore, loading]);

    const loaderRef = useInfiniteScroll(loadMoreShows, hasMore);

    useEffect(() => {
        if (user) void fetchFavorites();
    }, [fetchFavorites, user]);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await getGenres('tv');
                setGenres(response.data.data.genres || []);
            } catch (error) {
                console.error("Error fetching genres:", error);
            }
        };
        fetchGenres();
    }, []);

    useEffect(() => {
        let active = true;
        const fetchShows = async () => {
            if (page === 1) {
                setLoading(true);
                setInitialLoading(true); // Set initial loading for the header
            }
            try {
                const response = await discoverTVShows({
                    page,
                    ...(selectedGenre ? { with_genres: selectedGenre } : {}),
                });
                if (!active) return;
                const payload = response.data.data;
                const formattedShows = (payload.results || []).map(item => ({
                    id: item.id,
                    title: item.name || item.original_name, // TV Shows use 'name' instead of 'title'
                    rating: item.vote_average ? parseFloat((item.vote_average / 2).toFixed(1)) : 'N/A',
                    genre: 'TV Series',
                    year: (item.first_air_date || '').split('-')[0],
                    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
                    media_type: 'tv' // useful for consistency
                }));

                setShows(prev => page === 1 ? formattedShows : [...prev, ...formattedShows]);

                if (formattedShows.length === 0 || page >= payload.pagination.totalPages) {
                    setHasMore(false);
                }
            } catch (error) {
                if (active) console.error("Error fetching TV shows:", error);
            } finally {
                if (active) {
                    setLoading(false);
                    if (page === 1) setInitialLoading(false);
                }
            }
        };

        fetchShows();
        if (page === 1) window.scrollTo(0, 0);
        return () => {
            active = false;
        };
    }, [page, selectedGenre]);

    const handleGenreSelect = (genreId) => {
        setSelectedGenre(genreId);
        setPage(1);
        setShows([]);
        setHasMore(true);
    };

    // Shuffle functionality removed as per new header design
    // const handleShuffle = () => {
    //     if (shows.length > 0) {
    //         const shuffled = [...shows].sort(() => Math.random() - 0.5);
    //         setShows(shuffled);
    //     }
    // };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen bg-white dark:bg-bg-dark text-gray-900 dark:text-white pt-32 pb-24 transition-colors duration-300"
        >
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 uppercase">TV Series</h1>
                        <p className="text-gray-400 font-medium">Binge-worthy shows from around the world, all in one place.</p>
                    </motion.div>

                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full cursor-default"
                    >
                        <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse"></div>
                        <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                            {initialLoading ? 'Loading Catalog...' : `${shows.length} SHOWS AVAILABLE`}
                        </span>
                    </motion.div>
                </div>

                {/* Genre Filter */}
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-6 -mx-6 px-6 lg:-mx-12 lg:px-12 mb-12">
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleGenreSelect('')}
                        className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${selectedGenre === ''
                            ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20'
                            : 'bg-[#1A1A1A] text-gray-400 hover:bg-[#222] hover:text-white border border-white/5'
                            }`}
                    >
                        All
                    </motion.button>
                    {genres.map((genre, index) => (
                        <motion.button
                            key={genre.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + (index + 1) * 0.05 }} // Adjusted delay for "All" button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleGenreSelect(genre.id)}
                            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${selectedGenre === genre.id
                                ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20'
                                : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#222] hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/5'
                                }`}
                        >
                            {genre.name}
                        </motion.button>
                    ))}
                </div>

                {/* Shows Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-10">
                    {shows.map((show, index) => (
                        <FavoriteMovieCard key={`${show.id}-${index}`} movie={show} />
                    ))}

                    {/* First page loader */}
                    {loading && page === 1 && [...Array(10)].map((_, i) => (
                        <GridCardSkeleton key={i} />
                    ))}
                </div>

                {/* Loading State for "Load More" */}
                {loading && page > 1 && (
                    <div className="flex justify-center mt-12 py-10">
                        <div className="w-10 h-10 border-4 border-brand-red/20 border-t-brand-red rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Infinite Scroll Trigger */}
                {hasMore && !initialLoading && (
                    <div ref={loaderRef} className="h-20 w-full flex items-center justify-center mt-4">
                        {!loading && <div className="w-2 h-2 rounded-full bg-brand-red/40 animate-bounce"></div>}
                    </div>
                )}

                {!hasMore && shows.length > 0 && (
                    <div className="w-full text-center py-12 text-gray-500 font-medium">
                        You've reached the end of the collection.
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default TvShowPage;