import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBookmark,
  FiChevronLeft,
  FiChevronRight,
  FiPlay,
  FiStar,
  FiTrendingUp,
} from 'react-icons/fi';
import { getTrendingMedia } from '../../features/movies/service/movie.api.js';
import { useAuth } from '../../features/auth/hooks/useAuth';

const HeroSlider = () => {
  const { isAuthenticated } = useAuth();
  const [trendingItems, setTrendingItems] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

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
    if (
      trendingItems.length < 2
      || isPaused
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return undefined;

    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % trendingItems.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, trendingItems.length]);

  if (isLoading) {
    return <div className="h-[65vh] animate-pulse bg-white/10 sm:h-[70vh] md:h-[85vh]" role="status" aria-label="Loading featured titles" />;
  }
  if (isError) {
    return <p className="px-6 py-8 text-sm text-red-400" role="alert">Could not load featured titles.</p>;
  }
  if (!trendingItems.length) return null;

  return (
    <section
      aria-label="Featured titles"
      className="hero-slider relative left-1/2 isolate h-[78svh] min-h-[560px] w-screen max-w-none -translate-x-1/2 overflow-hidden bg-[#090909] sm:h-[82svh] md:h-[min(88svh,900px)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
      }}
    >
        {trendingItems.map((item, index) => {
          const title = item.title || item.name;
          const year = (item.release_date || item.first_air_date)?.substring(0, 4);
          const rating = item.vote_average?.toFixed(1);
          const mediaRoute = item.media_type === 'tv' ? 'tv' : 'movie';
          const primaryCta = isAuthenticated ? `/${mediaRoute}/${item.id}` : '/signup';
          const secondaryCta = isAuthenticated ? '/movies' : '/login';
          const overview =
            item.overview?.length > 180
              ? item.overview.substring(0, 180) + '...'
              : item.overview;
          const isActive = index === activeSlide;

          return (
            <div
              key={item.id}
              aria-hidden={!isActive}
              inert={!isActive}
              className={`hero-slide absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
                isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              <div className="relative h-full w-full select-none">
                <div className="absolute inset-0">
                  <img
                    src={`https://image.tmdb.org/t/p/original${item.backdrop_path}`}
                    alt=""
                    className="hero-backdrop h-full w-full object-cover object-[58%_center]"
                    loading={isActive ? 'eager' : 'lazy'}
                    fetchPriority={isActive ? 'high' : 'auto'}
                    draggable="false"
                  />
                </div>

                <div className="hero-overlay hero-overlay-v absolute inset-0" aria-hidden="true" />
                <div className="hero-overlay hero-overlay-h absolute inset-0" aria-hidden="true" />
                <div className="hero-overlay hero-overlay-top absolute inset-x-0 top-0 h-32" aria-hidden="true" />

                <div className="absolute inset-0 flex flex-col justify-end px-5 pb-28 sm:px-8 sm:pb-32 md:px-12 lg:px-[max(3rem,calc((100vw-80rem)/2))]">
                  <div className="hero-copy max-w-2xl">
                    <div className="mb-4 flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md sm:text-[11px]">
                        <FiTrendingUp size={13} className="text-accent" />
                        Trending today
                      </span>
                      <span className="h-1 w-1 rounded-full bg-white/40" aria-hidden="true" />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65 sm:text-[11px]">
                        {item.media_type === 'tv' ? 'TV Series' : 'Movie'}
                      </span>
                    </div>

                    <h1 className="hero-title mb-4 max-w-3xl text-4xl font-bold leading-[0.98] tracking-tight text-white drop-shadow-lg sm:text-5xl md:mb-5 md:text-6xl lg:text-7xl">
                      {title}
                    </h1>

                    <div className="hero-meta mb-4 flex flex-wrap items-center gap-2.5 text-sm text-white/80 sm:mb-5 sm:gap-3">
                      {rating && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/25 bg-black/35 px-3 py-1.5 font-semibold text-amber-200 backdrop-blur-md">
                          <FiStar size={13} className="fill-amber-300 text-amber-300" />
                          <span>{rating}</span>
                          <span className="text-white/50">/ 10</span>
                        </span>
                      )}
                      {year && <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 backdrop-blur-md">{year}</span>}
                    </div>

                    <p className="hero-overview mb-6 line-clamp-3 max-w-xl text-sm leading-relaxed text-white/75 drop-shadow sm:mb-7 sm:text-base">
                      {overview || 'Description not available'}
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        to={primaryCta}
                        className="btn-primary cta-pulse inline-flex min-h-12 items-center gap-2 rounded-lg px-6 py-3 text-sm shadow-lg shadow-black/25 transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:px-7 sm:text-base"
                      >
                        <FiPlay size={16} className="fill-current" />
                        <span className="font-semibold">{isAuthenticated ? 'Watch Now' : 'Get Started'}</span>
                      </Link>
                      <Link
                        to={secondaryCta}
                        className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-white/25 bg-white/[0.08] px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-white/45 hover:bg-white/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-[0.98] sm:text-base"
                      >
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

      {trendingItems.length > 1 && (
        <div className="absolute inset-x-0 bottom-5 z-10 flex items-center justify-between px-5 sm:bottom-7 sm:px-8 md:bottom-9 md:px-12 lg:px-[max(3rem,calc((100vw-80rem)/2))]">
          <div className="flex items-center gap-2.5" role="group" aria-label="Choose featured title">
            {trendingItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`Show ${item.title || item.name}`}
                aria-current={index === activeSlide ? 'true' : undefined}
                className={`hero-dot ${index === activeSlide ? 'hero-dot-active' : ''}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-xs font-medium tabular-nums text-white/65 sm:inline" aria-hidden="true">
              <span className="text-white">{String(activeSlide + 1).padStart(2, '0')}</span>
              <span className="mx-1.5 text-white/35">/</span>
              {String(trendingItems.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={() => setActiveSlide((current) => (current - 1 + trendingItems.length) % trendingItems.length)}
              aria-label="Previous featured title"
              className="hero-nav-button"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setActiveSlide((current) => (current + 1) % trendingItems.length)}
              aria-label="Next featured title"
              className="hero-nav-button"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .hero-slider {
          --hero-ink: rgba(5, 8, 14, 0.94);
          --hero-mid: rgba(5, 8, 14, 0.62);
        }
        .hero-backdrop {
          animation: hero-image-in 1.1s cubic-bezier(0.2, 0.65, 0.3, 1) both;
        }
        .hero-copy {
          animation: hero-copy-in 0.7s cubic-bezier(0.2, 0.65, 0.3, 1) both;
        }
        .hero-overlay-v {
          background: linear-gradient(
            to top,
            var(--hero-ink) 0%,
            rgba(5, 8, 14, 0.84) 18%,
            var(--hero-mid) 53%,
            rgba(5, 8, 14, 0.08) 100%
          );
        }
        .hero-overlay-h {
          background: linear-gradient(
            to right,
            rgba(5, 8, 14, 0.76) 0%,
            rgba(5, 8, 14, 0.55) 34%,
            rgba(5, 8, 14, 0.12) 76%,
            rgba(5, 8, 14, 0) 100%
          );
        }
        .hero-overlay-top {
          background: linear-gradient(
            to bottom,
            rgba(5, 8, 14, 0.42) 0%,
            rgba(5, 8, 14, 0) 100%
          );
        }

        [data-theme="light"] .hero-overlay-v {
          background: linear-gradient(
            to top,
            rgba(10, 16, 30, 0.94) 0%,
            rgba(10, 16, 30, 0.78) 22%,
            rgba(10, 16, 30, 0.52) 54%,
            rgba(10, 16, 30, 0.08) 100%
          );
        }
        [data-theme="light"] .hero-overlay-h {
          background: linear-gradient(
            to right,
            rgba(10, 16, 30, 0.78) 0%,
            rgba(10, 16, 30, 0.5) 36%,
            rgba(10, 16, 30, 0.12) 76%,
            rgba(10, 16, 30, 0) 100%
          );
        }
        [data-theme="light"] .hero-overlay-top {
          background: linear-gradient(
            to bottom,
            rgba(10, 16, 30, 0.48) 0%,
            rgba(10, 16, 30, 0) 100%
          );
        }
        .hero-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.42);
          cursor: pointer;
          transition: width 0.3s ease, background-color 0.3s ease, transform 0.3s ease;
        }
        .hero-dot:hover {
          background: rgba(255, 255, 255, 0.85);
          transform: scale(1.15);
        }
        .hero-dot:focus-visible,
        .hero-nav-button:focus-visible {
          outline: 2px solid white;
          outline-offset: 4px;
        }
        [data-theme="light"] .hero-dot {
          background: rgba(255, 255, 255, 0.5);
        }
        [data-theme="light"] .hero-dot:hover {
          background: rgba(255, 255, 255, 0.9);
        }
        .hero-dot-active {
          width: 24px;
          background: var(--color-accent, #8b5cf6);
        }
        .hero-nav-button {
          display: inline-flex;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.32);
          color: white;
          backdrop-filter: blur(12px);
          transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }
        .hero-nav-button:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.14);
        }
        @keyframes hero-image-in {
          from { transform: scale(1.04); }
          to { transform: scale(1); }
        }
        @keyframes hero-copy-in {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .hero-overlay-h {
            background: linear-gradient(to right, rgba(5, 8, 14, 0.54), rgba(5, 8, 14, 0.12));
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-backdrop,
          .hero-copy {
            animation: none;
          }
          .hero-dot,
          .hero-nav-button {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSlider;