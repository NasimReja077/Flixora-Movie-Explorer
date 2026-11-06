import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Sparkles,
  TrendingUp,
  Star,
  Popcorn,
} from 'lucide-react';
import HeroSlider from '../../../components/common/HeroSlider';
import ContentRow from '../../../components/common/ContentRow';
import {
  discoverMovies,
  discoverTVShows,
  getNowPlayingMovies,
  getPopularMovies,
  getPopularTVShows,
  getTopRatedMovies,
  getTopRatedTVShows,
  getTrendingMedia,
} from '../service/movie.api.js';

// Quick stat pills shown between hero and content rows
const PLATFORM_STATS = [
  { icon: Flame, label: 'Trending Daily', value: '500K+', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  { icon: Star, label: 'TMDB Titles', value: '1M+', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { icon: TrendingUp, label: 'New Releases', value: 'Weekly', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { icon: Sparkles, label: 'HD Quality', value: '4K UHD', color: 'text-[#a78bfa]', bg: 'bg-[#8b5cf6]/10 border-[#8b5cf6]/20' },
];

const Home = () => {
  const [rows, setRows] = useState({});

  useEffect(() => {
    let active = true;
    const requests = [
      ['trending', 'Trending Now', () => getTrendingMedia('all', 'day')],
      ['nowPlayingMovies', 'Now in Theaters', () => getNowPlayingMovies()],
      ['popularMovies', 'Popular Movies', () => getPopularMovies()],
      ['topRatedMovies', 'Top Rated Movies', () => getTopRatedMovies()],
      ['popularTv', 'Popular TV Shows', () => getPopularTVShows()],
      ['topRatedTv', 'Top Rated TV Series', () => getTopRatedTVShows()],
      ['actionMovies', 'Action & Adventure', () => discoverMovies({ with_genres: 28, sort_by: 'popularity.desc' })],
      ['indianCinema', 'Indian Cinema', () => discoverMovies({ with_origin_country: 'IN', sort_by: 'popularity.desc' })],
      ['bestAnime', 'Best Anime Series', () => discoverTVShows({ with_origin_country: 'JP', with_genres: 16, sort_by: 'popularity.desc' })],
      ['sciifi', 'Science Fiction', () => discoverMovies({ with_genres: 878, sort_by: 'vote_average.desc', 'vote_count.gte': 500 })],
    ];

    requests.forEach(([key, label, request]) => {
      request()
        .then(({ data }) => {
          if (!active) return;
          setRows((prev) => ({
            ...prev,
            [key]: { items: data?.data?.results || [], isLoading: false, isError: false },
          }));
        })
        .catch((err) => {
          console.error(`Could not load ${label.toLowerCase()}.`, err);
          if (!active) return;
          setRows((prev) => ({ ...prev, [key]: { items: [], isLoading: false, isError: true } }));
        });
    });

    return () => { active = false; };
  }, []);

  return (
    <main className="min-h-screen bg-[#090909] text-white overflow-x-clip">
      {/* Hero section — no extra top padding; Navbar is fixed and transparent over it */}
      <HeroSlider />

      {/* ── Platform Stats Banner ───────────────────────────────── */}
      <div className="relative z-10 border-y border-white/[0.06] bg-white/[0.015] py-5 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Stat pills */}
            <div className="flex flex-wrap items-center gap-3">
              {PLATFORM_STATS.map(({ icon: Icon, label, value, color, bg }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${bg}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                  <span className="text-white/80">{label}:</span>
                  <span className={color}>{value}</span>
                </div>
              ))}
            </div>

            {/* Quick Browse Links */}
            <div className="flex items-center gap-2">
              <Link
                to="/movies"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold text-white/70 transition hover:border-white/25 hover:text-white"
              >
                Browse Movies
              </Link>
              <Link
                to="/genres"
                className="rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] px-4 py-1.5 text-xs font-bold text-white shadow-sm shadow-[#8b5cf6]/30 transition hover:brightness-110"
              >
                Genre Vault →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Rows ────────────────────────────────────────── */}
      <div className="relative z-10 mt-6 flex flex-col space-y-1 pb-20">
        <ContentRow
          title="🔥 Trending Now"
          items={rows.trending?.items}
          isLoading={!rows.trending}
          isError={rows.trending?.isError}
          seeAllLink="/movies?category=popular"
        />

        <ContentRow
          title="🎟️ Now In Theaters"
          items={rows.nowPlayingMovies?.items}
          isLoading={!rows.nowPlayingMovies}
          isError={rows.nowPlayingMovies?.isError}
          mediaType="movie"
          seeAllLink="/movies?category=now_playing"
        />

        <ContentRow
          title="🎬 Popular Movies"
          items={rows.popularMovies?.items}
          isLoading={!rows.popularMovies}
          isError={rows.popularMovies?.isError}
          mediaType="movie"
          seeAllLink="/movies?category=popular"
        />

        <ContentRow
          title="⭐ Top Rated Movies"
          items={rows.topRatedMovies?.items}
          isLoading={!rows.topRatedMovies}
          isError={rows.topRatedMovies?.isError}
          mediaType="movie"
          seeAllLink="/movies?category=top_rated"
        />

        <ContentRow
          title="📺 Popular TV Shows"
          items={rows.popularTv?.items}
          isLoading={!rows.popularTv}
          isError={rows.popularTv?.isError}
          mediaType="tv"
          seeAllLink="/tv?category=popular"
        />

        <ContentRow
          title="🏆 Top Rated TV Series"
          items={rows.topRatedTv?.items}
          isLoading={!rows.topRatedTv}
          isError={rows.topRatedTv?.isError}
          mediaType="tv"
          seeAllLink="/tv?category=top_rated"
        />

        <ContentRow
          title="💥 Action & Adventure"
          items={rows.actionMovies?.items}
          isLoading={!rows.actionMovies}
          isError={rows.actionMovies?.isError}
          mediaType="movie"
          seeAllLink="/genres?genre=28&type=movie"
        />

        <ContentRow
          title="🚀 Science Fiction"
          items={rows.sciifi?.items}
          isLoading={!rows.sciifi}
          isError={rows.sciifi?.isError}
          mediaType="movie"
          seeAllLink="/genres?genre=878&type=movie"
        />

        <ContentRow
          title="🎭 Indian Cinema"
          items={rows.indianCinema?.items}
          isLoading={!rows.indianCinema}
          isError={rows.indianCinema?.isError}
          mediaType="movie"
          seeAllLink="/movies"
        />

        <ContentRow
          title="🌸 Best Anime Series"
          items={rows.bestAnime?.items}
          isLoading={!rows.bestAnime}
          isError={rows.bestAnime?.isError}
          mediaType="tv"
          seeAllLink="/genres?genre=16&type=tv"
        />
      </div>
    </main>
  );
};

export default Home;
