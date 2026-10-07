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
} from "lucide-react";
import { useAdmin } from "../hooks/useAdmin.js";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "movies", label: "Movies" },
  { id: "users", label: "Users" },
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
      } else {
        await addAdminMovie(payload).unwrap();
      }
      resetMovieForm();
      setActiveTab("movies");
      await Promise.all([
        fetchAdminMovies({ page: moviePage, limit: 10 }),
        fetchAdminStats(),
      ]);
    } catch {
      // The rejected thunk updates the shared admin error shown above the page.
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
      await Promise.all([
        fetchAdminMovies({ page: moviePage, limit: 10 }),
        fetchAdminStats(),
      ]);
    } catch {
      // The rejected thunk updates the shared admin error shown above the page.
    }
  };

  const handleToggleBan = async (user) => {
    try {
      await toggleUserBan(user._id).unwrap();
    } catch {
      // The rejected thunk updates the shared admin error shown above the page.
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete the account for ${user.email}? This cannot be undone.`)) return;
    try {
      await deleteAdminUser(user._id).unwrap();
      await Promise.all([
        fetchAdminUsers({ page: userPage, limit: 10 }),
        fetchAdminStats(),
      ]);
    } catch {
      // The rejected thunk updates the shared admin error shown above the page.
    }
  };

  const statCards = [
    { label: "Total users", value: stats?.totalUsers, icon: Users, color: "text-sky-300 bg-sky-400/10" },
    { label: "Catalog titles", value: stats?.totalMovies, icon: Film, color: "text-fuchsia-300 bg-fuchsia-400/10" },
    { label: "Reviews", value: stats?.totalReviews, icon: Activity, color: "text-amber-300 bg-amber-400/10" },
  ];

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 lg:px-10">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#8b5cf6]">
              Platform control
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Admin dashboard</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
              Monitor Flixora activity, manage the title catalog, and moderate member accounts.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-200 sm:self-auto">
            <ShieldCheck className="h-4 w-4" />
            Admin access
          </div>
        </header>

        <nav aria-label="Admin sections" className="mb-8 flex gap-2 overflow-x-auto border-b border-white/10">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
                activeTab === id
                  ? "border-[#d62b70] text-white"
                  : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {error && (
          <div role="alert" className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-100">
            <span>{error}</span>
            <button type="button" onClick={clearAdminError} aria-label="Dismiss error" className="rounded-lg p-1 hover:bg-red-500/20">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {activeTab === "overview" && (
          <section aria-label="Dashboard overview" className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {statCards.map(({ label, value, icon: Icon, color }) => (
                <article key={label} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
                  <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-white/55">{label}</p>
                  <p className="mt-1 text-3xl font-black">{value == null ? "—" : Number(value).toLocaleString()}</p>
                </article>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
                <h2 className="mb-5 text-lg font-bold">Most watched</h2>
                <RankedTitles items={stats?.mostViewed} />
              </section>
              <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
                <h2 className="mb-5 text-lg font-bold">Most favorited</h2>
                <RankedTitles items={stats?.mostFavorited} />
              </section>
            </div>

            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <h2 className="mb-5 text-lg font-bold">Recently joined</h2>
              {stats?.recentUsers?.length ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {stats.recentUsers.map((user) => (
                    <div key={user._id} className="min-w-0 rounded-2xl border border-white/5 bg-black/20 p-4">
                      <p className="truncate text-sm font-semibold">{user.username || "Member"}</p>
                      <p className="mt-1 truncate text-xs text-white/45">{user.email}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/45">{loading ? "Loading recent members..." : "No recent members to show."}</p>
              )}
            </section>
          </section>
        )}

        {activeTab === "movies" && (
          <section className="space-y-6">
            <form onSubmit={handleMovieSubmit} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c4b5fd]">
                    {editingMovieId ? "Edit catalog entry" : "Catalog"}
                  </p>
                  <h2 className="mt-1 text-xl font-bold">{editingMovieId ? "Update title" : "Add a title"}</h2>
                </div>
                {editingMovieId ? (
                  <button type="button" onClick={resetMovieForm} className={pageButtonClass}>Cancel edit</button>
                ) : (
                  <Plus className="h-5 w-5 text-[#c4b5fd]" />
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AdminField label="TMDB ID" name="tmdbId" type="number" min="1" value={movieForm.tmdbId} onChange={updateMovieField} required />
                <AdminField label="Title" name="title" value={movieForm.title} onChange={updateMovieField} required />
                <label className="block text-xs font-medium text-white/65">
                  Type
                  <select name="category" value={movieForm.category} onChange={updateMovieField} className="mt-2 w-full rounded-xl border border-white/10 bg-[#111114] px-3 py-2.5 text-sm text-white outline-none focus:border-[#8b5cf6]">
                    <option value="movie">Movie</option>
                    <option value="tv">TV show</option>
                  </select>
                </label>
                <AdminField label="Poster URL" name="posterUrl" type="url" value={movieForm.posterUrl} onChange={updateMovieField} />
                <AdminField label="Release date" name="releaseDate" type="date" value={movieForm.releaseDate} onChange={updateMovieField} />
                <AdminField label="Rating (0–10)" name="rating" type="number" min="0" max="10" step="0.1" value={movieForm.rating} onChange={updateMovieField} />
                <label className="block text-xs font-medium text-white/65 sm:col-span-2 lg:col-span-3">
                  Description
                  <textarea name="description" value={movieForm.description} onChange={updateMovieField} rows="3" maxLength="2000" className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#111114] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#8b5cf6]" placeholder="A short synopsis..." />
                </label>
              </div>
              <button type="submit" disabled={loading} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d62b70] to-[#8b5cf6] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60">
                {editingMovieId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {loading ? "Saving..." : editingMovieId ? "Save changes" : "Add to catalog"}
              </button>
            </form>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <h2 className="font-bold">Catalog titles</h2>
                <span className="text-xs text-white/45">{moviePagination?.total ?? 0} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-white/[0.025] text-xs uppercase tracking-wider text-white/45">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Title</th>
                      <th className="px-4 py-3 font-semibold">TMDB ID</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Rating</th>
                      <th className="px-5 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {movies.map((movie) => (
                      <tr key={movie._id} className="text-white/75">
                        <td className="px-5 py-4 font-semibold text-white">{movie.title}</td>
                        <td className="px-4 py-4">{movie.tmdbId}</td>
                        <td className="px-4 py-4 capitalize">{movie.category || "movie"}</td>
                        <td className="px-4 py-4">{Number(movie.rating || 0).toFixed(1)}</td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => startEditingMovie(movie)} aria-label={`Edit ${movie.title}`} className="rounded-lg border border-white/10 p-2 text-white/65 transition hover:bg-white/10 hover:text-white">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button type="button" disabled={loading} onClick={() => handleDeleteMovie(movie)} aria-label={`Delete ${movie.title}`} className="rounded-lg border border-red-500/20 p-2 text-red-200 transition hover:bg-red-500/10 disabled:opacity-50">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!movies.length && (
                      <tr><td colSpan="5" className="px-5 py-10 text-center text-white/45">{loading ? "Loading catalog..." : "No catalog titles found."}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination pagination={moviePagination} onPageChange={setMoviePage} />
            </div>
          </section>
        )}

        {activeTab === "users" && (
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="font-bold">Member accounts</h2>
                <p className="mt-1 text-xs text-white/45">{userPagination?.total ?? 0} registered users</p>
              </div>
              <Users className="h-5 w-5 text-sky-300" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-white/[0.025] text-xs uppercase tracking-wider text-white/45">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Member</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Joined</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user._id} className="text-white/70">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{user.username || "Member"}</p>
                        <p className="mt-1 text-xs text-white/45">{user.email}</p>
                      </td>
                      <td className="px-4 py-4 capitalize">{user.role || "user"}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${user.isBanned ? "bg-red-400/10 text-red-200" : "bg-emerald-400/10 text-emerald-200"}`}>
                          {user.isBanned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-4">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</td>
                      <td className="px-5 py-4">
                        {user.role === "admin" ? (
                          <span className="block text-right text-xs text-white/35">Protected admin</span>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button type="button" disabled={loading} onClick={() => handleToggleBan(user)} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/20 px-2.5 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-400/10 disabled:opacity-50">
                              <Ban className="h-3.5 w-3.5" />
                              {user.isBanned ? "Unban" : "Ban"}
                            </button>
                            <button type="button" disabled={loading} onClick={() => handleDeleteUser(user)} aria-label={`Delete account for ${user.email}`} className="rounded-lg border border-red-500/20 p-2 text-red-200 transition hover:bg-red-500/10 disabled:opacity-50">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!users.length && (
                    <tr><td colSpan="5" className="px-5 py-10 text-center text-white/45">{loading ? "Loading members..." : "No members found."}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination pagination={userPagination} onPageChange={setUserPage} />
          </section>
        )}

        <div className="sr-only" aria-live="polite">{loading ? "Admin data is loading" : ""}</div>
      </div>
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
    return <p className="text-sm text-white/45">No title activity yet.</p>;
  }

  return (
    <ol className="space-y-3">
      {items.slice(0, 5).map((item, index) => (
        <li key={item._id} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
          <span className="w-5 text-xs font-bold text-[#c4b5fd]">{index + 1}</span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.movieData?.title || item.movieData?.name || `TMDB title ${item._id}`}</span>
          <span className="shrink-0 text-xs text-white/45">{item.count} plays</span>
        </li>
      ))}
    </ol>
  );
};

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
      <span className="text-xs text-white/45">Page {pagination.page} of {pagination.pages}</span>
      <div className="flex gap-2">
        <button type="button" className={pageButtonClass} disabled={pagination.page <= 1} onClick={() => onPageChange((page) => page - 1)}>Previous</button>
        <button type="button" className={pageButtonClass} disabled={pagination.page >= pagination.pages} onClick={() => onPageChange((page) => page + 1)}>Next</button>
      </div>
    </div>
  );
};

export default AdminPage;
