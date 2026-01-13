import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Edit3, 
  Download, 
  Eye, 
  Clock,
  CheckCircle,
  AlertCircle,
  Image,
  Palette
} from "lucide-react";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { useAuth } from "@/hooks/useAuth";

const editingQueue = [
  {
    project: "Smith & Johnson Wedding",
    photos: 245,
    edited: 180,
    approved: 150,
    deadline: "March 18, 2024",
    priority: "high",
    client: "Sarah Smith"
  },
  {
    project: "Davis Engagement Session",
    photos: 89,
    edited: 89,
    approved: 75,
    deadline: "March 20, 2024",
    priority: "medium",
    client: "Mike Davis"
  },
  {
    project: "Brown Family Portraits",
    photos: 45,
    edited: 25,
    approved: 0,
    deadline: "March 25, 2024",
    priority: "low",
    client: "Lisa Brown"
  }
];

const recentDeliveries = [
  {
    project: "Johnson Anniversary",
    deliveredAt: "2 hours ago",
    photos: 67,
    status: "delivered"
  },
  {
    project: "Smith Maternity",
    deliveredAt: "1 day ago", 
    photos: 34,
    status: "approved"
  },
  {
    project: "Davis Wedding",
    deliveredAt: "3 days ago",
    photos: 189,
    status: "revision-requested"
  }
];

const todaysTasks = [
  {
    task: "Edit ceremony photos",
    project: "Smith Wedding",
    estimated: "3 hours",
    priority: "high"
  },
  {
    task: "Color correction",
    project: "Davis Engagement",
    estimated: "1.5 hours",
    priority: "medium"
  },
  {
    task: "Final retouching",
    project: "Brown Portraits", 
    estimated: "2 hours",
    priority: "low"
  }
];

const quickActions = [
  {
    title: "Start Editing",
    description: "Begin photo editing session",
    icon: Edit3,
    color: "bg-primary"
  },
  {
    title: "Review & Approve",
    description: "Check edited photos",
    icon: Eye,
    color: "bg-secondary"
  },
  {
    title: "Export & Deliver",
    description: "Prepare final delivery",
    icon: Download,
    color: "bg-accent"
  }
];

export const PhotoEditorDashboard = () => {
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
                Photo Editor Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Transform raw captures into stunning memories
              </p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              Photo Editor
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

        {/* Editing Queue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Editing Queue</h2>
              <Palette className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {editingQueue.map((project, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{project.project}</h3>
                      <p className="text-sm text-muted-foreground">Client: {project.client}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          project.priority === 'high' ? 'destructive' :
                          project.priority === 'medium' ? 'default' : 'secondary'
                        }
                      >
                        {project.priority} priority
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{project.photos}</p>
                      <p className="text-xs text-muted-foreground">Total Photos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{project.edited}</p>
                      <p className="text-xs text-muted-foreground">Edited</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success">{project.approved}</p>
                      <p className="text-xs text-muted-foreground">Approved</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Editing Progress</span>
                      <span>{Math.round((project.edited / project.photos) * 100)}%</span>
                    </div>
                    <Progress value={(project.edited / project.photos) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">Due: {project.deadline}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Today's Tasks & Recent Deliveries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Today's Tasks */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Today's Tasks</h2>
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {todaysTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{task.task}</p>
                    <p className="text-xs text-muted-foreground">{task.project}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{task.estimated}</p>
                    <Badge 
                      variant={
                        task.priority === 'high' ? 'destructive' :
                        task.priority === 'medium' ? 'default' : 'secondary'
                      }
                      className="text-xs mt-1"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Deliveries */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Deliveries</h2>
              <Image className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {recentDeliveries.map((delivery, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{delivery.project}</p>
                    <p className="text-xs text-muted-foreground">{delivery.photos} photos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{delivery.deliveredAt}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {delivery.status === 'delivered' && <CheckCircle className="w-3 h-3 text-success" />}
                      {delivery.status === 'approved' && <CheckCircle className="w-3 h-3 text-primary" />}
                      {delivery.status === 'revision-requested' && <AlertCircle className="w-3 h-3 text-warning" />}
                      <Badge 
                        variant={
                          delivery.status === 'delivered' ? 'default' :
                          delivery.status === 'approved' ? 'default' : 'outline'
                        }
                        className="text-xs"
                      >
                        {delivery.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};