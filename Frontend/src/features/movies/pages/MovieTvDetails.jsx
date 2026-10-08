import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMovieDetails, getTVShowDetails } from '../service/movie.api.js';
import MovieVideosHeroSection from '../components/MovieVideosHeroSection.jsx';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { useWatchlist } from '../../watchlist/hooks/useWatchlist.js';

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
  const mediaType = pathname.startsWith('/tv') ? 'tv' : 'movie';
  const requestKey = `${mediaType}:${id}`;
  const [result, setResult] = useState({
    key: null,
    details: null,
    error: '',
  });

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

  const isCurrentResult = result.key === requestKey;
  const details = isCurrentResult ? result.details : null;
  const error = isCurrentResult ? result.error : '';

  if (!details && !error) {
    return <main className="min-h-screen animate-pulse bg-primary" role="status">Loading title details...</main>;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-primary px-6 py-24 text-center text-red-400" role="alert">
        {error}
      </main>
    );
  }

  const title = details.title || details.name;
  const releaseDate = details.release_date || details.first_air_date;
  const isInWatchlist = Boolean(isInWatchlistById[id]);

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
            title,
            posterPath: details.poster_path || '',
            voteAverage: Number(details.vote_average || 0),
            releaseDate: releaseDate || '',
          },
        }).unwrap();
        toast.success('Added to your watchlist');
      }
    } catch (error) {
      toast.error(error || 'Could not update your watchlist');
    }
  };

  return (
    <main className="min-h-screen bg-primary text-white">
      <MovieVideosHeroSection
        key={requestKey}
        mediaItem={{ ...details, mediaType }}
        secondaryAction={(
          <button
            type="button"
            onClick={handleWatchlistClick}
            disabled={Boolean(user) && (!watchlistInitialized || watchlistLoading)}
            className="h-12 flex-1 rounded-full border border-white/20 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-wait disabled:opacity-60 md:h-14 md:flex-none md:px-8"
          >
            <span className="inline-flex items-center gap-2">
              {isInWatchlist
                ? <BookmarkCheck className="h-4 w-4 text-[#c4b5fd]" />
                : <Bookmark className="h-4 w-4" />}
              {isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            </span>
          </button>
        )}
      />
      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-12">
        <div className="border-t border-white/10 py-8">
          <h2 className="text-xl font-bold">About {title}</h2>
          {details.overview && (
            <p className="mt-3 max-w-4xl leading-7 text-white/70">{details.overview}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {details.genres?.map((genre) => (
              <span
                key={genre.id}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/75"
              >
                {genre.name}
              </span>
            ))}
          </div>
          <dl className="mt-8 grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {releaseDate && (
              <div>
                <dt className="text-white/45">{mediaType === 'tv' ? 'First aired' : 'Released'}</dt>
                <dd className="mt-1 font-medium">{releaseDate}</dd>
              </div>
            )}
            {details.runtime && (
              <div>
                <dt className="text-white/45">Runtime</dt>
                <dd className="mt-1 font-medium">{details.runtime} minutes</dd>
              </div>
            )}
            {details.number_of_seasons && (
              <div>
                <dt className="text-white/45">Seasons</dt>
                <dd className="mt-1 font-medium">{details.number_of_seasons}</dd>
              </div>
            )}
            {details.status && (
              <div>
                <dt className="text-white/45">Status</dt>
                <dd className="mt-1 font-medium">{details.status}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>
    </main>
  );
};

export default MovieTvDetails;