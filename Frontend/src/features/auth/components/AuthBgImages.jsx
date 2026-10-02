// src/features/auth/components/AuthBgImages.jsx
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const BASE = "https://ik.imagekit.io/dhyh95euj/movie%20posters";
const poster = (n) => `${BASE}/PC${n}.jpg`;

const COLUMNS = [
  { dir: "up", posters: [1, 19, 9, 18, 4, 11].map(poster) },
  { dir: "down", posters: [14, 7, 11, 28, 13, 23].map(poster) },
  { dir: "up", posters: [18, 3, 11, 22, 1, 17].map(poster) },
];

const AuthBgImages = () => {
  const root = useRef(null);

  useGSAP(
    () => {
      // Each column holds its list twice, so moving it by 50% loops seamlessly.
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(".poster-up", { yPercent: 0 }, { yPercent: -50, duration: 40, repeat: -1, ease: "none" });
        gsap.fromTo(".poster-down", { yPercent: -50 }, { yPercent: 0, duration: 40, repeat: -1, ease: "none" });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="absolute inset-y-0 left-0 right-0 lg:right-1/2 z-0 flex gap-4 overflow-hidden p-4"
    >
      {COLUMNS.map((col, c) => (
        <div
          key={c}
          className={`poster-${col.dir} flex w-1/3 flex-col gap-4 pb-4 will-change-transform`}
        >
          {[...col.posters, ...col.posters].map((src, i) => (
            <div key={i} className="aspect-[2/3] shrink-0 overflow-hidden rounded-xl shadow-2xl">
              <img src={src} alt="" decoding="async" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      ))}
      {/* Fade posters into the form panel + top/bottom edges */}
      <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-transparent to-bg-dark/80 lg:block" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg-dark/60 via-transparent to-bg-dark/60" />
    </div>
  );
};

export default AuthBgImages;
