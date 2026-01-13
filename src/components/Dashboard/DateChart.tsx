import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { format, isToday } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle2, Clock } from "lucide-react";

interface Event {
  id: string;
  event_name: string;
  event_date: string;
  time_from: string;
  time_to: string;
  location: string;
}

interface Task {
  id: string;
  title: string;
  due_date: string;
  priority: string;
  status: string;
}

export const DateChart = () => {
  const [todaysEvents, setTodaysEvents] = useState<Event[]>([]);
  const [todaysTasks, setTodaysTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();

  const { token, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && token) {
      fetchTodaysData();
    }
  }, [token, authLoading]);

  const fetchTodaysData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const todayStr = format(today, 'yyyy-MM-dd');

      // Fetch today's events
      // Using start_date and end_date as today to filter for exact day
      const eventsData = await api.get(`/events/?start_date=${todayStr}&end_date=${todayStr}`, token);

      if (eventsData) {
        setTodaysEvents(eventsData || []);
      }

      // Fetch today's tasks
      const tasksData = await api.get(`/tasks/?start_date=${todayStr}&end_date=${todayStr}`, token);

      if (tasksData) {
        setTodaysTasks(tasksData || []);
      }
    } catch (error) {
      console.error('Error fetching today\'s data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-muted rounded-md"></div>
            <div className="h-16 bg-muted rounded-md"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Today's Date */}
          <div className="text-center py-4 bg-primary/5 rounded-lg border">
            <div className="text-2xl font-bold text-primary">
              {format(today, 'dd')}
            </div>
            <div className="text-sm text-muted-foreground">
              {format(today, 'EEEE, MMMM yyyy')}
            </div>
          </div>

          {/* Today's Events and Tasks */}
          {todaysEvents.length === 0 && todaysTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No events or tasks scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {/* Today's Events */}
              {todaysEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-2 p-3 rounded-md bg-secondary/50 border-l-4 border-primary"
                >
                  <CalendarIcon className="h-4 w-4 mt-0.5 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{event.event_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.time_from} - {event.time_to}
                    </p>
                    {event.location && (
                      <p className="text-xs text-muted-foreground truncate">
                        📍 {event.location}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Today's Tasks */}
              {todaysTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-2 p-3 rounded-md bg-secondary/50 border-l-4 border-accent"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 mt-0.5 text-orange-500" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={`text-xs ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </Badge>
                      <Badge
                        variant={task.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};