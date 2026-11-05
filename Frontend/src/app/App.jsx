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
            background: "#121212",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "16px",
            fontSize: "13px",
            fontWeight: "500",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(20px)",
          },
          success: {
            style: {
              background: "#121212",
              border: "1px solid rgba(139, 92, 246, 0.5)",
            },
            iconTheme: {
              primary: "#8b5cf6",
              secondary: "#ffffff",
            },
          },
          error: {
            style: {
              background: "#121212",
              border: "1px solid rgba(214, 43, 112, 0.5)",
            },
            iconTheme: {
              primary: "#d62b70",
              secondary: "#ffffff",
            },
          },
        }}
      />
    </>
  );
};

export default App;