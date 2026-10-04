import { memo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import MovieCard from './MovieCard';

const ContentRow = ({ title, items, isLoading, isError, seeAllLink, mediaType }) => {
  const rowRef = useRef(null);

  if (isLoading) {
    return (
      <section className="w-full py-6 md:py-10" aria-label={`Loading ${title}`}>
        <div className="mb-5 h-7 w-48 animate-pulse rounded bg-white/10" />
        <div className="flex gap-4 overflow-hidden px-3 md:px-6 lg:px-12">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-60 w-40 shrink-0 animate-pulse rounded-xl bg-white/10 sm:h-72 sm:w-48" />
          ))}
        </div>
      </section>
    );
  }
  if (isError) {
    return (
      <p className="px-3 py-6 text-sm text-red-400 md:px-6 lg:px-12" role="alert">
        Could not load {title.toLowerCase()}.
      </p>
    );
  }
  if (!items?.length) return null;

  const scrollRow = (direction) => {
    rowRef.current?.scrollBy({
      left: direction * rowRef.current.clientWidth * 0.8,
      behavior: 'smooth',
    });
  };

  return (
    <section className="w-full py-6 md:py-10 relative group/row">
      {/* Section Header */}
      <div className="pl-3 pr-1 md:pl-6 md:pr-3 lg:pl-12 lg:pr-4 flex items-center justify-between mb-5 md:mb-6">
        <h2 className="text-xl md:text-2xl font-display font-semibold text-text-primary tracking-tight ">
          {title}
        </h2>
        {seeAllLink && (
          <Link
            to={seeAllLink}
            className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors group/link"
          >
            See All
            <FiArrowRight className="transition-transform group-hover/link:translate-x-0.5" size={14} />
          </Link>
        )}
      </div>

      <div className="relative">
        <div
          ref={rowRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-5 md:px-6 lg:px-12"
        >
          {items.map((item) => (
            <div key={item.id} className="w-[160px] shrink-0 snap-start sm:w-[200px] md:w-[220px] lg:w-[230px]">
              <MovieCard item={item} mediaType={mediaType} />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollRow(-1)}
          className="hidden md:flex absolute left-1 lg:left-4 top-1/2 -translate-y-[60%] z-20 w-10 h-10 items-center justify-center rounded-full bg-primary/80 backdrop-blur-sm border border-border text-text-primary hover:bg-elevated hover:border-accent hover:text-accent transition-all shadow-elevated opacity-0 group-hover/row:opacity-100 cursor-pointer disabled:opacity-0"
          aria-label="Previous slide"
        >
          <FiChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={() => scrollRow(1)}
          className="hidden md:flex absolute right-1 lg:right-4 top-1/2 -translate-y-[60%] z-20 w-10 h-10 items-center justify-center rounded-full bg-primary/80 backdrop-blur-sm border border-border text-text-primary hover:bg-elevated hover:border-accent hover:text-accent transition-all shadow-elevated opacity-0 group-hover/row:opacity-100 cursor-pointer disabled:opacity-0"
          aria-label="Next slide"
        >
          <FiChevronRight size={20} />
        </button>
      </div>
    </section>
  );
};

export default memo(ContentRow);