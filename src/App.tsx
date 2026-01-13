
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import NewProject from "./pages/NewProject";
import ProjectDetails from "./pages/ProjectDetails";
import Calendar from "./pages/Calendar";
import Team from "./pages/Team";
import TeamMemberDetails from "./pages/TeamMemberDetails";
import Settings from "./pages/Settings";
import AcceptInvitation from "./pages/AcceptInvitation";
import NotFound from "./pages/NotFound";
import { Welcome } from "./pages/Welcome";
import { AdminDashboard } from "./pages/AdminDashboard";
import { PhotographerDashboard } from "./pages/PhotographerDashboard";
import { CinematographerDashboard } from "./pages/CinematographerDashboard";
import { PhotoEditorDashboard } from "./pages/PhotoEditorDashboard";
import { VideoEditorDashboard } from "./pages/VideoEditorDashboard";
import { DroneDashboard } from "./pages/DroneDashboard";
import { ClientPortal } from "./pages/ClientPortal";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Unauthorized } from "./pages/Unauthorized";
import { AuthProvider } from "./components/auth/AuthProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute requiredRoles={['studio_owner']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/photographer-dashboard" element={<ProtectedRoute requiredRoles={['photographer']}><PhotographerDashboard /></ProtectedRoute>} />
            <Route path="/cinematographer-dashboard" element={<ProtectedRoute requiredRoles={['cinematographer']}><CinematographerDashboard /></ProtectedRoute>} />
            <Route path="/photo-editor-dashboard" element={<ProtectedRoute requiredRoles={['photo_editor']}><PhotoEditorDashboard /></ProtectedRoute>} />
            <Route path="/video-editor-dashboard" element={<ProtectedRoute requiredRoles={['video_editor']}><VideoEditorDashboard /></ProtectedRoute>} />
            <Route path="/drone-dashboard" element={<ProtectedRoute requiredRoles={['drone_operator']}><DroneDashboard /></ProtectedRoute>} />
            <Route path="/client-portal" element={<ProtectedRoute requiredRoles={['client']}><ClientPortal /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/new-project" element={<ProtectedRoute requiredRoles={['studio_owner', 'project_manager']}><NewProject /></ProtectedRoute>} />
            <Route path="/project/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute requiredRoles={['studio_owner', 'project_manager']}><Team /></ProtectedRoute>} />
            <Route path="/team/:memberId" element={<ProtectedRoute><TeamMemberDetails /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
