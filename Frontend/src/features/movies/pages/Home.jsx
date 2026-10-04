import { useEffect, useState } from 'react';
import HeroSlider from '../../../components/common/HeroSlider';
import ContentRow from '../../../components/common/ContentRow';
import {
  discoverMovies,
  discoverTVShows,
  getPopularMovies,
  getPopularTVShows,
  getTopRatedMovies,
  getTopRatedTVShows,
  getTrendingMedia,
} from '../service/movie.api.js';

const Home = () => {
  const [rows, setRows] = useState({});

  useEffect(() => {
    let active = true;
    const requests = [
      ['trending', 'Trending Now', () => getTrendingMedia('all', 'day')],
      ['topRatedMovies', 'Top Rated Movies', () => getTopRatedMovies()],
      ['popularMovies', 'Popular Movies', () => getPopularMovies()],
      ['popularTv', 'Popular TV Shows', () => getPopularTVShows()],
      ['topRatedTv', 'Top Rated TV', () => getTopRatedTVShows()],
      ['actionMovies', 'Action Movies', () => discoverMovies({ with_genres: 28, sort_by: 'popularity.desc' })],
      ['indianCinema', 'Indian Cinema', () => discoverMovies({ with_origin_country: 'IN', sort_by: 'popularity.desc' })],
      ['bestAnime', 'Best Anime', () => discoverTVShows({ with_origin_country: 'JP', with_genres: 16, sort_by: 'popularity.desc' })],
    ];

    requests.forEach(([key, title, request]) => {
      request()
        .then(({ data }) => {
          if (!active) return;
          setRows((current) => ({
            ...current,
            [key]: {
              items: data?.data?.results || [],
              isLoading: false,
              isError: false,
            },
          }));
        })
        .catch((error) => {
          console.error(`Could not load ${title.toLowerCase()}.`, error);
          if (!active) return;
          setRows((current) => ({
            ...current,
            [key]: { items: [], isLoading: false, isError: true },
          }));
        });
    });

    return () => {
      active = false;
    };
  }, []);

  return (
      <main className="min-h-screen bg-primary pt-18 md:pt-20 overflow-x-clip">
        {/* Hero Slider */}
        <HeroSlider />

        {/* Content Rows */}
        <div className="relative z-10 flex flex-col">
          <ContentRow
            title="Trending Now"
            items={rows.trending?.items}
            isLoading={!rows.trending}
            isError={rows.trending?.isError}
            seeAllLink="/movies"
          />

          <ContentRow
            title="Top Rated Movies"
            items={rows.topRatedMovies?.items}
            isLoading={!rows.topRatedMovies}
            isError={rows.topRatedMovies?.isError}
            mediaType="movie"
            seeAllLink="/movies"
          />

          <ContentRow
            title="Popular Movies"
            items={rows.popularMovies?.items}
            isLoading={!rows.popularMovies}
            isError={rows.popularMovies?.isError}
            mediaType="movie"
            seeAllLink="/movies"
          />

          <ContentRow
            title="Popular TV Shows"
            items={rows.popularTv?.items}
            isLoading={!rows.popularTv}
            isError={rows.popularTv?.isError}
            mediaType="tv"
            seeAllLink="/tv"
          />

          <ContentRow
            title="Top Rated TV"
            items={rows.topRatedTv?.items}
            isLoading={!rows.topRatedTv}
            isError={rows.topRatedTv?.isError}
            mediaType="tv"
            seeAllLink="/tv"
          />

          <ContentRow
            title="Action Movies"
            items={rows.actionMovies?.items}
            isLoading={!rows.actionMovies}
            isError={rows.actionMovies?.isError}
            mediaType="movie"
            seeAllLink="/movies"
          />

          <ContentRow
            title="Indian Cinema"
            items={rows.indianCinema?.items}
            isLoading={!rows.indianCinema}
            isError={rows.indianCinema?.isError}
            mediaType="movie"
            seeAllLink="/movies"
          />

          <ContentRow
            title="Best Anime"
            items={rows.bestAnime?.items}
            isLoading={!rows.bestAnime}
            isError={rows.bestAnime?.isError}
            mediaType="tv"
            seeAllLink="/tv"
          />
        </div>
      </main>
  );
};

export default Home;