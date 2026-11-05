import { memo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import MovieCard, { MovieCardSkeleton } from './MovieCard';

const ContentRow = ({
  title,
  items,
  isLoading,
  isError,
  seeAllLink,
  mediaType = 'movie',
}) => {
  const rowRef = useRef(null);

  const scrollRow = (direction) => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return (
      <section className="w-full py-6 md:py-8" aria-label={`Loading ${title}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 h-6 w-44 animate-pulse rounded-lg bg-white/10" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <MovieCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 text-xs text-red-400" role="alert">
        Could not load {title.toLowerCase()}.
      </div>
    );
  }

  if (!items?.length) return null;

  return (
    <section className="relative w-full py-6 md:py-8 group/row overflow-hidden">
      {/* Section Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between mb-4 md:mb-5">
        <div className="flex items-center gap-2.5">
          <span className="h-5 w-1 rounded-full bg-gradient-to-b from-[#8b5cf6] to-[#d62b70]" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {title}
          </h2>
        </div>

        {seeAllLink && (
          <Link
            to={seeAllLink}
            className="group/link flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#8b5cf6] hover:text-[#d62b70] transition-colors"
          >
            <span>See more</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
          </Link>
        )}
      </div>

      {/* Row container with fade gradient and nav arrows */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Horizontal scroll track */}
        <div
          ref={rowRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 scroll-smooth scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="w-[145px] sm:w-[175px] md:w-[195px] lg:w-[205px] shrink-0"
            >
              <MovieCard item={item} mediaType={mediaType} />
            </div>
          ))}
        </div>

        {/* Optional Right Edge Fade Gradient for smooth visual bleed */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[#090909] to-transparent hidden sm:block z-10" />

        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => scrollRow(-1)}
          aria-label="Scroll left"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/75 text-white backdrop-blur-md opacity-0 transition-all hover:bg-black group-hover/row:opacity-100 shadow-xl cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => scrollRow(1)}
          aria-label="Scroll right"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/75 text-white backdrop-blur-md opacity-0 transition-all hover:bg-black group-hover/row:opacity-100 shadow-xl cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
};

export default memo(ContentRow);
