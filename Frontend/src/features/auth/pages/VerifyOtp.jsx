// src/pages/VerifyOtp.jsx
// Reached with navigate("/verify-otp", { state: { email, purpose } })
//   purpose "reset"  -> after the code is accepted, go to /reset-password
//   purpose "verify" -> email verification after signup, then go home
import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth.js";
import AuthCard from "../components/AuthCard.jsx";
import OtpInput from "../components/OtpInput.jsx";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const VerifyOtp = () => {
    const { verifyOtp, verifyEmail, forgotPassword, resendOtp } = useAuth();
    const navigate = useNavigate();
    const { state } = useLocation();
    const email = state?.email;
    const purpose = state?.purpose === "verify" ? "verify" : "reset";

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [cooldown, setCooldown] = useState(RESEND_SECONDS);

    // Resend countdown
    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    // Opened directly with no email -> start from the beginning
    if (!email) return <Navigate to={purpose === "verify" ? "/signup" : "/forgot-password"} replace />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== OTP_LENGTH) {
            setError(`Enter all ${OTP_LENGTH} digits`);
            return;
        }
        setError("");
        try {
            setSubmitting(true);
            if (purpose === "reset") {
                await verifyOtp(email, otp); // POST /auth/verify-otp { email, otp }
                navigate("/reset-password", { state: { email, otp }, replace: true });
            } else {
                await verifyEmail(email, otp); // POST /auth/verify-email { email, otp }
                toast.success("Email verified!");
                navigate("/", { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.message || "That code is wrong or has expired.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        try {
            if (purpose === "reset") await forgotPassword(email);
            else await resendOtp(email);
            toast.success("New code sent");
            setCooldown(RESEND_SECONDS);
        } catch (err) {
            toast.error(err.response?.data?.message || "Couldn't resend the code.");
        }
    };

    return (
        <AuthCard
            icon={ShieldCheck}
            title="Enter your code"
            subtitle={<>We sent a {OTP_LENGTH}-digit code to <span className="font-semibold text-gray-200">{email}</span>. It expires in 10 minutes.</>}
            footer={
                <Link to={purpose === "verify" ? "/signup" : "/forgot-password"} className="font-semibold text-white hover:underline">
                    Use a different email
                </Link>
            }
        >
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                <OtpInput length={OTP_LENGTH} onChange={(v) => { setOtp(v); setError(""); }} error={error} disabled={submitting} />

                <button type="submit" disabled={submitting || otp.length !== OTP_LENGTH}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-red py-4 text-[17px] font-bold shadow-[0_4px_20px_0_rgba(229,9,20,0.4)] transition-all hover:bg-[#F40612] disabled:cursor-not-allowed disabled:opacity-50">
                    {submitting ? "Verifying..." : "Verify code"}
                    {!submitting && <ArrowRight className="h-5 w-5" />}
                </button>

                <p className="text-center text-sm text-gray-400">
                    Didn't get it?{" "}
                    {cooldown > 0 ? (
                        <span className="text-gray-500">Resend in {cooldown}s</span>
                    ) : (
                        <button type="button" onClick={handleResend} className="font-semibold text-brand-red hover:underline">
                            Resend code
                        </button>
                    )}
                </p>
            </form>
        </AuthCard>
    );
};

export default VerifyOtp;