import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  Camera,
  Video,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const quickActions = [
  {
    title: "Create New Project",
    description: "Start a new wedding project",
    icon: Plus,
    action: "create-project",
    color: "bg-primary"
  },
  {
    title: "Invite Team Member",
    description: "Add a new photographer or editor",
    icon: Users,
    action: "invite-member",
    color: "bg-secondary"
  },
  {
    title: "View Calendar",
    description: "Check upcoming events",
    icon: Calendar,
    action: "view-calendar",
    color: "bg-accent"
  }
];

export const AdminDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    active_projects: 0,
    team_members: 0,
    revenue: 0,
    client_satisfaction: '100%',
    recent_activity: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        const data = await api.get('/dashboard/stats/', token);
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create-project':
        navigate('/new-project');
        break;
      case 'invite-member':
        navigate('/team');
        break;
      case 'view-calendar':
        navigate('/calendar');
        break;
      default:
        console.warn('Unknown action:', action);
    }
  };

  const statsCards = [
    {
      title: "Active Projects",
      value: stats.active_projects.toString(),
      change: "Current active",
      icon: Calendar,
      color: "text-primary"
    },
    {
      title: "Team Members",
      value: stats.team_members.toString(),
      change: "Total members",
      icon: Users,
      color: "text-success"
    },
    {
      title: "This Month Revenue",
      value: "$0", // Placeholder until revenue logic is added
      change: "No data yet",
      icon: DollarSign,
      color: "text-warning"
    },
    {
      title: "Client Satisfaction",
      value: stats.client_satisfaction,
      change: "Based on feedback",
      icon: TrendingUp,
      color: "text-info"
    }
  ];

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
                Studio Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your wedding photography business
              </p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              Studio Owner
            </Badge>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.change}
                    </p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </Card>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
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
                    onClick={() => handleQuickAction(action.action)}
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

        {/* Recent Activity & Team Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Recent Activity */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {stats.recent_activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                stats.recent_activity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {activity.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-warning" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.details}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Team Overview */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Team Overview</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Photographers</span>
                </div>
                <Badge variant="secondary">3 active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Cinematographers</span>
                </div>
                <Badge variant="secondary">2 active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Editors</span>
                </div>
                <Badge variant="secondary">3 active</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/team')}>
              View All Team Members
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};