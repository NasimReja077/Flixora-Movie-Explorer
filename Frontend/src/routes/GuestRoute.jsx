// src/features/auth/components/GuestRoute.jsx
// Login / Signup should not be visible to a user who is already signed in.
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth.js";
import AuthSpinner from "../components/common/AuthSpinner.jsx";

const GuestRoute = () => {
    const { user, initialized, loading } = useAuth();

    const ready = initialized ?? !loading;
    if (!ready) return <AuthSpinner />;

    if (user) {
        return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
    }
    return <Outlet />;
};

export default GuestRoute;
