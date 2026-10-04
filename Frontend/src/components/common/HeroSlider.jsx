import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlay, FiBookmark, FiStar } from 'react-icons/fi';
import { getTrendingMedia } from '../../features/movies/service/movie.api.js';
import { useAuth } from '../../features/auth/hooks/useAuth';

const HeroSlider = () => {
  const { isAuthenticated } = useAuth();
  const [trendingItems, setTrendingItems] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let active = true;

    getTrendingMedia('all', 'day')
      .then(({ data }) => {
        if (!active) return;
        setTrendingItems((data?.data?.results || [])
          .filter((item) => item.backdrop_path)
          .slice(0, 8));
      })
      .catch((error) => {
        console.error('Could not load trending titles for the hero slider.', error);
        if (active) setIsError(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (trendingItems.length < 2) return undefined;
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % trendingItems.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [trendingItems.length]);

  if (isLoading) {
    return <div className="h-[65vh] animate-pulse bg-white/10 sm:h-[70vh] md:h-[85vh]" role="status" aria-label="Loading featured titles" />;
  }
  if (isError) {
    return <p className="px-6 py-8 text-sm text-red-400" role="alert">Could not load featured titles.</p>;
  }
  if (!trendingItems.length) return null;

  return (
    <div className="relative left-1/2 h-[65vh] w-screen max-w-none -translate-x-1/2 overflow-hidden sm:h-[70vh] md:h-[85vh]">
        {trendingItems.map((item, index) => {
          const title = item.title || item.name;
          const year = (item.release_date || item.first_air_date)?.substring(0, 4);
          const rating = item.vote_average?.toFixed(1);
          const mediaRoute = item.media_type === 'tv' ? 'tv' : 'movie';
          const primaryCta = isAuthenticated ? `/${mediaRoute}/${item.id}` : '/signup';
          const secondaryCta = isAuthenticated ? '/movies' : '/login';
          const overview =
            item.overview?.length > 200
              ? item.overview.substring(0, 200) + '...'
              : item.overview;

          return (
            <div
              key={item.id}
              aria-hidden={index !== activeSlide}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === activeSlide ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              <div className="w-full h-full relative select-none">
                {/* Backdrop */}
                <div className="absolute inset-0">
                  <img
                    src={`https://image.tmdb.org/t/p/original${item.backdrop_path}`}
                    alt=""
                    className="w-full h-full object-cover object-top"
                    loading="eager"
                    draggable="false"
                  />
                </div>

                {/* Readability overlays */}
                <div className="hero-overlay hero-overlay-v absolute inset-0" />
                <div className="hero-overlay hero-overlay-h absolute inset-0" />
                <div className="hero-overlay hero-overlay-bottom absolute bottom-0 left-0 right-0 h-32" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end container-custom pb-20 sm:pb-24 md:pb-32">
                  <div className="max-w-2xl">
                    {/* Media type badge */}
                    <span className="inline-block mb-3 text-[10px] font-semibold tracking-[0.2em] uppercase text-accent border border-accent/40 bg-black/25 backdrop-blur-sm px-2.5 py-1 rounded">
                      {item.media_type === 'tv' ? 'TV Series' : 'Movie'}
                    </span>

                    {/* Title */}
                    <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-['Melodrama'] font-bold text-white leading-[1.1] mb-4 tracking-tight">
                      {title}
                    </h1>

                    {/* Metadata */}
                    <div className="hero-meta flex flex-wrap items-center gap-3 text-sm text-white/85 mb-5">
                      {rating && (
                        <span className="flex items-center gap-1 text-warning font-mono font-semibold bg-warning/20 px-2 py-0.5 rounded border border-warning/40">
                          <FiStar size={12} className="fill-warning" />
                          {rating}
                        </span>
                      )}
                      {year && <span className="text-white/85">{year}</span>}
                    </div>

                    {/* Overview */}
                    <p className="hero-overview font-['Zodiak'] text-white/80 text-sm md:text-base leading-relaxed mb-8 max-w-lg line-clamp-3">
                      {overview || 'Description not available'}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        to={primaryCta}
                        className="btn-primary cta-pulse flex items-center gap-2 px-7 py-3 text-sm md:text-base"
                      >
                        <FiPlay size={16} className="fill-primary" />
                        <span className="font-semibold">{isAuthenticated ? 'Watch Now' : 'Get Started'}</span>
                      </Link>
                      <Link to={secondaryCta} className="flex items-center gap-2 px-5 py-3 bg-black/25 hover:bg-black/35 text-white text-sm md:text-base font-medium rounded-md border border-white/20 hover:border-white/35 transition-all backdrop-blur-sm active:scale-95">
                        <FiBookmark size={16} />
                        <span>{isAuthenticated ? 'Browse Movies' : 'Sign In'}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

      <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-start gap-1.5 px-5 sm:bottom-8 md:bottom-12 md:px-12">
        {trendingItems.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveSlide(index)}
            aria-label={`Show featured title ${index + 1}`}
            aria-current={index === activeSlide ? 'true' : undefined}
            className={`hero-dot ${index === activeSlide ? 'hero-dot-active' : ''}`}
          />
        ))}
      </div>

      <style>{`
        .hero-overlay-v {
          background: linear-gradient(
            to top,
            rgba(5, 10, 18, 0.88) 0%,
            rgba(5, 10, 18, 0.5) 48%,
            rgba(5, 10, 18, 0) 100%
          );
        }
        .hero-overlay-h {
          background: linear-gradient(
            to right,
            rgba(5, 10, 18, 0.82) 0%,
            rgba(5, 10, 18, 0.28) 50%,
            rgba(5, 10, 18, 0) 100%
          );
        }
        .hero-overlay-bottom {
          background: linear-gradient(
            to top,
            rgba(5, 10, 18, 0.85) 0%,
            rgba(5, 10, 18, 0) 100%
          );
        }

        [data-theme="light"] .hero-overlay-v {
          background: linear-gradient(
            to top,
            rgba(10, 16, 30, 0.76) 0%,
            rgba(10, 16, 30, 0.38) 50%,
            rgba(10, 16, 30, 0.04) 100%
          );
        }
        [data-theme="light"] .hero-overlay-h {
          background: linear-gradient(
            to right,
            rgba(10, 16, 30, 0.7) 0%,
            rgba(10, 16, 30, 0.22) 52%,
            rgba(10, 16, 30, 0) 100%
          );
        }
        [data-theme="light"] .hero-overlay-bottom {
          background: linear-gradient(
            to top,
            rgba(10, 16, 30, 0.58) 0%,
            rgba(10, 16, 30, 0) 100%
          );
        }

        .hero-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.38);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .hero-dot:hover {
          background: rgba(255, 255, 255, 0.7);
        }
        [data-theme="light"] .hero-dot {
          background: rgba(15, 23, 42, 0.28);
        }
        [data-theme="light"] .hero-dot:hover {
          background: rgba(15, 23, 42, 0.5);
        }
        .hero-dot-active {
          width: 28px !important;
          background: var(--color-accent) !important;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default HeroSlider;