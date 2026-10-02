// src/pages/Signup.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth.js";
import AuthField from "../components/AuthField.jsx";

const registerSchema = z.object({
    username: z
        .string()
        .min(3, "Min 3 characters")
        .max(30, "Max 30 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z
        .string()
        .min(8, "Min 8 characters")
        .regex(/[^A-Za-z0-9]/, "Add at least one special symbol"),
});

const Signup = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: { username: "", email: "", password: "" },
    });

    const onSubmit = async ({ username, email, password }) => {
        try {
            await registerUser(username, email, password);
            toast.success("Account created! Check your email for the verification code.");
            navigate("/verify-otp", { state: { email, purpose: "verify" }, replace: true });
        } catch (err) {
            setError("root", { message: err.response?.data?.message || "Couldn't create your account. Please try again." });
        }
    };

    const comingSoon = () => toast("Social sign-in is coming soon");

    return (
        <div className="w-full max-w-[460px] overflow-hidden rounded-3xl border border-white/5 shadow-2xl">
            {/* Header */}
            <div className="relative overflow-hidden bg-brand-red px-8 py-8 text-center">
                <div
                    className="pointer-events-none absolute inset-0 opacity-20"
                    style={{ backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)", backgroundSize: "16px 16px" }}
                />
                <h1 className="relative text-3xl font-bold">Create your account</h1>
                <p className="relative mt-1 text-sm font-medium text-red-100">Save movies, build lists, and keep your history.</p>
            </div>

            {/* Form */}
            <div className="bg-[#1A1616] p-8">
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
                    {errors.root && (
                        <div role="alert" className="rounded-md border border-red-500 bg-red-500/20 px-4 py-3 text-sm text-red-100">
                            {errors.root.message}
                        </div>
                    )}

                    <AuthField label="Username" icon={User} autoComplete="username" placeholder="john_doe"
                        error={errors.username?.message} {...register("username")} />

                    <AuthField label="Email" icon={Mail} type="email" autoComplete="email" placeholder="you@example.com"
                        error={errors.email?.message} {...register("email")} />

                    <AuthField label="Password" icon={Lock} type="password" autoComplete="new-password" placeholder="••••••••"
                        hint="At least 8 characters with one special symbol."
                        error={errors.password?.message} {...register("password")} />

                    {/* <div>
                        <label className="flex cursor-pointer items-start gap-3 text-[13px] text-gray-400">
                            <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-brand-red" {...register("agreed")} />
                            <span>
                                I agree to the <a href="#" className="text-brand-red hover:underline">Terms of Service</a> and{" "}
                                <a href="#" className="text-brand-red hover:underline">Privacy Policy</a>.
                            </span>
                        </label>
                        {errors.agreed && <p className="ml-7 mt-1 text-xs font-medium text-red-400">{errors.agreed.message}</p>}
                    </div> */}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-red py-4 text-[17px] font-bold shadow-[0_4px_20px_0_rgba(229,9,20,0.4)] transition-all hover:bg-[#F40612] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? "Creating account..." : "Create account"}
                        {!isSubmitting && <ArrowRight className="h-5 w-5" />}
                    </button>

                    <div className="relative my-1 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                        <span className="relative bg-[#1A1616] px-4 text-[11px] font-bold tracking-wider text-gray-500">OR CONTINUE WITH</span>
                    </div>

                    {/* type="button" so these never submit the form */}
                    <div className="flex gap-4">
                        <button type="button" onClick={comingSoon}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/5 bg-[#2B2525] py-3.5 text-sm font-semibold transition-colors hover:bg-[#362E2E]">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                        <button type="button" onClick={comingSoon}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/5 bg-[#2B2525] py-3.5 text-sm font-semibold transition-colors hover:bg-[#362E2E]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                                <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282" />
                            </svg>
                            Apple
                        </button>
                    </div>
                </form>
            </div>

            <p className="bg-[#1A1616] pb-8 text-center text-[15px] text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="font-bold text-brand-red hover:underline">Sign in</Link>
            </p>
        </div>
    );
};

export default Signup;