import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Plus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AddEventDialog } from "@/components/AddEventDialog";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { EventDetailsDialog } from "@/components/EventDetailsDialog";

interface Project {
  id: string;
  couple_name: string;
  event_date: string;
  event_type: string;
  location: string;
  service_type: string;
  status: string;
  progress_percentage: number;
  created_at: string;
}

interface Event {
  id: string;
  event_name: string;
  event_date: string;
  location?: string;
  time_from?: string;
  time_to?: string;
  google_map_link?: string;
  photographer?: string;
  cinematographer?: string;
  drone_operator?: string;
  site_manager?: string;
  assistant?: string;
  details?: string;
  instructions?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  category: string;
  assigned_to: string;
}

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, token, loading: authLoading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!authLoading) {
      fetchProjectData();
    }
  }, [id, refreshKey, authLoading, token]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const fetchProjectData = async () => {
    try {
      if (!token) {
        // Wait for token or redirect?
        // fetchProjectData is called in useEffect [id, refreshKey].
        // token comes from useAuth().
        // If token is null, we should redirect or wait.
        // Actually useAuth loading state handles this generally, but here we can check user/token.
        if (!loading && !user) {
          navigate("/login");
        }
        return;
      }

      // Fetch project details
      try {
        const projectData = await api.get(`/projects/${id}/`, token);
        setProject(projectData);

        // Fetch events for this project
        const eventsData = await api.get(`/events/?project_id=${id}`, token);
        // Django returns list, no need to access .data property if api.get returns json directly.
        // DRF ViewSet returns list of objects.
        // However, if pagination is enabled, it returns { count, next, previous, results }.
        // Default DRF has no pagination unless configured.
        // Let's assume list for now as per previous assumption, or check settings.py for REST_FRAMEWORK defaults.
        // I didn't verify pagination. If pagination is on, eventsData.results would be the array.
        // Safest to check isArray.
        if (Array.isArray(eventsData)) {
          setEvents(eventsData);
        } else if (eventsData.results) {
          setEvents(eventsData.results);
        }

        // Fetch tasks for this project
        const tasksData = await api.get(`/tasks/?project_id=${id}`, token);
        if (Array.isArray(tasksData)) {
          setTasks(tasksData);
        } else if (tasksData.results) {
          setTasks(tasksData.results);
        }

      } catch (error: any) {
        console.error("Error fetching project data:", error);
        toast({
          title: "Error",
          description: "Failed to load project details",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Project not found</div>
      </div>
    );
  }

  const eventDate = new Date(project.event_date);
  const isUpcoming = eventDate > new Date();

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Button>
      </div>

      {/* Project Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{project.couple_name}</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {project.event_type}
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {project.location}
          </div>
        </div>
      </div>

      {/* Project Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{project.progress_percentage}%</span>
            </div>
            <Progress value={project.progress_percentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Client Information</h4>
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="font-medium">Couple:</span> {project.couple_name}
                  </div>
                  <div>
                    <span className="font-medium">Event Type:</span> {project.event_type}
                  </div>
                  <div>
                    <span className="font-medium">Main Venue:</span> {project.location}
                  </div>
                  <div>
                    <span className="font-medium">Service Type:</span> {project.service_type}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Project Status</h4>
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Event Date:</span>{" "}
                    {format(eventDate, "PPP")}
                  </div>
                  <div>
                    <span className="font-medium">Event Status:</span>{" "}
                    <Badge variant={isUpcoming ? 'outline' : 'secondary'}>
                      {isUpcoming ? 'Upcoming' : 'Past'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events and Tasks Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Details */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Event Details</CardTitle>
            <AddEventDialog
              projectId={project.id}
              onEventAdded={handleRefresh}
              trigger={
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Event
                </Button>
              }
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.length > 0 ? (
                events.map((event) => {
                  const eventDate = new Date(event.event_date);
                  const isEventUpcoming = eventDate > new Date();
                  return (
                    <EventDetailsDialog
                      key={event.id}
                      event={event}
                      trigger={
                        <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{event.event_name}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(eventDate, "dd/MM/yyyy")}
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {event.location}
                                  </div>
                                )}
                                {event.time_from && event.time_to && (
                                  <div className="text-xs">
                                    {event.time_from} - {event.time_to}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge variant={isEventUpcoming ? 'outline' : 'secondary'}>
                              {isEventUpcoming ? 'Upcoming' : 'Past'}
                            </Badge>
                          </div>
                        </div>
                      }
                    />
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No events added yet. Create your first event to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tasks Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tasks (Editing & Post Production)</CardTitle>
            <CreateTaskDialog
              projectId={project.id}
              onTaskCreated={handleRefresh}
              trigger={
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Task
                </Button>
              }
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.length > 0 ? (
                tasks.map((task) => {
                  const taskDueDate = task.due_date ? new Date(task.due_date) : null;
                  const getPriorityColor = (priority: string) => {
                    switch (priority?.toLowerCase()) {
                      case 'high':
                        return 'bg-red-50 text-red-700 border-red-200';
                      case 'medium':
                        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
                      case 'low':
                        return 'bg-green-50 text-green-700 border-green-200';
                      default:
                        return 'bg-gray-50 text-gray-700 border-gray-200';
                    }
                  };

                  return (
                    <div key={task.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{task.title}</h4>
                          <div className="text-sm text-muted-foreground mt-1">
                            {task.category && <div>Category: {task.category}</div>}
                            {task.assigned_to && <div>Assigned to: {task.assigned_to}</div>}
                            {taskDueDate && <div>Due: {format(taskDueDate, "dd/MM/yyyy")}</div>}
                            {task.status && <div>Status: {task.status}</div>}
                          </div>
                        </div>
                        {task.priority && (
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No tasks yet. Create your first task to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}