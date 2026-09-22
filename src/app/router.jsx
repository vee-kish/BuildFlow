import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AppLayout } from "../layouts/AppLayout";
import { AuthSplash } from "../components/common/AuthSplash";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Unauthorized from "../pages/Unauthorized";
import Projects from "../pages/Projects";
import ProjectDetail from "../pages/ProjectDetail";
import Documents from "../pages/Documents";
import Issues from "../pages/Issues";
import IssueDetail from "../pages/IssueDetail";
import Team from "../pages/Team";
import Activity from "../pages/Activity";
import Settings from "../pages/Settings";

/** Blocks rendering until the session restore check finishes. */
function RequireAuth({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <AuthSplash />;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }
  return children;
}

/**
 * Role gate. `check` is a permission key (see PERMISSIONS). When the current
 * user's role fails the check we render the Unauthorized page.
 */
function RequirePermission({ check, children }) {
  const { can } = useAuth();
  if (check && !can(check)) return <Unauthorized />;
  return children;
}

function PublicOnly({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();
  if (initializing) return <AuthSplash />;
  if (isAuthenticated) {
    // After a successful sign-in `isAuthenticated` flips while still on /login.
    // Honour the preserved destination instead of always bouncing to /dashboard.
    const from = location.state?.from;
    return <Navigate to={from ?? "/dashboard"} replace />;
  }
  return children;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<ProjectDetail />} />
        <Route path="/documents" element={<Documents />} />
        <Route
          path="/issues"
          element={
            <RequirePermission check="canViewIssues">
              <Issues />
            </RequirePermission>
          }
        />
        <Route
          path="/issues/:issueId"
          element={
            <RequirePermission check="canViewIssues">
              <IssueDetail />
            </RequirePermission>
          }
        />
        <Route
          path="/team"
          element={
            <RequirePermission check="canViewTeam">
              <Team />
            </RequirePermission>
          }
        />
        <Route
          path="/activity"
          element={
            <RequirePermission check="canViewActivity">
              <Activity />
            </RequirePermission>
          }
        />
        <Route
          path="/settings"
          element={
            <RequirePermission check="canAccessSettings">
              <Settings />
            </RequirePermission>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
