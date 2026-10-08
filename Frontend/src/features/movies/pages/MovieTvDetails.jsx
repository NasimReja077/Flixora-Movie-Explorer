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
  const cast = details.credits?.cast || [];
  const recommendations = details.recommendations?.results || [];
  const reviews = details.reviews?.results || [];

  const getPosterUrl = (path, size = 'w342') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

  const openTitle = (item) => {
    const recommendedMediaType = item.media_type || mediaType;
    navigate(`/${recommendedMediaType === 'tv' ? 'tv' : 'movie'}/${item.id}`);
  };

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

        <section className="border-t border-white/10 py-8" aria-labelledby="cast-heading">
          <h2 id="cast-heading" className="text-2xl font-bold">Cast</h2>
          {cast.length ? (
            <div className="mt-5 flex gap-4 overflow-x-auto pb-4">
              {cast.slice(0, 20).map((person) => {
                const profileUrl = getPosterUrl(person.profile_path, 'w185');
                return (
                  <article key={person.cast_id || person.credit_id || person.id} className="w-36 shrink-0">
                    {profileUrl ? (
                      <img
                        src={profileUrl}
                        alt={person.name}
                        loading="lazy"
                        className="aspect-[2/3] w-full rounded-xl bg-white/5 object-cover"
                      />
                    ) : (
                      <div
                        role="img"
                        aria-label={`No photo available for ${person.name}`}
                        className="flex aspect-[2/3] w-full items-center justify-center rounded-xl bg-white/5 text-3xl font-bold text-white/30"
                      >
                        {person.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <h3 className="mt-3 truncate text-sm font-semibold">{person.name}</h3>
                    <p className="mt-1 truncate text-xs text-white/55">
                      {person.character || person.job || 'Cast'}
                    </p>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/55">Cast information is not available.</p>
          )}
        </section>

        <section className="border-t border-white/10 py-8" aria-labelledby="recommendations-heading">
          <h2 id="recommendations-heading" className="text-2xl font-bold">You may also like</h2>
          {recommendations.length ? (
            <div className="mt-5 flex gap-4 overflow-x-auto pb-4">
              {recommendations.slice(0, 20).map((item) => {
                const posterUrl = getPosterUrl(item.poster_path);
                const recommendedTitle = item.title || item.name;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openTitle(item)}
                    className="w-40 shrink-0 text-left transition hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt=""
                        loading="lazy"
                        className="aspect-[2/3] w-full rounded-xl bg-white/5 object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[2/3] w-full items-center justify-center rounded-xl bg-white/5 px-3 text-center text-sm text-white/45">
                        No poster available
                      </div>
                    )}
                    <span className="mt-3 block truncate text-sm font-semibold">{recommendedTitle}</span>
                    {item.vote_average != null && (
                      <span className="mt-1 block text-xs text-white/55">
                        ★ {Number(item.vote_average).toFixed(1)} / 10
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/55">No recommendations available.</p>
          )}
        </section>

        <section className="border-t border-white/10 py-8" aria-labelledby="reviews-heading">
          <h2 id="reviews-heading" className="text-2xl font-bold">Reviews</h2>
          {reviews.length ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {reviews.slice(0, 10).map((review) => {
                const rating = review.author_details?.rating;
                return (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold">{review.author || 'TMDB user'}</h3>
                      {rating != null && (
                        <span className="text-sm font-medium text-amber-300">
                          ★ {rating} / 10
                        </span>
                      )}
                    </div>
                    {review.created_at && (
                      <p className="mt-1 text-xs text-white/45">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    )}
                    <p className="mt-4 whitespace-pre-line text-sm leading-6 text-white/70">
                      {review.content}
                    </p>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/55">No reviews available.</p>
          )}
        </section>
      </section>
    </main>
  );
};

export default MovieTvDetails;