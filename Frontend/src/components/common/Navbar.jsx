import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Clapperboard,
  Search,
  Menu,
  X,
  Home,
  Film,
  Tv,
  Heart,
  Bookmark,
  History,
  LogOut,
  ChevronDown,
  Tags,
  Layers3,
  UserCircle2,
  ShieldCheck,
  Sparkles,
  Command,
  SlidersHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { useWatchlist } from '../../features/watchlist/hooks/useWatchlist.js';
import { useFavorites } from '../../features/favorites/hooks/useFavorites.js';

const PRIMARY_NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/movies', label: 'Movies', icon: Film },
  { to: '/tv', label: 'TV Shows', icon: Tv },
  { to: '/genres', label: 'Genres', icon: Tags },
  { to: '/franchises', label: 'Franchises', icon: Layers3 },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items: watchlistItems } = useWatchlist();
  const { items: favoriteItems } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'admin';
  const displayName =
    user?.username || user?.fullname || user?.name || user?.email?.split('@')[0] || 'Cinephile';
  const initial = displayName.charAt(0).toUpperCase();

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Outside click & Escape to close profile dropdown
  useEffect(() => {
    if (!dropdownOpen) return undefined;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  // Global keyboard shortcut to focus search: Ctrl+K or /
  useEffect(() => {
    const handleGlobalKey = (e) => {
      // Don't trigger if user is actively typing in another input/textarea
      if (
        ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) &&
        document.activeElement !== searchInputRef.current
      ) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;
    navigate(`/search?q=${encodeURIComponent(cleanQuery)}`);
    setQuery('');
    searchInputRef.current?.blur();
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen
          ? 'border-b border-white/[0.08] bg-[#090909]/85 py-3.5 backdrop-blur-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]'
          : 'bg-gradient-to-b from-[#090909]/90 via-[#090909]/40 to-transparent py-4 md:py-5.5'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 md:px-12">
        {/* Left: Brand Logo & Main Nav */}
        <div className="flex items-center gap-8 lg:gap-10">
          <Link
            to="/"
            className="group flex items-center gap-2.5 outline-none"
            aria-label="FLIX Home"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#8b5cf6] to-[#d62b70] p-0.5 shadow-lg shadow-[#8b5cf6]/20 transition-transform duration-300 group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#090909]">
                <Clapperboard className="h-5 w-5 text-white transition-colors group-hover:text-[#a78bfa]" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-2xl font-black tracking-wider text-transparent group-hover:from-white group-hover:to-[#a78bfa] transition">
                FLIX
              </span>
              <span className="rounded border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#a78bfa]">
                ULTRA
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-1.5 lg:flex">
            {PRIMARY_NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-wide transition duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white shadow-inner'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-3.5 w-3.5 ${
                        isActive ? 'text-[#8b5cf6]' : 'text-white/50'
                      }`}
                    />
                    <span>{label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-full border border-white/10 bg-gradient-to-r from-[#8b5cf6]/20 to-[#d62b70]/20 -z-10"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            {/* Admin Quick Pill if Admin */}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold tracking-wide transition duration-200 ${
                    isActive
                      ? 'border border-[#8b5cf6]/50 bg-[#8b5cf6]/20 text-[#c4b5fd]'
                      : 'border border-[#8b5cf6]/20 bg-[#8b5cf6]/10 text-[#a78bfa] hover:bg-[#8b5cf6]/20'
                  }`
                }
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#a78bfa]" />
                <span>Admin Portal</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* Right: Search Bar & Account Controls */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Interactive Search Bar with Keyboard Shortcut */}
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            className={`hidden md:flex items-center gap-2 rounded-full border px-3.5 py-1.5 transition-all duration-300 ${
              searchFocused
                ? 'w-64 lg:w-72 border-[#8b5cf6]/70 bg-white/10 shadow-[0_0_20px_rgba(139,92,246,0.25)] ring-1 ring-[#8b5cf6]/50'
                : 'w-48 lg:w-56 border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <Search className="h-4 w-4 shrink-0 text-white/40" />
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search cinema..."
              className="w-full bg-transparent text-xs text-white placeholder-white/40 outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-white/40 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <span className="hidden items-center gap-0.5 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-white/40 lg:flex">
                <Command className="h-2.5 w-2.5" />K
              </span>
            )}
          </form>

          {/* User Account State */}
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="group flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 p-1 pr-3 transition duration-200 hover:border-white/25 hover:bg-white/10 active:scale-95"
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
              >
                {/* Avatar with Gradient Rim */}
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#d62b70] p-0.5 shadow-md">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#121212] text-xs font-black text-white">
                    {initial}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-[#090909] bg-emerald-400" />
                </div>

                <div className="hidden flex-col text-left md:flex">
                  <span className="max-w-[110px] truncate text-xs font-bold text-white group-hover:text-[#a78bfa] transition">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-white/40">
                    {isAdmin ? 'Admin' : 'Cinephile'}
                  </span>
                </div>

                <ChevronDown
                  className={`hidden h-3.5 w-3.5 text-white/40 transition-transform duration-200 md:block ${
                    dropdownOpen ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {/* Enhanced Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    role="menu"
                    className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-white/15 bg-[#121212]/95 p-2 shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl z-50"
                  >
                    {/* User summary card */}
                    <div className="flex items-center gap-3 border-b border-white/10 px-3 py-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#d62b70] text-sm font-black text-white shadow-md">
                        {initial}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-xs font-extrabold text-white">
                          {displayName}
                        </span>
                        <span className="truncate text-[11px] text-white/45">
                          {user?.email}
                        </span>
                        <span className="mt-1 w-fit rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#a78bfa]">
                          {isAdmin ? 'System Admin' : 'VIP Cinephile'}
                        </span>
                      </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        role="menuitem"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                      >
                        <UserCircle2 className="h-4 w-4 text-[#8b5cf6]" />
                        <span>Profile & Settings</span>
                      </Link>

                      <Link
                        to="/watchlist"
                        role="menuitem"
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                      >
                        <div className="flex items-center gap-2.5">
                          <Bookmark className="h-4 w-4 text-[#c4b5fd]" />
                          <span>My Watchlist</span>
                        </div>
                        {watchlistItems?.length > 0 && (
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
                            {watchlistItems.length}
                          </span>
                        )}
                      </Link>

                      <Link
                        to="/favorites"
                        role="menuitem"
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                      >
                        <div className="flex items-center gap-2.5">
                          <Heart className="h-4 w-4 text-[#d62b70]" />
                          <span>Favorites List</span>
                        </div>
                        {favoriteItems?.length > 0 && (
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
                            {favoriteItems.length}
                          </span>
                        )}
                      </Link>

                      <Link
                        to="/history"
                        role="menuitem"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                      >
                        <History className="h-4 w-4 text-emerald-400" />
                        <span>Viewing History</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          role="menuitem"
                          className="flex items-center gap-2.5 rounded-xl border border-[#8b5cf6]/20 bg-[#8b5cf6]/10 px-3 py-2 text-xs font-bold text-[#c4b5fd] transition hover:bg-[#8b5cf6]/20"
                        >
                          <ShieldCheck className="h-4 w-4 text-[#a78bfa]" />
                          <span>Admin Console</span>
                        </Link>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-white/10 pt-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold text-white transition hover:border-white/25 hover:bg-white/10"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-[#8b5cf6]/25 transition hover:brightness-110 active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Navigation"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:border-white/20 hover:text-white lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/10 bg-[#090909]/95 px-6 pb-8 pt-5 backdrop-blur-2xl lg:hidden"
          >
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="mb-5 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5">
              <Search className="h-4 w-4 text-white/40" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, series, genres..."
                className="w-full bg-transparent text-sm text-white placeholder-white/40 outline-none"
              />
            </form>

            {/* Navigation links */}
            <div className="flex flex-col gap-1.5">
              <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-white/40">
                Menu
              </span>
              {PRIMARY_NAV.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-[#8b5cf6]/20 to-[#d62b70]/20 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 text-[#8b5cf6]" />
                  <span>{label}</span>
                </NavLink>
              ))}

              {isAuthenticated && (
                <>
                  <span className="mt-4 px-3 text-[11px] font-bold uppercase tracking-wider text-white/40">
                    My Account
                  </span>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <UserCircle2 className="h-4 w-4 text-[#8b5cf6]" />
                    <span>Profile & Settings</span>
                  </Link>
                  <Link
                    to="/watchlist"
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <div className="flex items-center gap-3">
                      <Bookmark className="h-4 w-4 text-[#c4b5fd]" />
                      <span>Watchlist</span>
                    </div>
                    {watchlistItems?.length > 0 && (
                      <span className="rounded-full bg-[#8b5cf6] px-2 py-0.5 text-xs font-bold text-white">
                        {watchlistItems.length}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/favorites"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <Heart className="h-4 w-4 text-[#d62b70]" />
                    <span>Favorites</span>
                  </Link>
                  <Link
                    to="/history"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <History className="h-4 w-4 text-emerald-400" />
                    <span>Watch History</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="mt-2 flex items-center gap-3 rounded-xl border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-3 py-2 text-sm font-bold text-[#c4b5fd]"
                    >
                      <ShieldCheck className="h-4 w-4 text-[#a78bfa]" />
                      <span>Admin Operations</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
