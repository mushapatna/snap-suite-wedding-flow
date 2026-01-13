import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { format, isSameDay } from "date-fns";
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

export const DashboardCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const { token, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && token) {
      fetchEventsAndTasks();
    }
  }, [token, authLoading]);

  const fetchEventsAndTasks = async () => {
    if (!token) return;
    try {
      setLoading(true);
      // Fetch events
      const eventsData = await api.get('/events/', token);
      if (eventsData) {
        // Sort manually since API might not default sort by date perfectly or we want specific order
        // Though API likely returns ordered if specified in ViewSet/Model. 
        // DRF usually returns order of insertion unless ordering is set. 
        // Let's sort client side to be safe as done in original code effectively.
        setEvents(eventsData.sort((a: Event, b: Event) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()));
      }

      // Fetch tasks
      const tasksData = await api.get('/tasks/', token);
      if (tasksData) {
        setTasks(tasksData.sort((a: Task, b: Task) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event =>
      isSameDay(new Date(event.event_date), date)
    );
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task =>
      task.due_date && isSameDay(new Date(task.due_date), date)
    );
  };

  const getDatesWithEvents = () => {
    const dates = new Set();
    events.forEach(event => {
      dates.add(event.event_date);
    });
    tasks.forEach(task => {
      if (task.due_date) {
        dates.add(task.due_date);
      }
    });
    return Array.from(dates).map(date => new Date(date as string));
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

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
            Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded-md"></div>
            <div className="h-20 bg-muted rounded-md"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasEvents: getDatesWithEvents(),
            }}
            modifiersStyles={{
              hasEvents: {
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                borderRadius: '6px',
              },
            }}
          />
        </motion.div>

        {selectedDate && (selectedDateEvents.length > 0 || selectedDateTasks.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <h4 className="font-semibold text-sm">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h4>

            {selectedDateEvents.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Events
                </h5>
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-2 p-2 rounded-md bg-secondary/50"
                  >
                    <CalendarIcon className="h-4 w-4 mt-0.5 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{event.event_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.time_from} - {event.time_to}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {event.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedDateTasks.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Tasks
                </h5>
                {selectedDateTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-2 p-2 rounded-md bg-secondary/50"
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
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {selectedDate && selectedDateEvents.length === 0 && selectedDateTasks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No events or tasks for this date
          </p>
        )}
      </CardContent>
    </Card>
  );
};