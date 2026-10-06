import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Heart,
  Mail,
  ShieldCheck,
  Star,
  UserCircle2,
} from "lucide-react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useProfile } from "../hooks/useProfile.js";

const getInitials = (name = "") => {
  if (!name) return "F";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "F";
};

const formatDate = (value) => {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const ProfilePage = () => {
  const { user } = useAuth();
  const { profile, loading, error, fetchCurrentProfile } = useProfile();

  useEffect(() => {
    fetchCurrentProfile();
  }, [fetchCurrentProfile]);

  const profileUser = useMemo(() => {
    return profile?.user || user || {};
  }, [profile, user]);

  const stats = profile?.stats || {
    favorites: 0,
    reviews: 0,
    watchHistory: 0,
  };

  const displayName = profileUser.username || profileUser.fullname || profileUser.name || "Flix User";
  const email = profileUser.email || "No email added";
  const joinedAt = profileUser.createdAt || user?.createdAt;
  const role = profileUser.role || "user";
  const avatar = profileUser.avatar;

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-28 sm:px-8 lg:px-10">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#d62b70]">
              Account
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Profile
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70">
            <ShieldCheck className="h-4 w-4 text-[#6ee7b7]" />
            <span>{role === "admin" ? "Admin access" : "Member"}</span>
          </div>
        </header>

        {loading ? (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-28 w-28 rounded-full bg-white/10" />
              <div className="h-6 w-40 rounded bg-white/10" />
              <div className="h-4 w-60 rounded bg-white/10" />
            </div>
          </div>
        ) : error ? (
          <div className="rounded-[28px] border border-red-500/30 bg-red-500/10 p-6 text-red-100">
            {error}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
              <div className="border-b border-white/10 bg-gradient-to-r from-[#d62b70]/15 via-[#8b5cf6]/10 to-transparent p-6 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-[#d62b70] to-[#8b5cf6] shadow-[0_15px_30px_rgba(214,43,112,0.38)]">
                    {avatar ? (
                      <img src={avatar} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-black text-white">
                        {getInitials(displayName)}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[#d62b70]">
                      <UserCircle2 className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-[0.2em]">
                        {role === "admin" ? "Administrator" : "User"}
                      </span>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-white">{displayName}</h2>
                    <p className="flex items-center gap-2 text-sm text-white/65">
                      <Mail className="h-4 w-4" />
                      {email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                    Member since
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-white">
                    <CalendarDays className="h-4 w-4 text-[#8b5cf6]" />
                    <span className="text-base font-semibold">{formatDate(joinedAt)}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                    Status
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-white">
                    <CheckCircle2 className="h-4 w-4 text-[#6ee7b7]" />
                    <span className="text-base font-semibold">Verified account</span>
                  </div>
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/50">
                  Quick stats
                </h3>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="flex items-center gap-3 text-white/75">
                      <Heart className="h-4 w-4 text-[#ff5f8f]" />
                      <span>Favorites</span>
                    </div>
                    <span className="text-lg font-bold text-white">{stats.favorites}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="flex items-center gap-3 text-white/75">
                      <Star className="h-4 w-4 text-[#fbbf24]" />
                      <span>Reviews</span>
                    </div>
                    <span className="text-lg font-bold text-white">{stats.reviews}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="flex items-center gap-3 text-white/75">
                      <Clock3 className="h-4 w-4 text-[#8b5cf6]" />
                      <span>History</span>
                    </div>
                    <span className="text-lg font-bold text-white">{stats.watchHistory}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/50">
                  Account links
                </h3>

                <div className="mt-4 space-y-3">
                  <Link
                    to="/favorites"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white transition hover:border-[#ff5f8f]/30 hover:bg-[#ff5f8f]/5"
                  >
                    <span>Favorites</span>
                    <Heart className="h-4 w-4 text-[#ff5f8f]" />
                  </Link>

                  <Link
                    to="/history"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white transition hover:border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/5"
                  >
                    <span>Watch history</span>
                    <Clock3 className="h-4 w-4 text-[#8b5cf6]" />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default ProfilePage;
