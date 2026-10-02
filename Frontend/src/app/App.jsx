import { Suspense, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { useDispatch } from "react-redux";
import { routes } from "./app.route.jsx";
import { Toaster } from "react-hot-toast";
import {
  fetchMe,
  markSessionChecked,
} from "../features/auth/state/auth.slice.js";

const App = () => {
  const dispatch = useDispatch();

  // Only check for an active session cookie before hitting /api/auth/me.
  // This avoids noisy 401s for guests while still restoring logged-in users.
  useEffect(() => {
    const hasSessionCookie = document.cookie
      .split("; ")
      .some((cookie) => cookie.startsWith("token="));

    if (hasSessionCookie) {
      dispatch(fetchMe());
      return;
    }

    dispatch(markSessionChecked());
  }, [dispatch]);

  return (
    <>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
            Loading...
          </div>
        }
      >
        <RouterProvider router={routes} />
      </Suspense>

      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#111827",
            color: "#f9fafb",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: "12px",
            fontSize: "13px",
            boxShadow: "0 10px 25px rgba(15, 23, 42, 0.2)",
          },
          success: {
            style: {
              background: "#0f172a",
              border: "1px solid rgba(34, 197, 94, 0.4)",
            },
          },
          error: {
            style: {
              background: "#111827",
              border: "1px solid rgba(239, 68, 68, 0.4)",
            },
          },
        }}
      />
    </>
  );
};

export default App;