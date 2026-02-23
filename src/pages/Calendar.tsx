import { useState, useEffect, useMemo } from "react";
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
  isSameDay,
  parseISO
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowLeft, Clock, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EventDetailsDialog } from "@/components/EventDetailsDialog";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";

// Define a palette of distinct colors for projects
// Format: { bg: background, text: text color, border: border color, dot: dot color (for events) }
const PROJECT_COLORS = [
  { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-200", border: "border-blue-200 dark:border-blue-800", dot: "bg-blue-500" },
  { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-200", border: "border-emerald-200 dark:border-emerald-800", dot: "bg-emerald-500" },
  { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-200", border: "border-purple-200 dark:border-purple-800", dot: "bg-purple-500" },
  { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-200", border: "border-amber-200 dark:border-amber-800", dot: "bg-amber-500" },
  { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-200", border: "border-rose-200 dark:border-rose-800", dot: "bg-rose-500" },
  { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-200", border: "border-cyan-200 dark:border-cyan-800", dot: "bg-cyan-500" },
  { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-200", border: "border-indigo-200 dark:border-indigo-800", dot: "bg-indigo-500" },
  { bg: "bg-lime-100 dark:bg-lime-900/30", text: "text-lime-700 dark:text-lime-200", border: "border-lime-200 dark:border-lime-800", dot: "bg-lime-500" },
  { bg: "bg-fuchsia-100 dark:bg-fuchsia-900/30", text: "text-fuchsia-700 dark:text-fuchsia-200", border: "border-fuchsia-200 dark:border-fuchsia-800", dot: "bg-fuchsia-500" },
];

const getProjectColor = (projectId?: string) => {
  if (!projectId) return PROJECT_COLORS[0]; // Default fallback

  // Simple hash function to get consistent index from UUID
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    hash = projectId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % PROJECT_COLORS.length;
  return PROJECT_COLORS[index];
};

interface ProjectDetails {
  id: string;
  couple_name: string;
  event_type: string;
}

interface Event {
  id: string;
  event_name: string;
  event_date: string;
  time_from: string;
  time_to: string;
  event_type?: string;
  project_details?: ProjectDetails;
  [key: string]: any;
}

interface Task {
  id: string;
  title: string;
  due_date: string; // This is the key for calendar
  priority: string;
  status: string;
  project_details?: ProjectDetails;
  [key: string]: any;
}

export default function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchMonthData();
    }
  }, [currentDate, token]);

  const fetchMonthData = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const startDate = format(monthStart, 'yyyy-MM-dd');
      const endDate = format(monthEnd, 'yyyy-MM-dd');

      // Fetch ALL events (pagination handling)
      const eventsResponse = await api.get(
        `/events/?start_date=${startDate}&end_date=${endDate}`,
        token
      );
      const eventsData = Array.isArray(eventsResponse) ? eventsResponse : (eventsResponse.results || []);
      setEvents(eventsData);

      // Fetch ALL tasks (pagination handling)
      const tasksResponse = await api.get(
        `/tasks/?start_date=${startDate}&end_date=${endDate}`,
        token
      );
      const tasksData = Array.isArray(tasksResponse) ? tasksResponse : (tasksResponse.results || []);
      setTasks(tasksData);

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

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1400px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-2 hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                {format(currentDate, 'MMMM yyyy')}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth('prev')}
              className="hover:border-primary hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
              className="min-w-[80px] font-medium hover:border-primary hover:text-primary"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth('next')}
              className="hover:border-primary hover:text-primary transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 border-b bg-muted/30">
            {weekDays.map(day => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-muted-foreground py-3 border-r last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] bg-background">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDate(day);
              const dayTasks = getTasksForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`
                      relative p-2 border-b border-r last:border-r-0 transition-colors
                      ${!isCurrentMonth ? 'bg-muted/10 text-muted-foreground/50' : 'bg-background'}
                      ${isTodayDate ? 'bg-primary/5' : ''}
                      hover:bg-accent/5 group
                    `}
                  onClick={() => { }} // Optional: Open day view
                >
                  {/* Date Number */}
                  <div className="flex justify-between items-start mb-1">
                    <span className={`
                        text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                        ${isTodayDate ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground group-hover:text-foreground'}
                        `}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Events & Tasks Container */}
                  <div className="space-y-1 overflow-y-auto max-h-[100px] scrollbar-thin scrollbar-thumb-muted">
                    {/* Events */}
                    {dayEvents.map(event => {
                      const color = getProjectColor(event.project_details?.id);
                      return (
                        <EventDetailsDialog
                          key={event.id}
                          event={event as any}
                          onUpdate={fetchMonthData}
                          trigger={
                            <div
                              className={`px-2 py-1 text-xs font-medium rounded-md border truncate cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 ${color.bg} ${color.text} ${color.border}`}
                              title={`${event.event_name} (${event.time_from} - ${event.time_to})`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${color.dot}`} />
                              {event.time_from && <span className="opacity-75 text-[10px]">{event.time_from?.slice(0, 5)}</span>}
                              <span>{event.event_name}</span>
                            </div>
                          }
                        />
                      );
                    })}

                    {/* Tasks */}
                    {dayTasks.map(task => {
                      const color = getProjectColor(task.project_details?.id);
                      return (
                        <TaskDetailsDialog
                          key={task.id}
                          task={task as any}
                          onTaskUpdated={fetchMonthData}
                          trigger={
                            <div
                              className={`
                                px-2 py-1 text-xs font-medium rounded-md border truncate cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1
                                ${task.status === 'completed' ? 'decoration-slate-500 opacity-75' : ''}
                                ${color.bg} ${color.text} ${color.border}
                              `}
                              title={`Task: ${task.title}`}
                            >
                              {task.status === 'completed'
                                ? <CheckCircle2 className="w-3 h-3 shrink-0" />
                                : <Clock className="w-3 h-3 shrink-0" />
                              }
                              <span className={task.status === 'completed' ? 'line-through' : ''}>{task.title}</span>
                            </div>
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}