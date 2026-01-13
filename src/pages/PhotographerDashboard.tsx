import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Camera, 
  Upload, 
  Calendar, 
  CheckCircle, 
  Clock,
  Battery,
  Image,
  Users
} from "lucide-react";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { useAuth } from "@/hooks/useAuth";

const upcomingShoots = [
  {
    couple: "Smith & Johnson",
    date: "March 15, 2024",
    time: "2:00 PM",
    location: "Central Park",
    type: "Engagement",
    status: "confirmed"
  },
  {
    couple: "Davis & Brown",
    date: "March 22, 2024", 
    time: "4:00 PM",
    location: "Beach Resort",
    type: "Wedding",
    status: "prep-needed"
  }
];

const shotProgress = [
  {
    project: "Smith & Johnson Wedding",
    completed: 245,
    total: 300,
    percentage: 82
  },
  {
    project: "Davis Engagement",
    completed: 89,
    total: 120,
    percentage: 74
  }
];

const equipment = [
  {
    item: "Canon R5 - Body 1",
    status: "ready",
    battery: 95
  },
  {
    item: "Canon R5 - Body 2", 
    status: "charging",
    battery: 45
  },
  {
    item: "24-70mm f/2.8",
    status: "ready",
    battery: null
  },
  {
    item: "85mm f/1.4",
    status: "maintenance",
    battery: null
  }
];

const quickActions = [
  {
    title: "Upload Photos",
    description: "Upload today's shoot",
    icon: Upload,
    color: "bg-primary"
  },
  {
    title: "Mark Shots Complete",
    description: "Update shot list progress",
    icon: CheckCircle,
    color: "bg-success"
  },
  {
    title: "Equipment Check",
    description: "Verify gear for next shoot",
    icon: Camera,
    color: "bg-secondary"
  }
];

export const PhotographerDashboard = () => {
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
                Photographer Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your shoots and capture beautiful moments
              </p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              Photographer
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

        {/* Upcoming Shoots & Shot Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Upcoming Shoots */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Upcoming Shoots</h2>
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {upcomingShoots.map((shoot, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{shoot.couple}</h3>
                    <Badge 
                      variant={shoot.status === 'confirmed' ? 'default' : 'secondary'}
                    >
                      {shoot.status === 'confirmed' ? 'Confirmed' : 'Prep Needed'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{shoot.date} at {shoot.time}</p>
                    <p>{shoot.location}</p>
                    <p>{shoot.type} Session</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Shot Progress */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Shot Progress</h2>
              <Image className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {shotProgress.map((project, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{project.project}</h3>
                    <span className="text-sm text-muted-foreground">
                      {project.completed}/{project.total}
                    </span>
                  </div>
                  <Progress value={project.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {project.percentage}% complete
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Equipment Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Equipment Status</h2>
              <Camera className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {equipment.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-medium text-sm mb-2">{item.item}</h3>
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={
                        item.status === 'ready' ? 'default' :
                        item.status === 'charging' ? 'secondary' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {item.status}
                    </Badge>
                    {item.battery && (
                      <div className="flex items-center gap-1">
                        <Battery className="w-3 h-3" />
                        <span className="text-xs">{item.battery}%</span>
                      </div>
                    )}
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