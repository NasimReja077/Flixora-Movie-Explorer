import { useRef } from "react";
import { Link, Outlet } from "react-router-dom";
import { Clapperboard } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import AuthBgImages from "../../features/auth/components/AuthBgImages.jsx";

const AuthLayout = () => {
    const root = useRef(null);

    useGSAP(
        () => {
            const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            if (prefersReducedMotion) {
                gsap.set(".auth-brand, .auth-panel, .auth-footer", { clearProps: "all" });
                return;
            }

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
                ".auth-brand",
                { autoAlpha: 0, y: -18 },
                { autoAlpha: 1, y: 0, duration: 0.7 }
            )
                .fromTo(
                    ".auth-panel",
                    { autoAlpha: 0, x: 36, y: 16 },
                    { autoAlpha: 1, x: 0, y: 0, duration: 0.8 },
                    "-=" + 0.3
                )
                .fromTo(
                    ".auth-footer",
                    { autoAlpha: 0, y: 14 },
                    { autoAlpha: 1, y: 0, duration: 0.6 },
                    "-=" + 0.35
                );
        },
        { scope: root }
    );

    return (
        <div ref={root} className="relative min-h-screen overflow-hidden bg-bg-dark font-sans text-white selection:bg-brand-red selection:text-white">
            <AuthBgImages />

            <main className="auth-panel relative z-20 flex min-h-screen flex-col items-center justify-center bg-bg-dark/75 px-5 py-10 backdrop-blur-xl lg:ml-auto lg:w-1/2 lg:border-l lg:border-white/5">
                <Link to="/" className="auth-brand mb-8 flex items-center gap-2 transition-transform hover:scale-105">
                    <span className="rounded-lg bg-brand-red p-1.5">
                        <Clapperboard className="h-7 w-7 text-white" />
                    </span>
                    <span className="text-3xl font-black tracking-tighter text-brand-red">FLIX</span>
                </Link>

                {/* Login / Signup render here */}
                <Outlet />

                <footer className="auth-footer mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
                    <span>© {new Date().getFullYear()} Flix</span>
                    <a href="#" className="hover:text-gray-300">Help Center</a>
                    <a href="#" className="hover:text-gray-300">Terms</a>
                    <a href="#" className="hover:text-gray-300">Privacy</a>
                </footer>
            </main>
        </div>
    );
};

export default AuthLayout;
