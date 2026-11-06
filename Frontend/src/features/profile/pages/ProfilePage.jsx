import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Heart,
  Mail,
  ShieldCheck,
  Star,
  Camera,
  SlidersHorizontal,
  Share2,
  Bookmark,
  Sparkles,
  Lock,
} from "lucide-react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useProfile } from "../hooks/useProfile.js";
import { useWatchlist } from "../../watchlist/hooks/useWatchlist.js";
import { useFavorites } from "../../favorites/hooks/useFavorites.js";
import { useReviews } from "../../reviews/hooks/useReviews.js";
import { updateProfile, updatePassword, uploadAvatar } from "../service/profile.api.js";
import Sheet from "../../../components/common/Sheet.jsx";
import MovieCard from "../../../components/common/MovieCard.jsx";
import toast from "react-hot-toast";

const getInitials = (name = "") => {
  if (!name) return "F";
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "F"
  );
};

const formatDate = (value) => {
  if (!value) return "November 2023";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "November 2023";
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const {
    profile,
    error,
    fetchCurrentProfile,
    setCurrentProfileUser,
  } = useProfile();
  const {
    items: watchlistItems,
    pagination: watchlistPagination,
    loading: watchlistLoading,
    error: watchlistError,
  } = useWatchlist();
  const {
    items: favoriteItems,
    fetchFavorites,
    loading: favoritesLoading,
    error: favoritesError,
  } = useFavorites();
  const {
    myReviews,
    fetchMyReviews,
    loading: reviewsLoading,
    error: reviewsError,
  } = useReviews();

  const [activeTab, setActiveTab] = useState("overview");

  // Edit profile state
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchCurrentProfile();
    fetchFavorites();
    fetchMyReviews();
  }, [fetchCurrentProfile, fetchFavorites, fetchMyReviews]);

  const profileUser = useMemo(() => {
    return profile?.user || user || {};
  }, [profile, user]);

  useEffect(() => {
    if (profileUser) {
      setEditUsername(profileUser.username || "");
    }
  }, [profileUser]);

  const watchlistCount = watchlistPagination?.total ?? watchlistItems.length;
  const favoritesCount = favoriteItems.length;
  const reviewsCount = myReviews.length;
  const watchHistoryCount = profile?.stats?.watchHistory ?? 0;
  const latestReview = myReviews[0];

  const displayName =
    profileUser.username || profileUser.fullname || profileUser.name || "Alex Vance";
  const email = profileUser.email || "alex.vance@cinema.flix";
  const joinedAt = profileUser.createdAt || user?.createdAt;
  const avatar = profileUser.avatar;

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    const toastId = toast.loading("Uploading high-definition avatar...");
    try {
      const { avatarUrl } = await uploadAvatar(formData);
      const updatedUser = { ...user, avatar: avatarUrl };
      setUser(updatedUser);
      setCurrentProfileUser(updatedUser);
      toast.success("Avatar updated successfully", { id: toastId });
    } catch {
      toast.error("Could not upload avatar", { id: toastId });
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { user: updatedUser } = await updateProfile({ username: editUsername });
      if (!updatedUser) throw new Error("Profile update response did not include the updated user");

      setUser({ ...user, ...updatedUser });
      setCurrentProfileUser(updatedUser);
      toast.success("Profile updated");
      setIsEditSheetOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please enter both current and new password");
      return;
    }
    setChangingPassword(true);
    try {
      await updatePassword({
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not change password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      {error && (
        <div role="alert" className="mx-auto max-w-7xl px-5 pt-4 text-sm text-red-200 sm:px-8 lg:px-10">
          Could not load your profile: {error}
        </div>
      )}
      {/* Background Ambient Glows */}
      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-[#8b5cf6]/15 blur-[128px]" />
        <div className="pointer-events-none absolute top-20 right-1/4 h-96 w-96 rounded-full bg-[#d62b70]/15 blur-[128px]" />

        {/* Profile Header & Identity Canvas */}
        <div className="mx-auto max-w-7xl px-5 pt-28 pb-8 sm:px-8 lg:px-10">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8 lg:p-10 backdrop-blur-2xl shadow-2xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              {/* Avatar + Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Large Avatar with camera overlay */}
                <div className="relative group cursor-pointer">
                  <div className="h-28 w-28 lg:h-36 lg:w-36 overflow-hidden rounded-full border-2 border-[#8b5cf6] bg-white/5 shadow-2xl">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={displayName}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#8b5cf6] to-[#d62b70] text-3xl font-black text-white">
                        {getInitials(displayName)}
                      </div>
                    )}
                  </div>

                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white backdrop-blur-sm"
                  >
                    <Camera className="h-6 w-6 text-[#d0bcff]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#d0bcff]">
                      Change
                    </span>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>

                  <div className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#fbbf24] shadow-md">
                    <CheckCircle2 className="h-4 w-4 text-black" />
                  </div>
                </div>

                {/* Identity Metadata */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                      {displayName}
                    </h1>
                    <span className="rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#d0bcff]">
                      VIP Cinephile
                    </span>
                    <span className="rounded-full bg-[#d62b70]/20 border border-[#d62b70]/40 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#ffb1c4]">
                      Dolby Vision Core
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/55">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {email}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-[#8b5cf6]" />
                      Member since {formatDate(joinedAt)}
                    </span>
                    <span>•</span>
                    <span className="text-[#6ee7b7] flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified Hardware Sync
                    </span>
                  </div>

                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/70">
                    Obsessive collector of 70mm epics, neo-noir restorations, and atmospheric sci-fi syntheses. Always evaluating color timing, dynamic range, and spatial sound mixing.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditSheetOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] px-6 py-3 text-sm font-bold text-white shadow-xl transition hover:scale-105 active:scale-95"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => toast.success("Screening profile link copied")}
                  aria-label="Share Library"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/15 active:scale-95 shadow-md"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Metrics Pulse Counters Grid */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-white/10 pt-6">
              <div className="flex items-center gap-3.5 rounded-2xl bg-black/30 p-4 border border-white/5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8b5cf6]/15 text-[#8b5cf6]">
                  <Bookmark className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white">
                    {watchlistCount}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/45">
                    Watchlist
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl bg-black/30 p-4 border border-white/5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d62b70]/15 text-[#d62b70]">
                  <Heart className="h-5 w-5 fill-current" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white">
                    {favoritesCount}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/45">
                    Favorites
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl bg-black/30 p-4 border border-white/5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fbbf24]/15 text-[#fbbf24]">
                  <Star className="h-5 w-5 fill-current" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white">
                    {reviewsCount}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/45">
                    Reviews Written
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl bg-black/30 p-4 border border-white/5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-400/15 text-sky-300">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white">
                    {watchHistoryCount}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/45">
                    Titles Watched
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Navigation Hub Tabs */}
        <div className="sticky top-16 z-30 w-full bg-[#090909]/90 backdrop-blur-xl border-y border-white/10 px-5 sm:px-8 lg:px-10 py-3">
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
            <nav className="flex items-center gap-2">
              {[
                { id: "overview", label: "Overview" },
                { id: "watchlist", label: `Watchlist (${watchlistCount})` },
                { id: "favorites", label: `Favorites (${favoritesCount})` },
                { id: "reviews", label: `My Reviews (${reviewsCount})` },
                { id: "security", label: "Security & Access" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] text-white shadow-md"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* TAB CONTENTS */}
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-10">
              {/* Asymmetric Bento Section: Sensory Curation & Recent Review Spotlight */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left: Audio-Visual Taste Analytics Card */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-xl flex flex-col justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <SlidersHorizontal className="h-5 w-5 text-[#8b5cf6]" /> Sensory Profile
                      </h3>
                      <span className="text-[11px] font-bold text-[#8b5cf6] uppercase">
                        Reference Mode
                      </span>
                    </div>
                    <p className="text-xs text-white/50">
                      Your highest density viewing habits across mastering formats.
                    </p>
                  </div>

                  {/* SVG Gauge Chart */}
                  <div className="my-6 relative flex items-center justify-center">
                    <svg className="h-44 w-44 -rotate-90 transform" viewBox="0 0 100 100">
                      <circle
                        className="text-white/10"
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                      />
                      {/* 4K HDR: 45% */}
                      <circle
                        className="text-[#8b5cf6]"
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r="40"
                        stroke="currentColor"
                        strokeDasharray="251.2"
                        strokeDashoffset="138"
                        strokeLinecap="round"
                        strokeWidth="8"
                      />
                      {/* Dolby Atmos: 30% */}
                      <circle
                        className="text-[#d62b70]"
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r="30"
                        stroke="currentColor"
                        strokeDasharray="188.4"
                        strokeDashoffset="75"
                        strokeLinecap="round"
                        strokeWidth="6"
                      />
                      {/* IMAX Enhanced: 25% */}
                      <circle
                        className="text-[#fbbf24]"
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r="20"
                        stroke="currentColor"
                        strokeDasharray="125.6"
                        strokeDashoffset="60"
                        strokeLinecap="round"
                        strokeWidth="5"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-white">94%</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                        UHD Tier
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-white/5 pt-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#8b5cf6]" /> 4K HDR Master
                      </span>
                      <span className="font-bold text-white">64 titles</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#d62b70]" /> Dolby Atmos Mix
                      </span>
                      <span className="font-bold text-white">42 titles</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#fbbf24]" /> IMAX Enhanced
                      </span>
                      <span className="font-bold text-white">36 titles</span>
                    </div>
                  </div>
                </div>

                {/* Right: Latest Authored Critique Spotlight */}
                <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#d62b70]" /> Latest Authored Critique
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab("reviews")}
                      className="text-xs font-bold text-[#8b5cf6] hover:underline"
                    >
                      View All Reviews ({reviewsCount}) →
                    </button>
                  </div>

                  {reviewsLoading ? (
                    <p className="rounded-2xl border border-white/5 bg-black/30 p-5 text-sm text-white/55">
                      Loading your reviews...
                    </p>
                  ) : reviewsError ? (
                    <p role="alert" className="rounded-2xl border border-red-400/20 bg-red-400/5 p-5 text-sm text-red-200">
                      Could not load your reviews: {reviewsError}
                    </p>
                  ) : latestReview ? (
                    <div className="rounded-2xl border border-white/5 bg-black/30 p-5">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <Link
                          to={`/${latestReview.movieType === "tv" ? "tv" : "movie"}/${latestReview.movieId}`}
                          className="font-bold text-white hover:text-[#a78bfa]"
                        >
                          Review for {latestReview.movieType === "tv" ? "TV" : "movie"} #{latestReview.movieId}
                        </Link>
                        <span className="flex items-center gap-1 rounded-full border border-[#fbbf24]/30 bg-[#fbbf24]/20 px-3 py-1 text-xs font-bold text-[#fbbf24]">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {latestReview.rating} / 10
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-white/80">
                        {latestReview.content}
                      </p>
                      <p className="mt-3 border-t border-white/5 pt-2 text-xs text-white/45">
                        {latestReview.createdAt
                          ? `Published ${new Date(latestReview.createdAt).toLocaleDateString()}`
                          : "Publication date unavailable"}
                      </p>
                    </div>
                  ) : (
                    <p className="rounded-2xl border border-white/5 bg-black/30 p-5 text-sm text-white/55">
                      You have not written any reviews yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WATCHLIST */}
          {activeTab === "watchlist" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Watchlist Queue</h2>
                <Link to="/movies" className="text-xs font-bold text-[#8b5cf6] hover:underline">
                  Browse Catalog →
                </Link>
              </div>
              {watchlistError && (
                <p role="alert" className="text-sm text-red-200">
                  Could not load your watchlist: {watchlistError}
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {watchlistItems?.map((item) => (
                  <MovieCard key={item._id || item.id} item={item} />
                ))}
              </div>
              {!watchlistLoading && !watchlistError && watchlistItems.length === 0 && (
                <p className="text-sm text-white/55">Your watchlist is empty.</p>
              )}
            </div>
          )}

          {/* TAB 3: FAVORITES */}
          {activeTab === "favorites" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Hall of Fame Favorites</h2>
                <Link to="/movies" className="text-xs font-bold text-[#8b5cf6] hover:underline">
                  Discover More →
                </Link>
              </div>
              {favoritesError && (
                <p role="alert" className="text-sm text-red-200">
                  Could not load your favorites: {favoritesError}
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {favoriteItems?.map((item) => (
                  <MovieCard key={item._id || item.id} item={item} />
                ))}
              </div>
              {!favoritesLoading && !favoritesError && favoriteItems.length === 0 && (
                <p className="text-sm text-white/55">You have not saved any favorites yet.</p>
              )}
            </div>
          )}

          {/* TAB 4: MY REVIEWS */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Your Reviews ({reviewsCount})</h2>
              {reviewsError && (
                <p role="alert" className="text-sm text-red-200">
                  Could not load your reviews: {reviewsError}
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {myReviews.map((review) => (
                  <div
                    key={review._id || review.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-xl flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Link
                          to={`/${review.movieType === "tv" ? "tv" : "movie"}/${review.movieId}`}
                          className="font-bold text-white text-base hover:text-[#a78bfa]"
                        >
                          {review.movieType === "tv" ? "TV" : "Movie"} #{review.movieId}
                        </Link>
                        <span className="rounded-full bg-[#fbbf24]/20 text-[#fbbf24] px-2.5 py-0.5 text-xs font-bold">
                          ★ {review.rating}/10
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-white/70 italic">
                        {review.content}
                      </p>
                    </div>
                    <span className="text-xs text-white/40">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString()
                        : "Date unavailable"}
                    </span>
                  </div>
                ))}
              </div>
              {reviewsLoading && (
                <p className="text-sm text-white/55">Loading your reviews...</p>
              )}
              {!reviewsLoading && !reviewsError && myReviews.length === 0 && (
                <p className="text-sm text-white/55">You have not written any reviews yet.</p>
              )}
            </div>
          )}

          {/* TAB 5: SECURITY & ACCESS */}
          {activeTab === "security" && (
            <div className="max-w-xl mx-auto rounded-3xl border border-white/10 bg-white/[0.035] p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="h-6 w-6 text-[#8b5cf6]" />
                <div>
                  <h2 className="text-xl font-bold">Change Password</h2>
                  <p className="text-xs text-white/50">
                    Ensure your account is protected with a secure password.
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-[#8b5cf6] focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-[#8b5cf6] focus:outline-none"
                    placeholder="At least 8 characters"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] py-3 text-sm font-bold text-white shadow-xl transition hover:brightness-110 disabled:opacity-60"
                >
                  {changingPassword ? "Updating Password..." : "Update Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* EDIT PROFILE SLIDE-OVER SHEET */}
      <Sheet
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
        title="Edit Profile"
        description="Update your display identity and preferences on FLIX"
        maxWidth="max-w-lg"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditSheetOpen(false)}
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleProfileSave}
              disabled={savingProfile}
              className="rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#d62b70] px-6 py-2 text-sm font-bold text-white shadow-lg disabled:opacity-60"
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleProfileSave} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-white/70 block mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_]+"
              required
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-[#8b5cf6] focus:outline-none"
            />
          </div>
        </form>
      </Sheet>
    </main>
  );
};

export default ProfilePage;
