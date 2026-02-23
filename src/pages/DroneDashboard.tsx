import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plane,
  MapPin,
  Battery,
  CloudRain,
  Wind,
  Camera,
  Upload,
  Calendar
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
  drone_operator?: string;
  project_details?: ProjectDetails; // populated by serializer
}

// Mock data


const mockWeatherData = [
  {
    metric: "Wind Speed",
    value: "8 mph",
    status: "good",
    icon: Wind
  },
  {
    metric: "Visibility",
    value: "10+ miles",
    status: "excellent",
    icon: Camera
  },
  {
    metric: "Precipitation",
    value: "0%",
    status: "clear",
    icon: CloudRain
  }
];

const quickActions = [
  {
    title: "Pre-flight Check",
    description: "Complete equipment inspection",
    icon: Plane,
    color: "bg-primary"
  },
  {
    title: "Upload Footage",
    description: "Upload aerial content",
    icon: Upload,
    color: "bg-secondary"
  },
  {
    title: "Log Flight",
    description: "Record flight details",
    icon: Calendar,
    color: "bg-accent"
  }
];

export const DroneDashboard = () => {
  const { user, profile, token } = useAuth();
  const [upcomingFlights, setUpcomingFlights] = useState<any[]>([]);
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

        // Filter events where the user is assigned as drone operator
        const myEvents = eventsData.filter((e: Event) =>
          e.drone_operator && e.drone_operator.toLowerCase().includes(myName.toLowerCase())
        );

        const today = startOfDay(new Date());
        const processedEvents = myEvents.map((e: Event) => {
          const eventDate = startOfDay(new Date(e.event_date));
          if (e.status === 'upcoming' && isBefore(eventDate, today)) {
            return { ...e, status: 'completed' };
          }
          return e;
        });

        setUpcomingFlights(processedEvents.sort((a: any, b: any) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()));
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
                Capture breathtaking aerial footage
              </p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              Drone Operator
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

        {/* Weather & Upcoming Flights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Weather Conditions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Current Weather</h2>
              <CloudRain className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {mockWeatherData.map((weather, index) => {
                const Icon = weather.icon;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{weather.metric}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{weather.value}</p>
                      <Badge
                        variant={
                          weather.status === 'excellent' ? 'default' :
                            weather.status === 'good' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {weather.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Upcoming Flights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Upcoming Flights</h2>
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                {upcomingFlights.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No upcoming flights assigned.</p>
                ) : (
                  upcomingFlights.map((flight, index) => (
                    <EventDetailsDialog
                      key={index}
                      event={{
                        ...flight,
                        event_name: flight.project_details?.couple_name ? `${flight.project_details.couple_name} - ${flight.event_name}` : flight.event_name
                      }}
                      trigger={
                        <div className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{flight.project_details?.couple_name ? `${flight.project_details.couple_name} - ${flight.event_name}` : flight.event_name}</h3>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={flight.status === 'upcoming' ? 'default' : 'secondary'}
                              >
                                {flight.status === 'upcoming' ? 'Approved' : flight.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>{format(new Date(flight.event_date), 'MMMM d, yyyy')} • {flight.time_from || 'TBD'}</p>
                            <p>{flight.location || flight.project_details?.location}</p>
                          </div>
                        </div>
                      }
                    />
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};