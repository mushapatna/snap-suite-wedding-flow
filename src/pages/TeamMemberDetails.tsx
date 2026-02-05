import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth, type User } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  FileText,
  MapPin,
  Users
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone_number: string | null;
  whatsapp_number: string | null;
  email: string | null;
  status: string;
  created_at: string;
}

interface Project {
  id: string;
  couple_name: string;
  event_date: string;
  location: string;
  status: string;
  progress_percentage: number;
}

interface Task {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  due_date: string | null;
  estimated_hours: number | null;
  project: string; // ID
  project_id: string;
}

interface Event {
  id: string;
  event_name: string;
  event_date: string;
  time_from: string | null;
  time_to: string | null;
  location: string | null;
  project: string; // ID
}

interface FileSubmission {
  id: string;
  file_name: string;
  submission_type: string;
  review_status: string;
  uploaded_at: string;
  event: string; // ID
  team_member_name: string;
}

export default function TeamMemberDetails() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [fileSubmissions, setFileSubmissions] = useState<FileSubmission[]>([]);

  const { token, user: activeUser, loading: authLoading } = useAuth();

  // Use activeUser for state
  useEffect(() => {
    setUser(activeUser);
  }, [activeUser]);

  useEffect(() => {
    if (!authLoading && !activeUser) {
      navigate('/login');
    }
  }, [authLoading, activeUser, navigate]);

  useEffect(() => {
    if (activeUser && token && memberId) {
      fetchTeamMemberData();
    }
  }, [memberId, activeUser, token]);

  const fetchTeamMemberData = async () => {
    if (!token || !memberId) return;

    try {
      setLoading(true);

      // Fetch team member details
      const memberData = await api.get(`/contacts/${memberId}/`, token);
      setTeamMember(memberData);

      if (!memberData) return;

      const tasksData = await api.get(`/tasks/?assigned_to=${memberData.name}`, token);
      setTasks(tasksData || []);

      const eventsData = await api.get(`/events/?assigned_to=${memberData.name}`, token);
      setEvents(eventsData || []);

      const projectIds = new Set([
        ...tasksData?.map((t: any) => t.project) || [],
        ...eventsData?.map((e: any) => e.project) || []
      ]);

      if (projectIds.size > 0) {
        const idsString = Array.from(projectIds).join(',');
        const projectsData = await api.get(`/projects/?ids=${idsString}`, token);
        setProjects(projectsData || []);
      }

      const filesData = await api.get(`/submissions/?team_member_name=${memberData.name}`, token);
      setFileSubmissions(filesData || []);

    } catch (error) {
      console.error('Error fetching team member data:', error);
      toast({
        title: "Error",
        description: "Failed to load team member data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProject = (projectId: string) => projects.find(p => p.id === projectId);
  const getEvent = (eventId: string) => events.find(e => e.id === eventId); // Note: fetchTeamMemberData fetches events for member. File might allow generic event? 
  // If file submission is for an event not assigned to member, we might miss it. 
  // But usually member submits for their event. 
  // If getEvent returns undefined, we handle gracefully.

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'photographer': return 'default';
      case 'cinematographer': return 'secondary';
      case 'drone_operator': return 'outline';
      case 'site_manager': return 'destructive';
      case 'assistant': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'in_progress': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  // Calculate KPIs
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const overdueTasks = tasks.filter(t =>
    t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
  ).length;
  const upcomingEvents = events.filter(e => new Date(e.event_date) > new Date()).length;
  const approvedSubmissions = fileSubmissions.filter(f => f.review_status === 'approved').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-4">
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!teamMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-4">
        <div className="mx-auto max-w-7xl">
          <Button variant="ghost" onClick={() => navigate('/team')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team
          </Button>
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold">Team member not found</h2>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/team')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team
          </Button>
        </div>

        {/* Team Member Overview */}
        <Card className="border-2 border-border/50 bg-gradient-to-r from-card/90 to-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-xl font-bold text-primary-foreground">
                    {getInitials(teamMember.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{teamMember.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getRoleBadgeVariant(teamMember.role)}>
                      {teamMember.role.replace('_', ' ')}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(teamMember.status)}`} />
                      <span className="text-sm text-muted-foreground capitalize">{teamMember.status}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Joined {new Date(teamMember.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="flex flex-wrap gap-2 md:ml-auto">
                {teamMember.phone_number && (
                  <Button variant="outline" size="sm">
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                )}
                {teamMember.email && (
                  <Button variant="outline" size="sm">
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                )}
                {teamMember.whatsapp_number && (
                  <Button variant="outline" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <Separator className="my-4" />
            <div className="grid gap-4 md:grid-cols-3">
              {teamMember.phone_number && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{teamMember.phone_number}</span>
                </div>
              )}
              {teamMember.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{teamMember.email}</span>
                </div>
              )}
              {teamMember.whatsapp_number && (
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{teamMember.whatsapp_number}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Tasks Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {completedTasks}/{totalTasks}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Events</p>
                  <p className="text-2xl font-bold text-blue-600">{upcomingEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-200/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Overdue Tasks</p>
                  <p className="text-2xl font-bold text-yellow-600">{overdueTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold text-purple-600">{projects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-200/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Files Approved</p>
                  <p className="text-2xl font-bold text-indigo-600">{approvedSubmissions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Current Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Current Projects ({projects.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No projects assigned</p>
              ) : (
                projects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{project.couple_name}</h4>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(project.event_date).toLocaleDateString()}
                      <MapPin className="h-4 w-4 ml-2" />
                      {project.location}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.progress_percentage}%</span>
                      </div>
                      <Progress value={project.progress_percentage} className="h-2" />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Tasks ({tasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {tasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No tasks assigned</p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">{getProject(task.project)?.couple_name || 'Unknown Project'}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <span className={`text-xs ${getTaskStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    {task.due_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Assignments ({events.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No events assigned</p>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{event.event_name}</h4>
                        <p className="text-sm text-muted-foreground">{getProject(event.project)?.couple_name || 'Unknown Project'}</p>
                      </div>
                      <Badge variant={new Date(event.event_date) > new Date() ? 'default' : 'secondary'}>
                        {new Date(event.event_date) > new Date() ? 'Upcoming' : 'Past'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.event_date).toLocaleDateString()}
                      {event.time_from && (
                        <>
                          <Clock className="h-4 w-4 ml-2" />
                          {event.time_from} - {event.time_to}
                        </>
                      )}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* File Submissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                File Submissions ({fileSubmissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {fileSubmissions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No file submissions</p>
              ) : (
                fileSubmissions.map((file) => (
                  <div key={file.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">{file.file_name}</h4>
                        <p className="text-sm text-muted-foreground">{getEvent(file.event)?.event_name || 'Unknown Event'}</p>
                      </div>
                      <Badge variant={file.review_status === 'approved' ? 'default' :
                        file.review_status === 'pending' ? 'secondary' : 'destructive'}>
                        {file.review_status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {new Date(file.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}