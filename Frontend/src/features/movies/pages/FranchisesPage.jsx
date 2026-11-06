import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Film, Layers3, Sparkles, Tv } from 'lucide-react';
import { motion } from 'framer-motion';
import MovieCard, { MovieCardSkeleton } from '../../../components/common/MovieCard.jsx';
import { discoverMovies, discoverTVShows, getCollectionDetails } from '../service/movie.api.js';

const FRANCHISES = [
  { id: '1241', collectionId: 1241, title: 'Harry Potter', description: 'Return to the Wizarding World and follow Harry’s story from the beginning.', color: 'from-indigo-950 via-violet-900 to-slate-950' },
  { id: '86311', collectionId: 86311, title: 'The Avengers', description: 'Watch Earth’s Mightiest Heroes assemble and face their greatest threats.', color: 'from-red-950 via-orange-950 to-slate-950' },
  { id: '10', collectionId: 10, companyId: '1', title: 'Star Wars', description: 'Travel across the galaxy through the Skywalker saga, films, and series.', color: 'from-blue-950 via-slate-800 to-black' },
  { id: '119', collectionId: 119, title: 'The Lord of the Rings', description: 'Journey through Middle-earth from the Shire to the fires of Mount Doom.', color: 'from-emerald-950 via-amber-950 to-black' },
  { id: '328', collectionId: 328, title: 'Jurassic Park', description: 'Enter the park and explore the full dinosaur adventure in release order.', color: 'from-lime-950 via-green-950 to-slate-950' },
  { id: '131635', collectionId: 131635, title: 'The Hunger Games', description: 'Follow Katniss Everdeen’s story from the first games to the rebellion.', color: 'from-rose-950 via-red-950 to-black' },
  { id: '10194', collectionId: 10194, title: 'Toy Story', description: 'Join Woody, Buzz, and the toys on every adventure, from the beginning.', color: 'from-sky-950 via-blue-900 to-indigo-950' },
  { id: '9485', collectionId: 9485, title: 'Fast & Furious', description: 'Follow the crew through every high-speed chapter of the saga.', color: 'from-orange-950 via-neutral-900 to-black' },
  { id: '556', collectionId: 556, title: 'Spider-Man', description: 'Follow the web-slinger through his movie adventures in release order.', color: 'from-red-950 via-blue-950 to-slate-950' },
  { id: '8650', collectionId: 8650, title: 'Transformers', description: 'Watch the war between the Autobots and Decepticons unfold across the films.', color: 'from-amber-950 via-slate-800 to-blue-950' },
  { id: 'marvel', companyId: '420|38679', title: 'Marvel', description: 'Explore Marvel movies and series across the multiverse, in release order.', color: 'from-red-950 via-rose-900 to-slate-950' },
  { id: 'dc', companyId: '128064|9993', title: 'DC', description: 'Discover DC heroes and stories across movies and television.', color: 'from-blue-950 via-indigo-900 to-slate-950' },
];

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Could not load this franchise. Please try again.';

export default function FranchisesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('collection');
  const selectedMediaType = searchParams.get('media') === 'tv' ? 'tv' : 'movie';
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(1);
  const [retryVersion, setRetryVersion] = useState(0);

  const selectedFranchise = useMemo(
    () => FRANCHISES.find((franchise) => franchise.id === selectedId),
    [selectedId]
  );
  const franchiseKey = selectedId ? `${selectedId}:${selectedMediaType}` : null;
  const currentResult =
    result?.franchiseKey === franchiseKey && result?.retryVersion === retryVersion
      ? result
      : null;
  const loading = Boolean(selectedFranchise && !currentResult);
  const loadingMore = Boolean(currentResult && page > currentResult.page);

  useEffect(() => {
    if (!selectedId) {
      return undefined;
    }

    let active = true;

    const request = selectedFranchise?.collectionId && selectedMediaType === 'movie'
      ? getCollectionDetails(selectedFranchise.collectionId)
      : selectedFranchise?.companyId
        ? (selectedMediaType === 'tv' ? discoverTVShows : discoverMovies)({
            page,
            with_companies: selectedFranchise.companyId,
            sort_by: selectedMediaType === 'tv' ? 'first_air_date.asc' : 'release_date.asc',
          })
        : Promise.reject(new Error('TV series are not available for this franchise yet.'));

    request
      .then(({ data }) => {
        if (!active) return;
        if (selectedFranchise?.collectionId && selectedMediaType === 'movie') {
          setResult({
            franchiseKey,
            retryVersion,
            page: 1,
            collection: data.data,
            results: [],
            pagination: { page: 1, totalPages: 1, totalResults: data.data.parts?.length || 0 },
            error: '',
          });
        } else {
          const response = data.data;
          setResult((previous) => {
            const previousResults =
              page > 1 && previous?.franchiseKey === franchiseKey
                ? previous.results
                : [];
            return {
              franchiseKey,
              retryVersion,
              page,
              collection: null,
              results: [...previousResults, ...(response.results || [])],
              pagination: response.pagination || { page: 1, totalPages: 1, totalResults: 0 },
              error: '',
            };
          });
        }
      })
      .catch((requestError) => {
        if (active) {
          setResult((previous) => ({
            franchiseKey,
            retryVersion,
            page,
            collection: previous?.franchiseKey === franchiseKey ? previous.collection : null,
            results: previous?.franchiseKey === franchiseKey ? previous.results : [],
            pagination: previous?.franchiseKey === franchiseKey
              ? previous.pagination
              : { page: 1, totalPages: 1, totalResults: 0 },
            error: getErrorMessage(requestError),
          }));
        }
      });

    return () => {
      active = false;
    };
  }, [franchiseKey, page, retryVersion, selectedFranchise, selectedId, selectedMediaType]);

  const titles = useMemo(
    () =>
      [...(currentResult?.collection?.parts || currentResult?.results || [])].sort((a, b) => {
        const dateA = selectedMediaType === 'tv' ? a.first_air_date : a.release_date;
        const dateB = selectedMediaType === 'tv' ? b.first_air_date : b.release_date;
        return (dateA || '9999-12-31').localeCompare(dateB || '9999-12-31')
          || (a.title || a.name || '').localeCompare(b.title || b.name || '');
      }),
    [currentResult, selectedMediaType]
  );

  const chooseFranchise = (id) => {
    setSearchParams({ collection: String(id) });
    setPage(1);
  };

  const showFranchiseList = () => {
    setSearchParams({});
    setPage(1);
  };

  const chooseMediaType = (media) => {
    setSearchParams({ collection: selectedId, media });
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-[#090909] pb-20 text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        {currentResult?.collection?.backdrop_path && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/w1280${currentResult.collection.backdrop_path})`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/80 to-[#090909]/60" />
        <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-12 md:px-12 md:pb-16">
          {selectedFranchise ? (
            <>
              <button
                type="button"
                onClick={showFranchiseList}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                All Franchises
              </button>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#c4b5fd]">
                <Layers3 className="h-4 w-4" />
                Media Franchise
              </div>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
                {currentResult?.collection?.name || selectedFranchise.title}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/65 sm:text-base">
                {currentResult?.collection?.overview || selectedFranchise.description}
              </p>
              {selectedFranchise.companyId && (
                <div className="mt-6 inline-flex rounded-full border border-white/10 bg-black/30 p-1">
                  {[
                    { id: 'movie', label: 'Movies', Icon: Film },
                    { id: 'tv', label: 'TV Series', Icon: Tv },
                  ].map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => chooseMediaType(id)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                        selectedMediaType === id
                          ? 'bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] text-white'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              )}
              {((currentResult?.collection && selectedMediaType === 'movie') || selectedFranchise.companyId) && (
                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-semibold text-white/70">
                  {selectedMediaType === 'tv'
                    ? <Tv className="h-4 w-4 text-[#a78bfa]" />
                    : <Film className="h-4 w-4 text-[#a78bfa]" />}
                  {(currentResult?.pagination?.totalResults || 0).toLocaleString()} {selectedMediaType === 'tv' ? 'series' : 'movies'} · chronological release order
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#c4b5fd]">
                <Sparkles className="h-4 w-4" />
                Watch the story unfold
              </div>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
                Movie Franchises
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/65 sm:text-base">
                Pick a saga to see every movie arranged by its original release date. Start at the beginning and watch the whole story.
              </p>
            </>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 md:px-12">
        {!selectedFranchise ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FRANCHISES.map((franchise, index) => (
              <motion.button
                key={franchise.id}
                type="button"
                onClick={() => chooseFranchise(franchise.id)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`group relative flex min-h-56 flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${franchise.color} p-6 text-left transition hover:-translate-y-1 hover:border-[#8b5cf6]/50 hover:shadow-xl hover:shadow-[#8b5cf6]/10`}
              >
                <div className="absolute -right-7 -top-8 h-36 w-36 rounded-full border border-white/10 transition duration-500 group-hover:scale-125 group-hover:border-white/20" />
                <div className="absolute -right-2 top-7 h-20 w-20 rounded-full border border-white/10" />
                <span className="relative mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-black/20 text-[#ddd6fe]">
                  <Layers3 className="h-4 w-4" />
                </span>
                <h2 className="relative text-xl font-black text-white">{franchise.title}</h2>
                <p className="relative mt-2 line-clamp-2 text-xs leading-relaxed text-white/65">
                  {franchise.description}
                </p>
                <span className="relative mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#c4b5fd] transition group-hover:gap-3">
                  Explore movies <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </motion.button>
            ))}
          </div>
        ) : currentResult?.error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <p className="font-semibold text-red-200">{currentResult.error}</p>
            <button
              type="button"
              onClick={() => setRetryVersion((version) => version + 1)}
              className="mt-4 rounded-full border border-red-300/30 px-5 py-2 text-xs font-bold text-white transition hover:bg-red-500/20"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 8 }, (_, index) => <MovieCardSkeleton key={index} />)}
          </div>
        ) : titles.length ? (
          <div>
            <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-white/55">
              {selectedMediaType === 'tv' ? <Tv className="h-4 w-4 text-[#a78bfa]" /> : <CalendarDays className="h-4 w-4 text-[#a78bfa]" />}
              Sorted by {selectedMediaType === 'tv' ? 'first air date' : 'theatrical release date'}
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {titles.map((title) => (
                <MovieCard key={title.id} movie={title} mediaType={selectedMediaType} />
              ))}
            </div>
            {page < (currentResult?.pagination?.totalPages || 1) && (
              <div className="mt-12 flex justify-center">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => setPage((current) => current + 1)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-bold text-white transition hover:border-[#8b5cf6]/50 hover:bg-white/10 disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                  {!loadingMore && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-16 text-center">
            {selectedMediaType === 'tv' ? <Tv className="mx-auto h-10 w-10 text-white/30" /> : <Film className="mx-auto h-10 w-10 text-white/30" />}
            <h2 className="mt-4 text-lg font-bold">No {selectedMediaType === 'tv' ? 'series' : 'movies'} found</h2>
            <p className="mt-1 text-sm text-white/50">This franchise has no {selectedMediaType === 'tv' ? 'series' : 'movies'} available right now.</p>
          </div>
        )}
      </section>
    </main>
  );
}
