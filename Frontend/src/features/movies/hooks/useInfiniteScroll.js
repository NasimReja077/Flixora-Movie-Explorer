import { useEffect, useRef } from "react";

const useInfiniteScroll = (onLoadMore, enabled) => {
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!enabled || !target || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(target);

    return () => observer.disconnect();
  }, [enabled, onLoadMore]);

  return targetRef;
};

export default useInfiniteScroll;
