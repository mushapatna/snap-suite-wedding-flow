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
  Battery,
  Image,
} from "lucide-react";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { format, isBefore, startOfDay } from "date-fns";
import { EventDetailsDialog } from "@/components/EventDetailsDialog";

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
  photographer?: string;
  project_details?: ProjectDetails; // populated by serializer
}



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
  const { user, profile, token } = useAuth();
  const [upcomingShoots, setUpcomingShoots] = useState<any[]>([]);
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

        // Filter events where the user is assigned as photographer
        // Handles comma-separated lists and case-insensitive matching
        const myEvents = eventsData.filter((e: Event) =>
          e.photographer && e.photographer.toLowerCase().includes(myName.toLowerCase())
        );

        const today = startOfDay(new Date());
        const processedEvents = myEvents.map((e: Event) => {
          const eventDate = startOfDay(new Date(e.event_date));
          if (e.status === 'upcoming' && isBefore(eventDate, today)) {
            return { ...e, status: 'completed' };
          }
          return e;
        });

        setUpcomingShoots(processedEvents.sort((a: any, b: any) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()));
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

        {/* Upcoming Shoots */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Upcoming Shoots</h2>
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {upcomingShoots.filter(e => e.status === 'upcoming').length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No upcoming shoots assigned.</p>
              ) : (
                upcomingShoots.filter(e => e.status === 'upcoming').map((shoot, index) => (
                  <EventDetailsDialog
                    key={index}
                    event={{
                      ...shoot,
                      event_name: shoot.project_details?.couple_name ? `${shoot.project_details.couple_name} - ${shoot.event_name}` : shoot.event_name
                    }}
                    trigger={
                      <div className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{shoot.project_details?.couple_name ? `${shoot.project_details.couple_name} - ${shoot.event_name}` : shoot.event_name}</h3>
                          <Badge variant="default">Confirmed</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{format(new Date(shoot.event_date), 'MMMM d, yyyy')} {shoot.time_from ? `at ${shoot.time_from}` : ''}</p>
                          <p>{shoot.location || shoot.project_details?.location}</p>
                          <p>{shoot.project_details?.event_type || 'Event'} Session</p>
                        </div>
                      </div>
                    }
                  />
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* Completed Shoots */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Completed Shoots</h2>
              <CheckCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {upcomingShoots.filter(e => e.status === 'completed').length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No completed shoots yet.</p>
              ) : (
                upcomingShoots.filter(e => e.status === 'completed').map((shoot, index) => (
                  <EventDetailsDialog
                    key={index}
                    event={{
                      ...shoot,
                      event_name: shoot.project_details?.couple_name ? `${shoot.project_details.couple_name} - ${shoot.event_name}` : shoot.event_name
                    }}
                    trigger={
                      <div className="border rounded-lg p-4 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-muted-foreground">{shoot.project_details?.couple_name ? `${shoot.project_details.couple_name} - ${shoot.event_name}` : shoot.event_name}</h3>
                          <Badge variant="secondary">Completed</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{format(new Date(shoot.event_date), 'MMMM d, yyyy')}</p>
                          <p>{shoot.location || shoot.project_details?.location}</p>
                        </div>
                      </div>
                    }
                  />
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* Data Submitted */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Data Submitted</h2>
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {upcomingShoots.filter(e => e.status === 'submitted').length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No data submissions yet.</p>
              ) : (
                upcomingShoots.filter(e => e.status === 'submitted').map((shoot, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-muted-foreground">{shoot.project_details?.couple_name ? `${shoot.project_details.couple_name} - ${shoot.event_name}` : shoot.event_name}</h3>
                      <Badge variant="outline" className="text-green-600 border-green-600">Submitted</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{format(new Date(shoot.event_date), 'MMMM d, yyyy')}</p>
                      <p>Data transferred successfully</p>
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