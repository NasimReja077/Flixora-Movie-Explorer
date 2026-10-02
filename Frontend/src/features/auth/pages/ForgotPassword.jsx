// src/features/auth/pages/ForgotPassword.jsx
// POST /api/auth/forgot-password  { email }
// Backend generates a reset token and emails a link: /reset-password/:token
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Mail, KeyRound, ArrowRight, MailCheck } from "lucide-react";

import { useAuth } from "../hooks/useAuth.js";
import AuthCard from "../components/AuthCard.jsx";
import AuthField from "../components/AuthField.jsx";

const schema = z.object({
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

const ForgotPassword = () => {
    const { forgotPassword } = useAuth();
    const [sent, setSent] = useState(false);
    const [sentEmail, setSentEmail] = useState("");

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({ resolver: zodResolver(schema), defaultValues: { email: "" } });

    const onSubmit = async ({ email }) => {
        try {
            await forgotPassword(email);
            setSentEmail(email);
            setSent(true);
        } catch (err) {
            setError("root", {
                message:
                    err.response?.data?.message ||
                    "Couldn't send the reset link. Please try again.",
            });
        }
    };

    // ── Success state ─────────────────────────────────────────────────────────
    if (sent) {
        return (
            <AuthCard
                icon={MailCheck}
                title="Check your inbox"
                subtitle={
                    <>
                        We sent a password-reset link to{" "}
                        <span className="font-semibold text-gray-200">{sentEmail}</span>.
                        Click the link in the email to choose a new password.
                        <br />
                        <span className="text-xs text-gray-500 mt-1 block">
                            Didn't receive it? Check your spam folder or try again below.
                        </span>
                    </>
                }
                footer={
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => setSent(false)}
                            className="text-brand-red font-semibold hover:underline"
                        >
                            Try a different email
                        </button>
                        <Link to="/login" className="font-semibold text-white hover:underline">
                            Back to sign in
                        </Link>
                    </div>
                }
            >
                {/* No form content in success state */}
                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                        <MailCheck className="h-8 w-8" />
                    </div>
                    <p className="text-center text-sm text-gray-400">
                        The link expires in <span className="text-white font-medium">1 hour</span>.
                    </p>
                </div>
            </AuthCard>
        );
    }

    // ── Request form ──────────────────────────────────────────────────────────
    return (
        <AuthCard
            icon={KeyRound}
            title="Forgot password?"
            subtitle="Enter the email you signed up with and we'll send you a reset link."
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

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-red py-4 text-[17px] font-bold shadow-[0_4px_20px_0_rgba(229,9,20,0.4)] transition-all hover:bg-[#F40612] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? "Sending link..." : "Send reset link"}
                    {!isSubmitting && <ArrowRight className="h-5 w-5" />}
                </button>
            </form>
        </AuthCard>
    );
};

export default ForgotPassword;