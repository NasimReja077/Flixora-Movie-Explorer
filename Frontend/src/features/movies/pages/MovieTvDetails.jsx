import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getMovieDetails, getTVShowDetails } from '../service/movie.api.js';

const MovieTvDetails = () => {
  const { id } = useParams();
  const { pathname } = useLocation();
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
  const backdrop = details.backdrop_path
    ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
    : null;
  const releaseDate = details.release_date || details.first_air_date;

  return (
    <main className="min-h-screen bg-primary text-white">
      <section className="relative isolate flex min-h-[70vh] items-end overflow-hidden px-6 pb-12 pt-32 md:min-h-[80vh] md:px-12">
        {backdrop && (
          <img
            src={backdrop}
            alt=""
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-primary via-primary/70 to-black/25" />
        <div className="mx-auto w-full max-w-7xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            {mediaType === 'tv' ? 'TV series' : 'Movie'}
          </p>
          <h1 className="max-w-4xl text-4xl font-black md:text-6xl">{title}</h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/75">
            {releaseDate && <span>{releaseDate.slice(0, 4)}</span>}
            {details.vote_average != null && (
              <span>★ {details.vote_average.toFixed(1)} / 10</span>
            )}
            {details.genres?.map((genre) => <span key={genre.id}>{genre.name}</span>)}
          </div>
          {details.overview && (
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 md:text-lg">
              {details.overview}
            </p>
          )}
        </div>
      </section>
    </main>
  );
};

export default MovieTvDetails;