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

const upcomingFlights = [
  {
    event: "Smith & Johnson Wedding",
    date: "March 16, 2024",
    time: "3:00 PM - 4:30 PM",
    location: "Riverside Gardens",
    weather: "clear",
    clearance: "approved"
  },
  {
    event: "Davis Engagement Session",
    date: "March 20, 2024",
    time: "5:30 PM - 6:30 PM", 
    location: "Sunset Beach",
    weather: "partly-cloudy",
    clearance: "pending"
  }
];

const flightLogs = [
  {
    date: "March 12, 2024",
    event: "Brown Wedding",
    flightTime: "45 minutes",
    shots: 67,
    weather: "clear",
    incidents: "none"
  },
  {
    date: "March 10, 2024",
    event: "Johnson Anniversary",
    flightTime: "30 minutes",
    shots: 45,
    weather: "windy",
    incidents: "none"
  }
];

const equipment = [
  {
    item: "DJI Mavic 3 - Unit 1",
    battery: 95,
    status: "ready",
    lastMaintenance: "March 5, 2024"
  },
  {
    item: "DJI Mavic 3 - Unit 2",
    battery: 67,
    status: "charging",
    lastMaintenance: "March 1, 2024"
  },
  {
    item: "Extra Battery Pack 1",
    battery: 100,
    status: "ready",
    lastMaintenance: "March 8, 2024"
  },
  {
    item: "Extra Battery Pack 2",
    battery: 89,
    status: "ready",
    lastMaintenance: "March 8, 2024"
  }
];

const weatherData = [
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
                Drone Operator Dashboard
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
              {weatherData.map((weather, index) => {
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
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Upcoming Flights</h2>
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                {upcomingFlights.map((flight, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{flight.event}</h3>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={flight.clearance === 'approved' ? 'default' : 'secondary'}
                        >
                          {flight.clearance}
                        </Badge>
                        <Badge 
                          variant={
                            flight.weather === 'clear' ? 'default' :
                            flight.weather === 'partly-cloudy' ? 'secondary' : 'outline'
                          }
                        >
                          {flight.weather}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{flight.date} • {flight.time}</p>
                      <p>{flight.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Equipment Status & Flight Logs */}
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
              <Battery className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {equipment.map((item, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{item.item}</h3>
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Battery Level</span>
                      <span>{item.battery}%</span>
                    </div>
                    <Progress value={item.battery} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Last maintenance: {item.lastMaintenance}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Flight Logs */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Flight Logs</h2>
              <Plane className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {flightLogs.map((log, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{log.event}</h3>
                    <span className="text-xs text-muted-foreground">{log.date}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Flight time: {log.flightTime}</div>
                    <div>Shots captured: {log.shots}</div>
                    <div>Weather: {log.weather}</div>
                    <div>Incidents: {log.incidents}</div>
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