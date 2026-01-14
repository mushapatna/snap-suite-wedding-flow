import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Video,
  Upload,
  Play,
  HardDrive,
  Monitor,
  Camera
} from "lucide-react";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { format } from "date-fns";

// Define interfaces matching our API
interface ProjectDetails {
  id: string;
  couple_name: string;
  event_type: string;
  location: string;
}

interface Event {
  id: string;
  event_name: string;
  event_date: string;
  time_from?: string;
  time_to?: string;
  location?: string;
  status: string;
  cinematographer?: string;
  project_details?: ProjectDetails; // populated by serializer
}



const mockStorageStats = [
  {
    drive: "Main SSD",
    used: 75,
    total: 100,
    type: "TB"
  },
  {
    drive: "Backup HDD",
    used: 45,
    total: 80,
    type: "TB"
  }
];

const quickActions = [
  {
    title: "Upload Footage",
    description: "Upload raw video files",
    icon: Upload,
    color: "bg-primary"
  },
  {
    title: "Start New Edit",
    description: "Begin editing project",
    icon: Video,
    color: "bg-secondary"
  },
  {
    title: "Review & Approve",
    description: "Check completed edits",
    icon: Play,
    color: "bg-accent"
  }
];

export const CinematographerDashboard = () => {
  const { user, profile, token } = useAuth();
  const [videoProjects, setVideoProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !profile?.full_name) {
        setLoading(false);
        return;
      }

      try {
        const eventsData = await api.get('/events/', token);
        const myName = profile.full_name;

        // Filter events where the user is assigned as cinematographer
        const myEvents = eventsData.filter((e: Event) =>
          e.cinematographer && e.cinematographer.toLowerCase().includes(myName.toLowerCase())
        );

        setVideoProjects(myEvents.sort((a: any, b: any) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()));
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, profile]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="container mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">
                Hello, {profile?.full_name || user?.username}
              </h1>
              <p className="text-muted-foreground mt-1">
                Create stunning wedding films and manage video production
              </p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              Cinematographer
            </Badge>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.title}
                    variant="outline"
                    className="h-auto p-4 text-left justify-start"
                  >
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mr-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </Button>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Video Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Active Assignments</h2>
              <Video className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {videoProjects.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No assignments found.</p>
              ) : (
                videoProjects.map((project, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">{project.project_details?.couple_name || project.event_name}</h3>
                      <Badge
                        variant={
                          project.status === 'upcoming' ? 'secondary' :
                            project.status === 'completed' ? 'default' : 'outline'
                        }
                      >
                        {project.status === 'upcoming' ? 'Confirmed' : project.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{format(new Date(project.event_date), 'MMMM d, yyyy')}</span>
                        <span>{project.project_details?.event_type}</span>
                      </div>
                      {/* Mock progress as we don't have this data yet */}
                      <Progress value={project.status === 'completed' ? 100 : 0} className="h-2" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* Storage Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Storage Overview</h2>
              <HardDrive className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {mockStorageStats.map((storage, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{storage.drive}</span>
                    <span className="text-xs text-muted-foreground">
                      {storage.used}/{storage.total} {storage.type}
                    </span>
                  </div>
                  <Progress value={(storage.used / storage.total) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {Math.round((storage.used / storage.total) * 100)}% used
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};