// src/pages/Login.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth.js";
import AuthField from "../components/AuthField.jsx";

const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
});

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

    const onSubmit = async ({ email, password }) => {
        try {
            const res = await login(email, password);
            toast.success("Welcome back!");
            navigate(res?.user?.role === "admin" ? "/admin" : from, { replace: true });
        } catch (err) {
            setError("root", { message: err.response?.data?.message || "Couldn't sign in. Check your details and try again." });
        }
    };

    return (
        <div className="w-full max-w-[460px] rounded-3xl border border-white/5 bg-[#1E1717]/90 p-8 shadow-2xl md:p-10">
            <h1 className="mb-1 text-3xl font-bold">Sign in</h1>
            <p className="mb-8 text-sm text-gray-400">Pick up where you left off.</p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
                {errors.root && (
                    <div role="alert" className="rounded-md border border-red-500 bg-red-500/20 px-4 py-3 text-sm text-red-100">
                        {errors.root.message}
                    </div>
                )}

                <AuthField
                    label="Email"
                    icon={Mail}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    error={errors.email?.message}
                    {...register("email")}
                />

                <AuthField
                    label="Password"
                    icon={Lock}
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    {...register("password")}
                />

                <div className="flex items-center justify-between text-[13px] text-gray-400">
                    <label className="flex cursor-pointer items-center gap-2">
                        <input type="checkbox" className="h-4 w-4 accent-brand-red" />
                        Remember me
                    </label>
                    <Link to="/forgot-password" className="hover:text-white hover:underline">Forgot password?</Link>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-red py-4 text-[17px] font-bold shadow-[0_4px_20px_0_rgba(229,9,20,0.4)] transition-all hover:bg-[#F40612] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                    {!isSubmitting && <LogIn className="h-5 w-5" />}
                </button>
            </form>

            <p className="mt-8 text-center text-gray-400">
                New to Flix?{" "}
                <Link to="/signup" className="font-semibold text-white hover:underline">Create an account</Link>
            </p>
        </div>
    );
};

export default Login;