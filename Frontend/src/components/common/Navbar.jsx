import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Clapperboard,
  Search,
  Menu,
  X,
  Home,
  Film,
  Tv,
  Heart,
  LogOut,
  ChevronDown,
  Tags,
} from "lucide-react";
import { useAuth } from "../../features/auth/hooks/useAuth";

const NAV_LINKS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/movies", label: "Movies", icon: Film },
  { to: "/tv", label: "TV Shows", icon: Tv },
  { to: "/genres", label: "Genres", icon: Tags },
  { to: "/favorites", label: "Favorites", icon: Heart },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [menuState, setMenuState] = useState({ pathname: location.pathname, open: false });
  const [mobileState, setMobileState] = useState({ pathname: location.pathname, open: false });
  const [query, setQuery] = useState("");
  const dropdownRef = useRef(null);

  const menuOpen = menuState.pathname === location.pathname && menuState.open;
  const mobileOpen = mobileState.pathname === location.pathname && mobileState.open;
  const setMenuOpen = useCallback((open) =>
    setMenuState({
      pathname: location.pathname,
      open: typeof open === "function" ? open(menuOpen) : open,
    }), [location.pathname, menuOpen]);
  const setMobileOpen = useCallback((open) =>
    setMobileState({
      pathname: location.pathname,
      open: typeof open === "function" ? open(mobileOpen) : open,
    }), [location.pathname, mobileOpen]);

  const isAuthenticated = Boolean(user);
  const displayName =
    user?.username || user?.fullname || user?.name || user?.email || "Account";
  const initial = displayName.charAt(0).toUpperCase();

  // Solid background after scrolling
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the profile dropdown on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setMenuOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, setMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setQuery("");
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    setMobileOpen(false);
    await logout();
    navigate("/");
  };

  const desktopLinkClass = ({ isActive }) =>
    `relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-medium transition-colors ${
      isActive
        ? "bg-white/10 text-white"
        : "text-[#94a3b8] hover:bg-white/5 hover:text-white"
    }`;

  const searchForm = (className, inputClass, placeholder) => (
    <form onSubmit={handleSearch} role="search" className={className}>
      <Search
        size={16}
        className="shrink-0 text-[#94a3b8]"
        aria-hidden="true"
      />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Search movies and TV shows"
        className={inputClass}
      />
    </form>
  );

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled || mobileOpen
          ? "border-b border-white/5 bg-[#0f0f12]/90 py-3 backdrop-blur-md"
          : "bg-gradient-to-b from-black/70 to-transparent py-4 md:py-5"
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-12"
      >
        {/* Logo + primary links */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="group flex items-center gap-2"
            aria-label="FLIX home"
          >
            <Clapperboard className="h-7 w-7 text-[#d62b70] transition-transform group-hover:scale-110" />
            <span className="text-2xl font-black tracking-wider text-[#d62b70]">
              FLIX
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={desktopLinkClass}>
                {({ isActive }) => (
                  <>
                    <Icon
                      size={15}
                      className={isActive ? "text-[#d62b70]" : ""}
                      aria-hidden="true"
                    />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Search + account */}
        <div className="flex items-center gap-3">
          {searchForm(
            "hidden items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 transition-colors focus-within:border-white/30 lg:flex",
            "w-48 bg-transparent text-sm text-white outline-none placeholder:text-[#94a3b8] xl:w-64",
            "Search...",
          )}

          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Account menu"
                className="flex items-center gap-2 rounded-full border border-white/10 bg-[#1b1b1e] p-1 pr-2 transition hover:border-[#d62b70]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d62b70]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#d62b70] to-[#8b5cf6] text-xs font-bold text-white">
                  {initial}
                </span>
                <span className="hidden max-w-[120px] truncate text-xs font-medium text-[#e4e1e6] md:block">
                  {displayName}
                </span>
                <ChevronDown
                  size={14}
                  className={`hidden text-[#94a3b8] transition-transform md:block ${menuOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#16161a]/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
                >
                  <div className="border-b border-white/5 px-3 py-2.5">
                    <p className="text-[11px] font-semibold text-[#94a3b8]">
                      Signed in as
                    </p>
                    <p className="mt-0.5 truncate text-xs font-bold text-white">
                      {user?.email || displayName}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-1">
                    <Link
                      to="/favorites"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#e4e1e6] transition-colors hover:bg-white/5"
                    >
                      <Heart size={14} aria-hidden="true" className="text-[#ff5f8f]" />
                      Favorite list
                    </Link>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <LogOut size={14} aria-hidden="true" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="rounded-full px-4 py-1.5 text-xs font-semibold text-[#e4e1e6] transition hover:bg-white/5 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-gradient-to-r from-[#d62b70] to-[#8b5cf6] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_2px_15px_rgba(214,43,112,0.4)] transition hover:brightness-110"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label={
              mobileOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#16161a] text-[#94a3b8] transition-colors hover:text-white lg:hidden"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/5 px-4 pb-5 pt-4 lg:hidden">
          {searchForm(
            "mb-4 flex items-center gap-2 rounded-full border border-white/10 bg-[#16161a] px-4 py-2.5",
            "w-full bg-transparent text-sm text-white outline-none placeholder:text-[#94a3b8]/70",
            "Search movies and TV shows",
          )}

          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/10 font-semibold text-[#ffb1c4]"
                      : "text-[#94a3b8] hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={17} aria-hidden="true" />
                {label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <>
                <p className="mt-3 px-4 text-[11px] font-semibold text-[#94a3b8]">
                  Your account
                </p>
                <Link
                  to="/favorites"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-[#e4e1e6] transition-colors hover:bg-white/5"
                >
                  <Heart size={17} aria-hidden="true" className="text-[#ff5f8f]" />
                  Favorites
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <LogOut size={17} aria-hidden="true" />
                  Logout
                </button>
              </>
            ) : (
              <div className="mt-4 flex flex-col gap-2 border-t border-white/5 pt-4">
                <Link
                  to="/login"
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-white/5"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="rounded-xl bg-gradient-to-r from-[#d62b70] to-[#8b5cf6] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
