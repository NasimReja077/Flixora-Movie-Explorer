import { useEffect, useState } from "react";
import {
  Activity,
  Ban,
  Film,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
  X,
  Search,
  CloudDownload,
  Star,
  CheckCircle,
  AlertTriangle,
  Zap,
  Radio,
  SlidersHorizontal,
} from "lucide-react";
import { useAdmin } from "../hooks/useAdmin.js";
import { searchTMDB, getMovieDetails } from "../../movies/service/movie.api.js";
import toast from "react-hot-toast";

const tabs = [
  { id: "overview", label: "Admin Overview", icon: Activity },
  { id: "movies", label: "Catalog Manager", icon: Film },
  { id: "reviews", label: "Reviews Moderation", icon: AlertTriangle },
  { id: "users", label: "Users & Tiers", icon: Users },
];

const emptyMovie = {
  tmdbId: "",
  title: "",
  category: "movie",
  posterUrl: "",
  releaseDate: "",
  rating: "",
  description: "",
};

const pageButtonClass =
  "rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40";

const AdminPage = () => {
  const {
    movies,
    users,
    moviePagination,
    userPagination,
    stats,
    loading,
    error,
    fetchAdminMovies,
    addAdminMovie,
    updateAdminMovie,
    deleteAdminMovie,
    fetchAdminUsers,
    toggleUserBan,
    deleteAdminUser,
    fetchAdminStats,
    clearAdminError,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState("overview");
  const [moviePage, setMoviePage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [movieForm, setMovieForm] = useState(emptyMovie);
  const [editingMovieId, setEditingMovieId] = useState(null);

  // TMDB Import Modal State
  const [isTmdbModalOpen, setIsTmdbModalOpen] = useState(false);
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [tmdbSearching, setTmdbSearching] = useState(false);
  const [tmdbSearchResults, setTmdbSearchResults] = useState([]);

  // Catalog search / filter state
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("all");

  // Reviews moderation sample list
  const [moderationReviews, setModerationReviews] = useState([
    {
      id: "rev-1",
      author: "Elena Rostova",
      movieTitle: "Chronos: Singularity",
      rating: 9,
      spoiler: true,
      status: "pending",
      content:
        "The finale twist where Aaron discovers he was actually transmitting from the orbital hub in 2088 completely blew my mind! Best climax this season.",
      date: "Today, 14:22",
    },
    {
      id: "rev-2",
      author: "Kaelen Vance",
      movieTitle: "Vesper Mirage",
      rating: 6,
      spoiler: false,
      status: "pending",
      content:
        "Visually stunning score, but pacing suffered heavily in Act 2. Streaming bit-rate was top tier on 4K HDR though.",
      date: "Yesterday",
    },
    {
      id: "rev-3",
      author: "Marcus Ray",
      movieTitle: "Neural Nexus 2049",
      rating: 10,
      spoiler: true,
      status: "approved",
      content:
        "A masterpiece of dystopian sci-fi. The acoustic sub-bass transients throughout the second act sequence redefine spatial immersion on FLIX.",
      date: "2 days ago",
    },
  ]);

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  useEffect(() => {
    fetchAdminMovies({ page: moviePage, limit: 10 });
  }, [fetchAdminMovies, moviePage]);

  useEffect(() => {
    fetchAdminUsers({ page: userPage, limit: 10 });
  }, [fetchAdminUsers, userPage]);

  const updateMovieField = (event) => {
    setMovieForm((form) => ({ ...form, [event.target.name]: event.target.value }));
  };

  const resetMovieForm = () => {
    setMovieForm(emptyMovie);
    setEditingMovieId(null);
  };

  const handleMovieSubmit = async (event) => {
    event.preventDefault();
    clearAdminError();
    const payload = {
      ...movieForm,
      tmdbId: Number(movieForm.tmdbId),
      rating: movieForm.rating === "" ? 0 : Number(movieForm.rating),
      releaseDate: movieForm.releaseDate || undefined,
      posterUrl: movieForm.posterUrl || undefined,
      description: movieForm.description || undefined,
    };

    try {
      if (editingMovieId) {
        await updateAdminMovie({ movieId: editingMovieId, movieData: payload }).unwrap();
        toast.success("Title updated successfully");
      } else {
        await addAdminMovie(payload).unwrap();
        toast.success("Title added to FLIX catalog");
      }
      resetMovieForm();
      setActiveTab("movies");
      await Promise.all([
        fetchAdminMovies({ page: moviePage, limit: 10 }),
        fetchAdminStats(),
      ]);
    } catch {
      toast.error("Could not save movie");
    }
  };

  const startEditingMovie = (movie) => {
    setMovieForm({
      tmdbId: String(movie.tmdbId || ""),
      title: movie.title || "",
      category: movie.category || "movie",
      posterUrl: movie.posterUrl || "",
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().slice(0, 10) : "",
      rating: movie.rating == null ? "" : String(movie.rating),
      description: movie.description || "",
    });
    setEditingMovieId(movie._id);
    setActiveTab("movies");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteMovie = async (movie) => {
    if (!window.confirm(`Delete "${movie.title}" from the catalog?`)) return;
    try {
      await deleteAdminMovie(movie._id).unwrap();
      toast.success("Movie removed from catalog");
      await Promise.all([
        fetchAdminMovies({ page: moviePage, limit: 10 }),
        fetchAdminStats(),
      ]);
    } catch {
      toast.error("Could not delete movie");
    }
  };

  const handleToggleBan = async (user) => {
    try {
      await toggleUserBan(user._id).unwrap();
      toast.success(user.isBanned ? "User account unbanned" : "User account banned");
    } catch {
      toast.error("Could not toggle user ban");
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete the account for ${user.email}? This cannot be undone.`)) return;
    try {
      await deleteAdminUser(user._id).unwrap();
      toast.success("User account deleted");
      await Promise.all([
        fetchAdminUsers({ page: userPage, limit: 10 }),
        fetchAdminStats(),
      ]);
    } catch {
      toast.error("Could not delete user account");
    }
  };

  // TMDB Live Search & Import
  const handleTmdbSearch = async (e) => {
    e?.preventDefault();
    if (!tmdbQuery.trim()) return;

    setTmdbSearching(true);
    try {
      // Check if user input is an exact ID
      if (!isNaN(tmdbQuery.trim())) {
        const { data } = await getMovieDetails(Number(tmdbQuery.trim()));
        if (data.data) {
          setTmdbSearchResults([data.data]);
        }
      } else {
        const { data } = await searchTMDB(tmdbQuery.trim());
        setTmdbSearchResults(data.data?.results || []);
      }
    } catch (err) {
      toast.error("TMDB search query failed");
    } finally {
      setTmdbSearching(false);
    }
  };

  const importTmdbTitle = (tmdbItem) => {
    const isTv = Boolean(tmdbItem.first_air_date || tmdbItem.name);
    setMovieForm({
      tmdbId: String(tmdbItem.id),
      title: tmdbItem.title || tmdbItem.name || "",
      category: isTv ? "tv" : "movie",
      posterUrl: tmdbItem.poster_path
        ? `https://image.tmdb.org/t/p/w500${tmdbItem.poster_path}`
        : "",
      releaseDate: (tmdbItem.release_date || tmdbItem.first_air_date || "").slice(0, 10),
      rating: tmdbItem.vote_average ? String(tmdbItem.vote_average.toFixed(1)) : "8.0",
      description: tmdbItem.overview || "",
    });
    setIsTmdbModalOpen(false);
    setActiveTab("movies");
    toast.success(`Imported "${tmdbItem.title || tmdbItem.name}" metadata. Ready to save.`);
  };

  // Review moderation actions
  const handleApproveReview = (id) => {
    setModerationReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
    );
    toast.success("Critique approved and visible to audience");
  };

  const handleHideReview = (id) => {
    setModerationReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "hidden" } : r))
    );
    toast.success("Critique hidden from public feed");
  };

  const handleDeleteReview = (id) => {
    setModerationReviews((prev) => prev.filter((r) => r.id !== id));
    toast.success("Review deleted");
  };

  // Filter movies in table
  const filteredMovies = movies.filter((m) => {
    const matchesSearch =
      catalogSearch === "" ||
      m.title?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      String(m.tmdbId).includes(catalogSearch);
    const matchesCategory =
      catalogCategory === "all" || (m.category || "movie") === catalogCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8 lg:px-10">
        {/* Platform Control Telemetry Header */}
        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#8b5cf6] text-xs font-bold uppercase tracking-[0.24em]">
              <span className="h-2 w-2 rounded-full bg-[#fbbf24] animate-pulse" />
              Cluster Node: US-EAST-STREAM-04 • Sync v4.18.2
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              Executive Telemetry & Platform Ops
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
              Direct TMDB synchronizer, catalog distribution state, user permissions, and reviews moderation.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setIsTmdbModalOpen(true)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              <CloudDownload className="h-4 w-4" />
              <span>+ Add Movie (TMDB)</span>
            </button>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              Superadmin Mode
            </div>
          </div>
        </header>

        {/* Global Error Notice */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-100"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={clearAdminError}
              aria-label="Dismiss error"
              className="rounded-lg p-1 hover:bg-red-500/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* SECTION 1: KPI Stats Matrix */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Total Movies */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                Catalog Inventory
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8b5cf6]/15 text-[#8b5cf6]">
                <Film className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-white">
                {stats?.totalMovies != null ? Number(stats.totalMovies).toLocaleString() : "12,480"}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-[#8b5cf6]">
                <span className="font-bold">+124</span>
                <span className="text-white/45">indexed this cycle</span>
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-[#8b5cf6]" style={{ width: "78%" }} />
            </div>
          </div>

          {/* Card 2: Active Users */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                Active Streamers
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d62b70]/15 text-[#d62b70]">
                <Users className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-white">
                {stats?.totalUsers != null ? Number(stats.totalUsers).toLocaleString() : "84,210"}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-[#d62b70]">
                <span className="font-bold">+12%</span>
                <span className="text-white/45">MoM expansion</span>
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-[#d62b70]" style={{ width: "84%" }} />
            </div>
          </div>

          {/* Card 3: Total Reviews */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                Audience Reviews
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbbf24]/15 text-[#fbbf24]">
                <Activity className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-white">
                {stats?.totalReviews != null ? Number(stats.totalReviews).toLocaleString() : "34,920"}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs">
                <span className="rounded bg-[#fbbf24]/20 px-2 py-0.5 text-[10px] font-bold text-[#fbbf24]">
                  98 Pending
                </span>
                <span className="text-white/45">awaiting mod</span>
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-[#fbbf24]" style={{ width: "62%" }} />
            </div>
          </div>

          {/* Card 4: Bandwidth / Quality */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                Throughput / QoE
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400/15 text-sky-400">
                <Radio className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-white">
                4.8 <span className="text-sm font-normal text-white/50">Pbps</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-sky-400">
                <span className="font-bold">99.98%</span>
                <span className="text-white/45">optimal buffer health</span>
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-sky-400" style={{ width: "95%" }} />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav aria-label="Admin sections" className="mb-8 flex gap-2 overflow-x-auto border-b border-white/10">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
                activeTab === id
                  ? "border-[#d62b70] text-white bg-white/5 rounded-t-xl"
                  : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <section aria-label="Dashboard overview" className="space-y-8">
            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-xl">
                <h2 className="mb-5 text-lg font-bold flex items-center gap-2">
                  <Film className="h-5 w-5 text-[#8b5cf6]" /> Most Streamed Titles
                </h2>
                <RankedTitles items={stats?.mostViewed} />
              </section>
              <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-xl">
                <h2 className="mb-5 text-lg font-bold flex items-center gap-2">
                  <Star className="h-5 w-5 text-[#fbbf24]" /> Most Favorited
                </h2>
                <RankedTitles items={stats?.mostFavorited} />
              </section>
            </div>

            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#d62b70]" /> Recent Member Ingests
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab("users")}
                  className="text-xs font-semibold text-[#8b5cf6] hover:underline"
                >
                  View full roster →
                </button>
              </div>
              {stats?.recentUsers?.length ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {stats.recentUsers.map((u) => (
                    <div
                      key={u._id}
                      className="min-w-0 rounded-2xl border border-white/5 bg-black/30 p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#d62b70] flex items-center justify-center text-xs font-bold">
                          {u.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <p className="truncate text-sm font-semibold">{u.username || "Member"}</p>
                      </div>
                      <p className="truncate text-xs text-white/45">{u.email}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/45">
                  {loading ? "Loading telemetry..." : "No recent users registered."}
                </p>
              )}
            </section>
          </section>
        )}

        {/* TAB 2: CATALOG MANAGER */}
        {activeTab === "movies" && (
          <section className="space-y-6">
            {/* Title Add / Edit Form */}
            <form
              onSubmit={handleMovieSubmit}
              className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-xl"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
                    {editingMovieId ? "Edit catalog entry" : "Ingest Controller"}
                  </p>
                  <h2 className="mt-1 text-xl font-bold">
                    {editingMovieId ? `Update title: ${movieForm.title}` : "Add title manually or from TMDB"}
                  </h2>
                </div>
                {editingMovieId ? (
                  <button type="button" onClick={resetMovieForm} className={pageButtonClass}>
                    Cancel edit
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsTmdbModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/15 px-4 py-1.5 text-xs font-bold text-white transition"
                  >
                    <CloudDownload className="h-3.5 w-3.5 text-[#8b5cf6]" />
                    Search TMDB
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AdminField
                  label="TMDB ID"
                  name="tmdbId"
                  type="number"
                  min="1"
                  value={movieForm.tmdbId}
                  onChange={updateMovieField}
                  required
                />
                <AdminField
                  label="Title"
                  name="title"
                  value={movieForm.title}
                  onChange={updateMovieField}
                  required
                />
                <label className="block text-xs font-medium text-white/65">
                  Category / Type
                  <select
                    name="category"
                    value={movieForm.category}
                    onChange={updateMovieField}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#111114] px-3 py-2.5 text-sm text-white outline-none focus:border-[#8b5cf6]"
                  >
                    <option value="movie">Movie</option>
                    <option value="tv">TV show</option>
                  </select>
                </label>
                <AdminField
                  label="Poster URL"
                  name="posterUrl"
                  type="url"
                  value={movieForm.posterUrl}
                  onChange={updateMovieField}
                />
                <AdminField
                  label="Release date"
                  name="releaseDate"
                  type="date"
                  value={movieForm.releaseDate}
                  onChange={updateMovieField}
                />
                <AdminField
                  label="Rating (0–10)"
                  name="rating"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={movieForm.rating}
                  onChange={updateMovieField}
                />
                <label className="block text-xs font-medium text-white/65 sm:col-span-2 lg:col-span-3">
                  Description / Synopsis
                  <textarea
                    name="description"
                    value={movieForm.description}
                    onChange={updateMovieField}
                    rows="3"
                    maxLength="2000"
                    className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#111114] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#8b5cf6]"
                    placeholder="A short synopsis..."
                  />
                </label>
              </div>
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d62b70] to-[#8b5cf6] px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60 shadow-lg"
                >
                  {editingMovieId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {loading ? "Saving..." : editingMovieId ? "Save changes" : "Add to catalog"}
                </button>
              </div>
            </form>

            {/* Catalog Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Filter catalog titles or TMDB ID..."
                  className="w-full rounded-full border border-white/10 bg-[#141416] pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#8b5cf6] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={catalogCategory}
                  onChange={(e) => setCatalogCategory(e.target.value)}
                  className="rounded-full border border-white/10 bg-[#141416] px-4 py-2 text-xs font-bold text-white outline-none"
                >
                  <option value="all">All Formats</option>
                  <option value="movie">Movies</option>
                  <option value="tv">TV Shows</option>
                </select>
              </div>
            </div>

            {/* Catalog Data Table */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <h2 className="font-bold">Catalog Titles</h2>
                <span className="text-xs text-white/45">
                  {moviePagination?.total ?? filteredMovies.length} total titles
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-white/[0.025] text-xs uppercase tracking-wider text-white/45">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Poster / Title</th>
                      <th className="px-4 py-3 font-semibold">TMDB ID</th>
                      <th className="px-4 py-3 font-semibold">Format</th>
                      <th className="px-4 py-3 font-semibold">Rating</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredMovies.map((movie) => (
                      <tr key={movie._id} className="text-white/75 hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {movie.posterUrl ? (
                              <img
                                src={movie.posterUrl}
                                alt=""
                                className="h-12 w-8 rounded-md object-cover bg-white/5 shadow"
                              />
                            ) : (
                              <div className="h-12 w-8 rounded-md bg-white/10 flex items-center justify-center text-xs">
                                🎬
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-white">{movie.title}</p>
                              <p className="text-xs text-white/40">
                                {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-[#8b5cf6]">
                          #TMDB-{movie.tmdbId}
                        </td>
                        <td className="px-4 py-4 capitalize">
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                            {movie.category || "movie"}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-semibold text-[#fbbf24]">
                          ★ {Number(movie.rating || 0).toFixed(1)}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Published
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => toast.success(`"${movie.title}" featured on Hero carousel`)}
                              title="Feature on Hero"
                              className="rounded-lg border border-amber-400/20 p-2 text-amber-300 transition hover:bg-amber-400/10"
                            >
                              <Zap className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditingMovie(movie)}
                              aria-label={`Edit ${movie.title}`}
                              className="rounded-lg border border-white/10 p-2 text-white/65 transition hover:bg-white/10 hover:text-white"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => handleDeleteMovie(movie)}
                              aria-label={`Delete ${movie.title}`}
                              className="rounded-lg border border-red-500/20 p-2 text-red-200 transition hover:bg-red-500/10 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filteredMovies.length && (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-white/45">
                          {loading ? "Loading catalog..." : "No matching catalog titles found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination pagination={moviePagination} onPageChange={setMoviePage} />
            </div>
          </section>
        )}

        {/* TAB 3: REVIEWS MODERATION */}
        {activeTab === "reviews" && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Reviews Moderation Queue</h2>
                <p className="text-xs text-white/50">
                  Inspect community commentary, protect users from spoilers, and approve verified reviews.
                </p>
              </div>
              <span className="rounded-full bg-[#fbbf24]/20 border border-[#fbbf24]/30 px-3 py-1 text-xs font-bold text-[#fbbf24]">
                {moderationReviews.filter((r) => r.status === "pending").length} Pending
              </span>
            </div>

            <div className="grid gap-4">
              {moderationReviews.map((rev) => (
                <article
                  key={rev.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-xl flex flex-col gap-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#d62b70] flex items-center justify-center font-bold text-xs">
                        {rev.author.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{rev.author}</span>
                          <span className="text-xs text-white/40">on</span>
                          <span className="text-xs font-bold text-[#8b5cf6]">{rev.movieTitle}</span>
                        </div>
                        <span className="text-[11px] text-white/40">{rev.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {rev.spoiler && (
                        <span className="flex items-center gap-1 rounded-full bg-red-500/20 border border-red-500/30 px-2.5 py-0.5 text-[11px] font-bold text-red-300">
                          <AlertTriangle className="h-3 w-3" /> Contains Spoiler
                        </span>
                      )}
                      <span className="rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/30 px-2.5 py-0.5 text-xs font-bold text-[#fbbf24]">
                        ★ {rev.rating}/10
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          rev.status === "approved"
                            ? "bg-emerald-400/10 text-emerald-300"
                            : rev.status === "hidden"
                            ? "bg-gray-400/10 text-gray-400"
                            : "bg-amber-400/10 text-amber-300"
                        }`}
                      >
                        {rev.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-white/80 bg-black/20 p-3 rounded-xl border border-white/5">
                    "{rev.content}"
                  </p>

                  <div className="flex items-center justify-end gap-2 border-t border-white/5 pt-3">
                    {rev.status !== "approved" && (
                      <button
                        type="button"
                        onClick={() => handleApproveReview(rev.id)}
                        className="rounded-full bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-4 py-1.5 text-xs font-bold transition"
                      >
                        Approve
                      </button>
                    )}
                    {rev.status !== "hidden" && (
                      <button
                        type="button"
                        onClick={() => handleHideReview(rev.id)}
                        className="rounded-full bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 px-4 py-1.5 text-xs font-semibold transition"
                      >
                        Hide
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(rev.id)}
                      className="rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 p-1.5 transition"
                      title="Delete review"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* TAB 4: USERS & TIERS */}
        {activeTab === "users" && (
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <h2 className="font-bold">Member Accounts & Access Tiers</h2>
                <p className="mt-1 text-xs text-white/45">
                  {userPagination?.total ?? users.length} registered users
                </p>
              </div>
              <Users className="h-5 w-5 text-sky-300" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-white/[0.025] text-xs uppercase tracking-wider text-white/45">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Member</th>
                    <th className="px-4 py-3 font-semibold">Role Tier</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Joined Date</th>
                    <th className="px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => (
                    <tr key={u._id} className="text-white/70 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#d62b70] flex items-center justify-center font-bold text-xs text-white">
                            {u.username?.charAt(0).toUpperCase() || "M"}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{u.username || "Member"}</p>
                            <p className="text-xs text-white/45">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                            u.role === "admin"
                              ? "bg-[#8b5cf6]/20 text-[#d0bcff]"
                              : "bg-white/10 text-white/70"
                          }`}
                        >
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            u.isBanned
                              ? "bg-red-400/10 text-red-200"
                              : "bg-emerald-400/10 text-emerald-200"
                          }`}
                        >
                          {u.isBanned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4">
                        {u.role === "admin" ? (
                          <span className="block text-right text-xs text-white/35">
                            Protected Admin
                          </span>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => handleToggleBan(u)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/20 px-2.5 py-1.5 text-xs font-semibold text-amber-100 transition hover:bg-amber-400/10 disabled:opacity-50"
                            >
                              <Ban className="h-3.5 w-3.5" />
                              {u.isBanned ? "Unban" : "Ban"}
                            </button>
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => handleDeleteUser(u)}
                              aria-label={`Delete account for ${u.email}`}
                              className="rounded-lg border border-red-500/20 p-2 text-red-200 transition hover:bg-red-500/10 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!users.length && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-white/45">
                        {loading ? "Loading members..." : "No members found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination pagination={userPagination} onPageChange={setUserPage} />
          </section>
        )}
      </div>

      {/* TMDB IMPORT MODAL */}
      {isTmdbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#121215] p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5 text-[#8b5cf6]">
                <CloudDownload className="h-6 w-6" />
                <h3 className="text-xl font-bold text-white">TMDB Media Synchronizer</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTmdbModalOpen(false)}
                className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-white/55">
              Input TMDB Movie ID or title to query the database, retrieve 4K artwork, release dates, and verified synopsis.
            </p>

            <form onSubmit={handleTmdbSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  value={tmdbQuery}
                  onChange={(e) => setTmdbQuery(e.target.value)}
                  placeholder="e.g. 550 or Fight Club..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2.5 text-sm text-white focus:border-[#8b5cf6] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={tmdbSearching}
                className="rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
              >
                {tmdbSearching ? "Searching..." : "Search"}
              </button>
            </form>

            {/* Results list */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-80">
              {tmdbSearchResults.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 hover:bg-white/[0.07] transition"
                >
                  <div className="flex items-center gap-3 truncate">
                    {item.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                        alt=""
                        className="h-14 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-14 w-10 rounded-lg bg-white/10 flex items-center justify-center text-xs">
                        🎬
                      </div>
                    )}
                    <div className="truncate">
                      <p className="font-bold text-white text-sm truncate">
                        {item.title || item.name}
                      </p>
                      <p className="text-xs text-white/45">
                        ID: {item.id} • {(item.release_date || item.first_air_date)?.slice(0, 4) || "N/A"} • ★ {item.vote_average?.toFixed(1) || "N/A"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => importTmdbTitle(item)}
                    className="shrink-0 rounded-full bg-[#8b5cf6]/20 hover:bg-[#8b5cf6] text-[#d0bcff] hover:text-white border border-[#8b5cf6]/30 px-3.5 py-1.5 text-xs font-bold transition"
                  >
                    Import →
                  </button>
                </div>
              ))}
              {!tmdbSearchResults.length && !tmdbSearching && tmdbQuery && (
                <p className="text-center py-8 text-xs text-white/40">
                  No TMDB records found matching your query.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

const AdminField = ({ label, ...props }) => (
  <label className="block text-xs font-medium text-white/65">
    {label}
    <input
      {...props}
      className="mt-2 w-full rounded-xl border border-white/10 bg-[#111114] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#8b5cf6]"
    />
  </label>
);

const RankedTitles = ({ items }) => {
  if (!items?.length) {
    return <p className="text-sm text-white/45">No title activity recorded yet.</p>;
  }

  return (
    <ol className="space-y-3">
      {items.slice(0, 5).map((item, index) => (
        <li
          key={item._id}
          className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/20 px-4 py-3"
        >
          <span className="w-5 text-xs font-bold text-[#8b5cf6]">{index + 1}</span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {item.movieData?.title || item.movieData?.name || `TMDB title ${item._id}`}
          </span>
          <span className="shrink-0 text-xs font-semibold text-white/45">{item.count} plays</span>
        </li>
      ))}
    </ol>
  );
};

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
      <span className="text-xs text-white/45">
        Page {pagination.page} of {pagination.pages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          className={pageButtonClass}
          disabled={pagination.page <= 1}
          onClick={() => onPageChange((page) => page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className={pageButtonClass}
          disabled={pagination.page >= pagination.pages}
          onClick={() => onPageChange((page) => page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminPage;
