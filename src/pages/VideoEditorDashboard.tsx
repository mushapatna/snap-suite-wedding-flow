import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Scissors, 
  Play, 
  Download, 
  Clock,
  Monitor,
  HardDrive,
  Zap,
  Video
} from "lucide-react";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { useAuth } from "@/hooks/useAuth";

const editingProjects = [
  {
    title: "Smith Wedding - Main Film",
    status: "editing",
    progress: 45,
    deadline: "March 22, 2024",
    duration: "15:30",
    footage: "2.5 hours"
  },
  {
    title: "Davis Engagement - Highlights",
    status: "review",
    progress: 100,
    deadline: "March 19, 2024",
    duration: "4:20",
    footage: "45 minutes"
  },
  {
    title: "Brown Wedding - Ceremony",
    status: "rendering",
    progress: 75,
    deadline: "March 25, 2024",
    duration: "8:45",
    footage: "1.5 hours"
  }
];

const renderQueue = [
  {
    project: "Davis Highlights - 4K Export",
    progress: 85,
    timeRemaining: "8 minutes",
    status: "rendering",
    quality: "4K"
  },
  {
    project: "Smith Teaser - Instagram",
    progress: 100,
    timeRemaining: "Complete",
    status: "completed",
    quality: "1080p"
  },
  {
    project: "Brown Ceremony - Preview",
    progress: 35,
    timeRemaining: "25 minutes",
    status: "rendering",
    quality: "1080p"
  }
];

const todaysSchedule = [
  {
    task: "Color grade ceremony footage",
    project: "Smith Wedding",
    time: "9:00 AM - 12:00 PM",
    priority: "high"
  },
  {
    task: "Audio sync and cleanup",
    project: "Davis Engagement",
    time: "1:00 PM - 3:00 PM",
    priority: "medium"
  },
  {
    task: "Final cut review",
    project: "Brown Wedding",
    time: "3:30 PM - 5:00 PM",
    priority: "high"
  }
];

const systemStats = [
  {
    metric: "CPU Usage",
    value: 65,
    status: "normal"
  },
  {
    metric: "RAM Usage",
    value: 78,
    status: "warning"
  },
  {
    metric: "Storage",
    value: 45,
    status: "normal"
  },
  {
    metric: "GPU Usage",
    value: 89,
    status: "high"
  }
];

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
  const { user } = useAuth();

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
                Video Editor Dashboard
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

        {/* Editing Projects & System Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Editing Projects */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Active Projects</h2>
                <Video className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                {editingProjects.map((project, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{project.title}</h3>
                      <Badge 
                        variant={
                          project.status === 'editing' ? 'secondary' :
                          project.status === 'review' ? 'default' : 'outline'
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-muted-foreground">
                      <div>Duration: {project.duration}</div>
                      <div>Footage: {project.footage}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">Due: {project.deadline}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* System Stats */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">System Status</h2>
              <Monitor className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {systemStats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stat.metric}</span>
                    <span className="text-sm text-muted-foreground">{stat.value}%</span>
                  </div>
                  <Progress 
                    value={stat.value} 
                    className={`h-2 ${
                      stat.status === 'high' ? '[&>div]:bg-destructive' :
                      stat.status === 'warning' ? '[&>div]:bg-warning' : ''
                    }`}
                  />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Render Queue & Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Render Queue */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Render Queue</h2>
              <Zap className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {renderQueue.map((render, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{render.project}</h3>
                    <Badge 
                      variant={render.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {render.quality}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Progress value={render.progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{render.progress}% complete</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{render.timeRemaining}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Today's Schedule */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Today's Schedule</h2>
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {todaysSchedule.map((task, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-sm">{task.task}</h3>
                    <Badge 
                      variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{task.project}</p>
                  <p className="text-xs text-muted-foreground">{task.time}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};