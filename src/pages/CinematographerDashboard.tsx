import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Video, 
  Upload, 
  Play, 
  Pause,
  Clock,
  HardDrive,
  Monitor,
  Camera
} from "lucide-react";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { useAuth } from "@/hooks/useAuth";

const videoProjects = [
  {
    title: "Smith & Johnson Wedding Film",
    status: "editing",
    progress: 65,
    deadline: "March 20, 2024",
    duration: "8:30"
  },
  {
    title: "Davis Engagement Video",
    status: "review",
    progress: 100,
    deadline: "March 18, 2024",
    duration: "3:45"
  },
  {
    title: "Brown Wedding Highlights",
    status: "rendering",
    progress: 85,
    deadline: "March 25, 2024",
    duration: "12:15"
  }
];

const renderQueue = [
  {
    project: "Davis Engagement - Final Cut",
    progress: 75,
    timeRemaining: "12 minutes",
    status: "rendering"
  },
  {
    project: "Smith Wedding - Preview",
    progress: 100,
    timeRemaining: "Complete",
    status: "completed"
  }
];

const equipment = [
  {
    item: "Sony FX6",
    status: "ready",
    battery: 89
  },
  {
    item: "DJI Ronin RS3",
    status: "charging",
    battery: 34
  },
  {
    item: "Audio Recorder",
    status: "ready",
    battery: 67
  },
  {
    item: "Wireless Mic Set",
    status: "ready",
    battery: 78
  }
];

const storageStats = [
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
                Cinematographer Dashboard
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

        {/* Video Projects & Render Queue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Video Projects */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Current Projects</h2>
              <Video className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {videoProjects.map((project, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{project.title}</h3>
                    <Badge 
                      variant={
                        project.status === 'editing' ? 'secondary' :
                        project.status === 'review' ? 'default' : 'outline'
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Duration: {project.duration}</span>
                      <span>Due: {project.deadline}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Render Queue */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Render Queue</h2>
              <Monitor className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {renderQueue.map((render, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{render.project}</h3>
                    <Badge 
                      variant={render.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {render.status}
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
        </motion.div>

        {/* Equipment & Storage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Equipment Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Equipment Status</h2>
              <Camera className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {equipment.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium text-sm">{item.item}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{item.battery}%</span>
                    <Badge 
                      variant={
                        item.status === 'ready' ? 'default' :
                        item.status === 'charging' ? 'secondary' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Storage Overview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Storage Overview</h2>
              <HardDrive className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {storageStats.map((storage, index) => (
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