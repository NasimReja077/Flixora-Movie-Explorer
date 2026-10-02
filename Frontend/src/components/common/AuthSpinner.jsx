// src/features/auth/components/AuthSpinner.jsx
const AuthSpinner = () => (
    <div
        role="status"
        aria-label="Loading"
        className="flex min-h-screen items-center justify-center bg-bg-dark"
    >
        <div className="relative h-14 w-14">
            <div className="h-full w-full rounded-full border-4 border-white/10" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-brand-red" />
        </div>
    </div>
);

export default AuthSpinner;
