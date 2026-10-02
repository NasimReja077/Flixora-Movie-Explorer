// src/features/auth/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth.js";
import AuthSpinner from "../components/common/AuthSpinner.jsx";

/**
 * Wrap private pages:
 *   <Route element={<ProtectedRoute />}> ...private routes... </Route>
 * Admin-only pages:
 *   <Route element={<ProtectedRoute roles={["admin"]} />}> ... </Route>
 */
const ProtectedRoute = ({ roles }) => {
    const { user, initialized, loading } = useAuth();
    const location = useLocation();

    // Wait until the session check (refresh token / /me call) finishes
    const ready = initialized ?? !loading;
    if (!ready) return <AuthSpinner />;

    // Not signed in -> login, remember where they wanted to go
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Signed in but wrong role
    if (roles?.length && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
