import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import WorkspacePage from "./pages/WorkspacePage.jsx";
import ProjectPage from "./pages/ProjectPage.jsx";
import TaskPage from "./pages/TaskPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/workspaces/:workspaceId" element={<WorkspacePage />} />
        <Route
          path="/workspaces/:workspaceId/projects/:projectId"
          element={<ProjectPage />}
        />
        <Route
          path="/workspaces/:workspaceId/projects/:projectId/tasks/:taskId"
          element={<TaskPage />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
