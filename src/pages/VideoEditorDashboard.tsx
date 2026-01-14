import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Scissors,
  Play,
  Download,
  Video
} from "lucide-react";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// Define interfaces matching our API
interface ProjectDetails {
  id: string;
  couple_name: string;
  event_type: string;
  location: string;
}

interface Task {
  id: string;
  title: string;
  department: 'photo' | 'video';
  category?: string;
  priority?: 'high' | 'medium' | 'low';
  due_date?: string;
  assigned_to?: string;
  estimated_hours?: number;
  description?: string;
  status: string;
  project_details?: ProjectDetails;
}

const quickActions = [
  {
    title: "Start New Edit",
    description: "Begin video editing project",
    icon: Scissors,
    color: "bg-primary"
  },
  {
    title: "Preview & Review",
    description: "Review edited sequences",
    icon: Play,
    color: "bg-secondary"
  },
  {
    title: "Export & Deliver",
    description: "Render final videos",
    icon: Download,
    color: "bg-accent"
  }
];

export const VideoEditorDashboard = () => {
  const { user, profile, token } = useAuth();
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !profile?.full_name) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all tasks for now (ideally filter via API)
        const data = await api.get('/tasks/', token);
        const myName = profile.full_name;

        // Filter tasks assigned to me AND in video department
        // Also handles case where assigned_to might be just part of name or null
        const filtered = data.filter((t: Task) =>
          t.department === 'video' &&
          t.assigned_to &&
          t.assigned_to.toLowerCase().includes(myName.toLowerCase())
        );

        // Sort by due date
        setMyTasks(filtered.sort((a: any, b: any) =>
          (new Date(a.due_date || '9999-12-31').getTime()) - (new Date(b.due_date || '9999-12-31').getTime())
        ));
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
                Craft cinematic wedding stories
              </p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              Video Editor
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

        {/* Editing Projects (Tasks) */}
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
              {myTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No assignments found.</p>
              ) : (
                myTasks.map((task, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-xs text-muted-foreground">{task.project_details?.couple_name}</p>
                      </div>
                      <Badge
                        variant={
                          task.status === 'editing' ? 'secondary' :
                            task.status === 'review' ? 'default' : 'outline'
                        }
                      >
                        {task.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-muted-foreground">
                      <div>Due: {task.due_date || 'No Date'}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{task.status === 'completed' ? 100 : 25}%</span>
                      </div>
                      <Progress value={task.status === 'completed' ? 100 : 25} className="h-2" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

      </div>
    </div>
  );
};