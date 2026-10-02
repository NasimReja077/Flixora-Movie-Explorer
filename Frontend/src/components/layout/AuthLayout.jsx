// src/features/auth/components/AuthLayout.jsx
import { Link, Outlet } from "react-router-dom";
import { Clapperboard } from "lucide-react";
import AuthBgImages from "../../features/auth/components/AuthBgImages.jsx";

const AuthLayout = () => (
    <div className="relative min-h-screen overflow-hidden bg-bg-dark font-sans text-white selection:bg-brand-red selection:text-white">
        <AuthBgImages />

        <main className="relative z-20 flex min-h-screen flex-col items-center justify-center bg-bg-dark/75 px-5 py-10 backdrop-blur-xl lg:ml-auto lg:w-1/2 lg:border-l lg:border-white/5">
            <Link to="/" className="mb-8 flex items-center gap-2 transition-transform hover:scale-105">
                <span className="rounded-lg bg-brand-red p-1.5">
                    <Clapperboard className="h-7 w-7 text-white" />
                </span>
                <span className="text-3xl font-black tracking-tighter text-brand-red">FLIX</span>
            </Link>

            {/* Login / Signup render here */}
            <Outlet />

            <footer className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
                <span>© {new Date().getFullYear()} Flix</span>
                <a href="#" className="hover:text-gray-300">Help Center</a>
                <a href="#" className="hover:text-gray-300">Terms</a>
                <a href="#" className="hover:text-gray-300">Privacy</a>
            </footer>
        </main>
    </div>
);

export default AuthLayout;
