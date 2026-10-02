// src/features/auth/pages/ResetPassword.jsx
// Reached via email link: /reset-password/:token
// Backend route: POST /api/auth/reset-password/:token  { password }
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock, LockKeyhole, Check, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth.js";
import AuthCard from "../components/AuthCard.jsx";
import AuthField from "../components/AuthField.jsx";

const schema = z
    .object({
        password: z
            .string()
            .min(8, "Min 8 characters")
            .regex(/[^A-Za-z0-9]/, "Add at least one special symbol"),
        confirmPassword: z.string().min(1, "Confirm your password"),
    })
    .refine((d) => d.password === d.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords don't match",
    });

const ResetPassword = () => {
    const { token } = useParams(); // token comes from the URL: /reset-password/:token
    const { resetPassword } = useAuth(); // dispatches POST /auth/reset-password/:token
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    // No token in URL → invalid link
    if (!token) {
        return (
            <AuthCard
                icon={AlertTriangle}
                title="Invalid link"
                subtitle="This password-reset link is missing or malformed."
                footer={
                    <Link to="/forgot-password" className="font-semibold text-brand-red hover:underline">
                        Request a new link
                    </Link>
                }
            >
                <div className="py-4 text-center text-sm text-gray-400">
                    Please request a new password-reset email.
                </div>
            </AuthCard>
        );
    }

    const onSubmit = async ({ password, confirmPassword }) => {
        try {
            // resetPassword thunk signature: { token, password, confirmPassword }
            await resetPassword({ token, password, confirmPassword });
            toast.success("Password updated! Sign in with your new password.");
            navigate("/login", { replace: true });
        } catch (err) {
            setError("root", {
                message:
                    err.response?.data?.message ||
                    "Couldn't reset your password. The link may have expired.",
            });
        }
    };

    return (
        <AuthCard
            icon={LockKeyhole}
            title="Set a new password"
            subtitle="Choose a strong password you haven't used on Flixora before."
            footer={
                <Link to="/login" className="font-semibold text-white hover:underline">
                    Back to sign in
                </Link>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
                {errors.root && (
                    <div
                        role="alert"
                        className="rounded-md border border-red-500 bg-red-500/20 px-4 py-3 text-sm text-red-100"
                    >
                        {errors.root.message}{" "}
                        <Link to="/forgot-password" className="underline font-medium">
                            Request a new link
                        </Link>
                    </div>
                )}

                <AuthField
                    label="New password"
                    icon={Lock}
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    hint="At least 8 characters with one special symbol."
                    error={errors.password?.message}
                    {...register("password")}
                />

                <AuthField
                    label="Confirm password"
                    icon={Lock}
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-red py-4 text-[17px] font-bold shadow-[0_4px_20px_0_rgba(229,9,20,0.4)] transition-all hover:bg-[#F40612] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? "Updating..." : "Update password"}
                    {!isSubmitting && <Check className="h-5 w-5" />}
                </button>
            </form>
        </AuthCard>
    );
};

export default ResetPassword;