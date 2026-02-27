import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { WelcomeSection } from "@/components/Dashboard/WelcomeSection";
import { OverviewCards } from "@/components/Dashboard/OverviewCards";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { ActivityFeed } from "@/components/Dashboard/ActivityFeed";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && profile) {
      const role = profile.role;
      if (role === 'photographer') {
        navigate('/photographer-dashboard');
      } else if (role === 'cinematographer') {
        navigate('/cinematographer-dashboard');
      } else if (role === 'photo_editor') {
        navigate('/photo-editor-dashboard');
      } else if (role === 'video_editor') {
        navigate('/video-editor-dashboard');
      } else if (role === 'drone_operator') {
        navigate('/drone-dashboard');
      }
      // studio_owner and project_manager stay here
    }
  }, [profile, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <WelcomeSection profile={profile ? {
            id: profile.id,
            full_name: (profile.full_name as string | null | undefined) ?? null,
            company_name: (profile.company_name as string | null | undefined) ?? null,
            plan_type: (profile.plan_type as string | null | undefined) ?? null,
            role: profile.role ?? null,
          } : null} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <OverviewCards />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <QuickActions />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ActivityFeed />
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;