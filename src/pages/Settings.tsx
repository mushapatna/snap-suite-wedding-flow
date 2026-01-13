import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { ProfileSettings } from "@/components/Settings/ProfileSettings";
import { AccountSettings } from "@/components/Settings/AccountSettings";
import { TeamSettings } from "@/components/Settings/TeamSettings";
import { NotificationSettings } from "@/components/Settings/NotificationSettings";
import { PreferencesSettings } from "@/components/Settings/PreferencesSettings";
import { SecuritySettings } from "@/components/Settings/SecuritySettings";
import {
  User as UserIcon,
  Shield,
  Users,
  Bell,
  Settings as SettingsIcon,
  Lock
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  plan_type: string | null;
  role: string | null;
  phone_number: string | null;
  location: string | null;
  years_in_business: string | null;
  weddings_per_year: string | null;
  services_offered: string[] | null;
  current_tools: string[] | null;
}

const Settings = () => {
  const { user, profile, loading } = useAuth();
  // Cast profile to local interface to satisfy TS for now, or use the one from Auth
  const userProfile = profile as unknown as Profile | null;
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground">Loading settings...</div>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      value: "profile",
      label: "Profile",
      icon: UserIcon,
      component: ProfileSettings
    },
    {
      value: "account",
      label: "Account",
      icon: Shield,
      component: AccountSettings
    },
    {
      value: "team",
      label: "Team",
      icon: Users,
      component: TeamSettings
    },
    {
      value: "notifications",
      label: "Notifications",
      icon: Bell,
      component: NotificationSettings
    },
    {
      value: "preferences",
      label: "Preferences",
      icon: SettingsIcon,
      component: PreferencesSettings
    },
    {
      value: "security",
      label: "Security",
      icon: Lock,
      component: SecuritySettings
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {tabs.map((tab) => {
              const Component = tab.component;
              return (
                <TabsContent key={tab.value} value={tab.value}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Component user={user} profile={userProfile} />
                  </motion.div>
                </TabsContent>
              );
            })}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;