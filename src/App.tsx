
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Unauthorized } from "./pages/Unauthorized";
import { AuthProvider } from "./components/auth/AuthProvider";
import { LoadingSpinner } from "./components/ui/loading-spinner";
import { lazy, Suspense } from "react";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Projects = lazy(() => import("./pages/Projects"));
const NewProject = lazy(() => import("./pages/NewProject"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Team = lazy(() => import("./pages/Team"));
const TeamMemberDetails = lazy(() => import("./pages/TeamMemberDetails"));
const Settings = lazy(() => import("./pages/Settings"));
const AcceptInvitation = lazy(() => import("./pages/AcceptInvitation"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Welcome = lazy(() => import("./pages/Welcome").then(module => ({ default: module.Welcome })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then(module => ({ default: module.AdminDashboard })));
const PhotographerDashboard = lazy(() => import("./pages/PhotographerDashboard").then(module => ({ default: module.PhotographerDashboard })));
const CinematographerDashboard = lazy(() => import("./pages/CinematographerDashboard").then(module => ({ default: module.CinematographerDashboard })));
const PhotoEditorDashboard = lazy(() => import("./pages/PhotoEditorDashboard").then(module => ({ default: module.PhotoEditorDashboard })));
const VideoEditorDashboard = lazy(() => import("./pages/VideoEditorDashboard").then(module => ({ default: module.VideoEditorDashboard })));
const DroneDashboard = lazy(() => import("./pages/DroneDashboard").then(module => ({ default: module.DroneDashboard })));
const ClientPortal = lazy(() => import("./pages/ClientPortal").then(module => ({ default: module.ClientPortal })));
const WorkHistory = lazy(() => import("./pages/WorkHistory").then(module => ({ default: module.WorkHistory })));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><LoadingSpinner size={48} /></div>}>
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
              <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
              <Route path="/new-project" element={<ProtectedRoute requiredRoles={['studio_owner', 'project_manager']}><NewProject /></ProtectedRoute>} />
              <Route path="/project/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
              <Route path="/team" element={<ProtectedRoute requiredRoles={['studio_owner', 'project_manager']}><Team /></ProtectedRoute>} />
              <Route path="/team/:memberId" element={<ProtectedRoute><TeamMemberDetails /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/work-history" element={<ProtectedRoute><WorkHistory /></ProtectedRoute>} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
