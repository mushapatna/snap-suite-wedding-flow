import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  isSameDay
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Event {
  id: string;
  event_name: string;
  event_date: string;
  time_from: string;
  time_to: string;
}

interface Task {
  id: string;
  title: string;
  due_date: string;
  priority: string;
  status: string;
}

export default function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchMonthData();
    }
  }, [currentDate, token]);

  const fetchMonthData = async () => {
    if (!token) return;

    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const startDate = format(monthStart, 'yyyy-MM-dd');
      const endDate = format(monthEnd, 'yyyy-MM-dd');

      // Fetch events for the month logic
      const eventsData = await api.get(
        `/events/?start_date=${startDate}&end_date=${endDate}`,
        token
      );
      setEvents(eventsData || []);

      // Fetch tasks for the month logic
      const tasksData = await api.get(
        `/tasks/?start_date=${startDate}&end_date=${endDate}`,
        token
      );
      setTasks(tasksData || []);

    } catch (error) {
      console.error('Error fetching month data:', error);
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

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev =>
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-muted rounded-md"></div>
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CalendarIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              {format(currentDate, 'MMMM yyyy')}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card className="shadow-soft">
          <CardContent className="p-6">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-4 mb-4">
              {weekDays.map(day => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-4">
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDate(day);
                const dayTasks = getTasksForDate(day);
                const hasItems = dayEvents.length > 0 || dayTasks.length > 0;
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);

                return (
                  <motion.div
                    key={day.toISOString()}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.01 }}
                    whileHover={{ scale: 1.02 }}
                    className={`
                      relative h-32 p-2 border rounded-lg cursor-pointer transition-all duration-200
                      ${isTodayDate
                        ? 'bg-primary/10 border-primary'
                        : isCurrentMonth
                          ? 'bg-background border-border hover:bg-secondary/50'
                          : 'bg-muted/30 border-muted text-muted-foreground'
                      }
                      ${hasItems ? 'border-l-4 border-l-accent' : ''}
                    `}
                  >
                    {/* Day Number */}
                    <div className={`
                      text-sm font-medium mb-1
                      ${isTodayDate ? 'text-primary font-bold' : ''}
                    `}>
                      {format(day, 'd')}
                    </div>

                    {/* Events and Tasks */}
                    <div className="space-y-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className="text-xs p-1 bg-primary/10 text-primary rounded truncate"
                          title={`${event.event_name} ${event.time_from}-${event.time_to}`}
                        >
                          📅 {event.event_name}
                        </div>
                      ))}
                      {dayTasks.slice(0, 2).map(task => (
                        <div
                          key={task.id}
                          className="text-xs p-1 bg-accent/10 text-accent-foreground rounded truncate"
                          title={task.title}
                        >
                          ✓ {task.title}
                        </div>
                      ))}
                      {(dayEvents.length + dayTasks.length) > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length + dayTasks.length - 2} more
                        </div>
                      )}
                    </div>

                    {/* Today indicator */}
                    {isTodayDate && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}