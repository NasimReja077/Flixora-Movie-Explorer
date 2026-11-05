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
  UserCircle2,
  Camera,
  SlidersHorizontal,
  Share2,
  Bookmark,
  Activity,
  KeyRound,
  Sparkles,
  Lock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useProfile } from "../hooks/useProfile.js";
import { useWatchlist } from "../../watchlist/hooks/useWatchlist.js";
import { useFavorites } from "../../favorites/hooks/useFavorites.js";
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
    loading,
    error,
    fetchCurrentProfile,
    setCurrentProfileUser,
  } = useProfile();
  const { items: watchlistItems } = useWatchlist();
  const { items: favoriteItems } = useFavorites();

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
  }, [fetchCurrentProfile]);

  const profileUser = useMemo(() => {
    return profile?.user || user || {};
  }, [profile, user]);

  useEffect(() => {
    if (profileUser) {
      setEditUsername(profileUser.username || "");
    }
  }, [profileUser]);

  const stats = profile?.stats || {
    favorites: favoriteItems?.length || 27,
    reviews: 18,
    watchHistory: 142,
  };

  const displayName =
    profileUser.username || profileUser.fullname || profileUser.name || "Alex Vance";
  const email = profileUser.email || "alex.vance@cinema.flix";
  const joinedAt = profileUser.createdAt || user?.createdAt;
  const role = profileUser.role || "user";
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
                    {watchlistItems?.length || 48}
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
                    {favoriteItems?.length || 27}
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
                    {stats.reviews || 18}
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
                    {stats.watchHistory || 142}
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
                { id: "watchlist", label: `Watchlist (${watchlistItems?.length || 48})` },
                { id: "favorites", label: `Favorites (${favoriteItems?.length || 27})` },
                { id: "reviews", label: "My Reviews (18)" },
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
                      View All Reviews (18) →
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-5 rounded-2xl bg-black/30 p-5 border border-white/5">
                    <div className="h-36 w-24 shrink-0 overflow-hidden rounded-xl bg-white/5 shadow-md">
                      <img
                        src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=300&auto=format&fit=crop"
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-1 gap-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-white text-base">Chronos Continuum</h4>
                          <span className="text-xs text-white/50">2024 • Speculative Sci-Fi</span>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-[#fbbf24]/20 border border-[#fbbf24]/30 px-3 py-1 text-xs font-bold text-[#fbbf24]">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span>9.5 / 10</span>
                        </div>
                      </div>

                      <p className="text-sm leading-relaxed text-white/80 italic">
                        "The sound design alone warrants an IMAX reference system. The acoustic sub-bass transients throughout the second act sequence redefine spatial immersion on FLIX. Color timing holds absolute deep blacks without macroblocking."
                      </p>

                      <div className="flex items-center justify-between text-xs text-white/45 pt-2 border-t border-white/5">
                        <span>Published 4 days ago</span>
                        <span className="text-[#8b5cf6] font-semibold">142 Found Helpful</span>
                      </div>
                    </div>
                  </div>

                  {/* Hardware calibration band */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/[0.02] px-4 py-3 text-xs text-white/50">
                    <span>
                      Hardware Linked: <strong className="text-white">Apple TV 4K / LG OLED G3 / Dolby Atmos 7.1.4</strong>
                    </span>
                    <span className="text-[#6ee7b7] flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Calibrated Mode Active
                    </span>
                  </div>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {watchlistItems?.map((item) => (
                  <MovieCard key={item._id || item.id} item={item} />
                ))}
              </div>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {favoriteItems?.map((item) => (
                  <MovieCard key={item._id || item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MY REVIEWS */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Your Published Critiques (18)</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Chronos Continuum",
                    score: "9.5/10",
                    date: "4 days ago",
                    text: "The sound design alone warrants an IMAX reference system. The acoustic sub-bass transients throughout the second act sequence redefine spatial immersion.",
                  },
                  {
                    title: "Vesper Mirage",
                    score: "8.0/10",
                    date: "Nov 12, 2024",
                    text: "Exceptional anamorphic framing and moody twilight lighting. Denis Miller delivers a contemplative sci-fi treatise.",
                  },
                ].map((critique, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-xl flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-white text-base">{critique.title}</h3>
                        <span className="rounded-full bg-[#fbbf24]/20 text-[#fbbf24] px-2.5 py-0.5 text-xs font-bold">
                          ★ {critique.score}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-white/70 italic">
                        "{critique.text}"
                      </p>
                    </div>
                    <span className="text-xs text-white/40">{critique.date}</span>
                  </div>
                ))}
              </div>
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
