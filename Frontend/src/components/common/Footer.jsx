import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clapperboard,
  Sparkles,
  Tv,
  Film,
  Compass,
  Bookmark,
  Heart,
  History,
  ShieldCheck,
  Send,
  Globe,
  Radio,
  CheckCircle2,
  Volume2,
} from 'lucide-react';
import { FaTwitter, FaDiscord, FaInstagram, FaYoutube, FaGithub } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSubscribed(true);
    toast.success('Welcome to the FLIX Cinephile Club! Check your inbox for your premiere guide.');
    setNewsletterEmail('');
  };

  return (
    <footer className="relative border-t border-white/[0.08] bg-[#070709] text-white selection:bg-[#8b5cf6] selection:text-white">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-[#8b5cf6]/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/2 right-1/4 h-80 w-80 rounded-full bg-[#d62b70]/10 blur-[140px]" />

      {/* 1. Cinema Highlights Strip */}
      <div className="border-b border-white/[0.06] bg-white/[0.015] py-8">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#a78bfa]">
                <Film className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  4K Ultra HD
                </h4>
                <p className="text-[11px] text-white/50">Master graded visuals</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#f472b6]">
                <Volume2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Dolby Atmos
                </h4>
                <p className="text-[11px] text-white/50">Spatial object sound</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-emerald-400">
                <Radio className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Adaptive CDN
                </h4>
                <p className="text-[11px] text-white/50">Zero buffer pipeline</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-amber-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  TMDB Live Sync
                </h4>
                <p className="text-[11px] text-white/50">Real-time cinema data</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation & Information Grid */}
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 lg:gap-8">
          {/* Brand & Elevator Column (4 cols) */}
          <div className="space-y-6 sm:col-span-2 md:col-span-3 lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2.5 outline-none">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#8b5cf6] to-[#d62b70] p-0.5 shadow-lg shadow-[#8b5cf6]/20">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#090909]">
                  <Clapperboard className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-wider text-white">
                  FLIX
                </span>
                <span className="rounded border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#a78bfa]">
                  CINEMA
                </span>
              </div>
            </Link>

            <p className="max-w-sm text-xs leading-relaxed text-white/60">
              The premier streaming & discovery architecture for cinema connoisseurs. Explore critically-acclaimed films, deep cast dossiers, and personalized sensory profiles in pristine fidelity.
            </p>

            {/* Platform Status Pill */}
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-[11px] font-semibold text-emerald-300 w-fit">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>All Streaming Clusters Operational</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="FLIX Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-[#8b5cf6] hover:bg-[#8b5cf6]/10 hover:text-white"
              >
                <FaTwitter className="h-4 w-4" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                aria-label="FLIX Discord"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-[#8b5cf6] hover:bg-[#8b5cf6]/10 hover:text-white"
              >
                <FaDiscord className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="FLIX Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-[#d62b70] hover:bg-[#d62b70]/10 hover:text-white"
              >
                <FaInstagram className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="FLIX YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-[#d62b70] hover:bg-[#d62b70]/10 hover:text-white"
              >
                <FaYoutube className="h-4 w-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="FLIX GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-white hover:bg-white/10 hover:text-white"
              >
                <FaGithub className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Discovery Column (2 cols) */}
          <div className="space-y-4 lg:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Discover
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-white/60">
              <li>
                <Link to="/movies" className="transition hover:text-white hover:translate-x-0.5 inline-block">
                  Trending Movies
                </Link>
              </li>
              <li>
                <Link to="/tv" className="transition hover:text-white hover:translate-x-0.5 inline-block">
                  Top Rated Series
                </Link>
              </li>
              <li>
                <Link to="/genres" className="transition hover:text-white hover:translate-x-0.5 inline-block">
                  Genre Discovery Vault
                </Link>
              </li>
              <li>
                <Link to="/movies?sort=vote_average.desc" className="transition hover:text-white hover:translate-x-0.5 inline-block">
                  Award Winners
                </Link>
              </li>
              <li>
                <Link to="/movies?sort=release_date.desc" className="transition hover:text-white hover:translate-x-0.5 inline-block">
                  Now In Theaters
                </Link>
              </li>
            </ul>
          </div>

          {/* Cinephile Hub (2 cols) */}
          <div className="space-y-4 lg:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Cinephile Hub
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-white/60">
              <li>
                <Link to="/watchlist" className="transition hover:text-white hover:translate-x-0.5 inline-block">
                  My Watchlist
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="transition hover:text-white hover:translate-x-0.5 inline-block">
                  Favorites List
                </Link>
              </li>
              <li>
                <Link to="/history" className="transition hover:text-white hover:translate-x-0.5 inline-block">
                  Viewing Timeline
                </Link>
              </li>
              <li>
                <Link to="/profile" className="transition hover:text-white hover:translate-x-0.5 inline-block">
                  Sensory Calibration
                </Link>
              </li>
              <li>
                <Link to="/admin" className="transition hover:text-[#a78bfa] hover:translate-x-0.5 inline-block">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter / VIP Club (4 cols) */}
          <div className="space-y-4 sm:col-span-2 md:col-span-3 lg:col-span-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#8b5cf6]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                The Friday Premiere
              </h4>
            </div>
            <p className="text-xs leading-relaxed text-white/60">
              Receive curated weekend recommendations, festival breakdowns, and 4K remaster spotlights directly in your inbox.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>You're subscribed to the Cinephile VIP Dispatch!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your cinephile email..."
                  required
                  className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/40 outline-none transition focus:border-[#8b5cf6] focus:bg-white/10"
                />
                <button
                  type="submit"
                  className="flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#8b5cf6]/25 transition hover:brightness-110 active:scale-95"
                >
                  <span>Join</span>
                  <Send className="h-3 w-3" />
                </button>
              </form>
            )}

            <p className="text-[10px] text-white/40">
              Zero spam. Unsubscribe anytime. Powered by FLIX Curation Engine.
            </p>
          </div>
        </div>

        {/* 3. Bottom Legal & TMDB Attributions Bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.08] pt-8 text-[11px] text-white/45 md:flex-row">
          <p>© {new Date().getFullYear()} FLIX Streaming Platform. Crafted for Cinema Lovers.</p>

          <p className="max-w-md text-center text-[10px] text-white/35">
            This product uses the TMDB API but is not officially endorsed or certified by TMDB.
          </p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-white/50">
              <Globe className="h-3 w-3 text-[#8b5cf6]" />
              <span>Global (EN)</span>
            </span>
            <span className="text-white/20">•</span>
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-white transition">
              Privacy
            </a>
            <span className="text-white/20">•</span>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-white transition">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
