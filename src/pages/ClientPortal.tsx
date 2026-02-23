import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  Download,
  MessageCircle,
  Calendar,
  Image,
  Video,
  CheckCircle,
  Clock,
  Star,
  Eye
} from "lucide-react";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { useAuth } from "@/hooks/useAuth";

const projectProgress = [
  {
    milestone: "Engagement Session",
    status: "completed",
    date: "March 10, 2024",
    progress: 100,
    deliverables: "67 edited photos"
  },
  {
    milestone: "Pre-wedding Consultation",
    status: "completed",
    date: "March 5, 2024",
    progress: 100,
    deliverables: "Shot list & timeline"
  },
  {
    milestone: "Wedding Day Coverage",
    status: "in-progress",
    date: "March 22, 2024",
    progress: 75,
    deliverables: "Photography & videography"
  },
  {
    milestone: "Final Gallery Delivery",
    status: "upcoming",
    date: "April 5, 2024",
    progress: 0,
    deliverables: "500+ photos & highlight reel"
  }
];

const galleries = [
  {
    title: "Engagement Session",
    photos: 67,
    videos: 0,
    status: "ready",
    uploadDate: "March 12, 2024",
    approved: true
  },
  {
    title: "Bridal Portrait Session",
    photos: 45,
    videos: 1,
    status: "review",
    uploadDate: "March 15, 2024",
    approved: false
  },
  {
    title: "Wedding Day Preview",
    photos: 25,
    videos: 1,
    status: "ready",
    uploadDate: "March 23, 2024",
    approved: false
  }
];

const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "Lead Photographer",
    avatar: "SJ",
    status: "available"
  },
  {
    name: "Mike Chen",
    role: "Cinematographer",
    avatar: "MC",
    status: "available"
  },
  {
    name: "Emma Davis",
    role: "Assistant Photographer",
    avatar: "ED",
    status: "busy"
  }
];

const recentMessages = [
  {
    from: "Sarah Johnson",
    message: "Your engagement photos are ready for review!",
    time: "2 hours ago",
    unread: true
  },
  {
    from: "Mike Chen",
    message: "Wedding day timeline has been updated",
    time: "1 day ago",
    unread: false
  },
  {
    title: "Welcome!",
    message: "Welcome to EVENTPIXIO! We're excited for your big day.",
    action: "Let's Get Started",
    unread: false
  }
];

const quickActions = [
  {
    title: "View Galleries",
    description: "Browse your photos & videos",
    icon: Image,
    color: "bg-primary"
  },
  {
    title: "Download Files",
    description: "Get your final deliverables",
    icon: Download,
    color: "bg-secondary"
  },
  {
    title: "Message Team",
    description: "Chat with your photographers",
    icon: MessageCircle,
    color: "bg-accent"
  }
];

export const ClientPortal = () => {
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
              <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-2">
                <Heart className="w-8 h-8 text-primary" />
                Welcome Back!
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your wedding project progress and view your memories
              </p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              Client
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

        {/* Project Progress & Recent Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Project Progress */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Project Progress</h2>
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {projectProgress.map((milestone, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{milestone.milestone}</h3>
                    <div className="flex items-center gap-1">
                      {milestone.status === 'completed' && <CheckCircle className="w-4 h-4 text-success" />}
                      {milestone.status === 'in-progress' && <Clock className="w-4 h-4 text-warning" />}
                      <Badge
                        variant={
                          milestone.status === 'completed' ? 'default' :
                            milestone.status === 'in-progress' ? 'secondary' : 'outline'
                        }
                      >
                        {milestone.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Progress value={milestone.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{milestone.deliverables}</span>
                      <span>{milestone.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Messages */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Messages</h2>
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {recentMessages.map((message, index) => (
                <div key={index} className={`border rounded-lg p-3 ${message.unread ? 'bg-primary/5 border-primary/20' : ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-sm">{message.from}</h3>
                    <div className="flex items-center gap-1">
                      {message.unread && <div className="w-2 h-2 bg-primary rounded-full" />}
                      <span className="text-xs text-muted-foreground">{message.time}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{message.message}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Galleries & Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Galleries */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Galleries</h2>
              <Image className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {galleries.map((gallery, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{gallery.title}</h3>
                    <div className="flex items-center gap-2">
                      {gallery.approved && <CheckCircle className="w-4 h-4 text-success" />}
                      <Badge
                        variant={gallery.status === 'ready' ? 'default' : 'secondary'}
                      >
                        {gallery.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Image className="w-3 h-3" />
                        <span>{gallery.photos}</span>
                      </div>
                      {gallery.videos > 0 && (
                        <div className="flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          <span>{gallery.videos}</span>
                        </div>
                      )}
                    </div>
                    <span>{gallery.uploadDate}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <Eye className="w-3 h-3 mr-1" />
                    View Gallery
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Your Team */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Team</h2>
              <Star className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">{member.avatar}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <Badge
                    variant={member.status === 'available' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {member.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <MessageCircle className="w-4 h-4 mr-2" />
              Message Team
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};