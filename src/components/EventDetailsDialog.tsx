import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Circle,
  Phone,
  MessageCircle,
  Mail,
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
  ExternalLink,
  Plus,
  Eye,
  Check,
  X,
  CheckSquare,
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MentionInput } from "@/components/ui/mention-input";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface EventDetailsDialogProps {
  event: {
    id: string;
    event_name: string;
    event_date: string;
    time_from?: string;
    time_to?: string;
    location?: string;
    google_map_link?: string;
    photographer?: string;
    cinematographer?: string;
    drone_operator?: string;
    site_manager?: string;
    assistant?: string;
    details?: string;
    instructions?: string;
  };
  trigger: React.ReactNode;
}

interface TeamContact {
  id: string;
  name: string;
  role: string;
  phone_number?: string;
  whatsapp_number?: string;
  email?: string;
}

interface ChecklistItem {
  id: string;
  item_name: string;
  category: string;
  assigned_role?: string;
  is_completed: boolean;
  notes?: string;
}

interface FileSubmission {
  id: string;
  team_member_name: string;
  team_member_role: string;
  file_name: string;
  file_url: string;
  file_type: string;
  submission_type: string;
  review_status: string;
  uploaded_at: string;
  reviewer_notes?: string;
}

export function EventDetailsDialog({ event, trigger }: EventDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [teamContacts, setTeamContacts] = useState<TeamContact[]>([]);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [fileSubmissions, setFileSubmissions] = useState<FileSubmission[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("equipment");
  const [selectedRole, setSelectedRole] = useState("");
  const [showChecklistForm, setShowChecklistForm] = useState(false);
  const [expandedMembers, setExpandedMembers] = useState<Record<string, boolean>>({});
  const [memberComments, setMemberComments] = useState<Record<string, string>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [showTaskForm, setShowTaskForm] = useState<Record<string, boolean>>({});
  const [newTask, setNewTask] = useState<Record<string, { title: string; description: string; priority: string; due_date: string }>>({});
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const eventDate = new Date(event.event_date);
  const isUpcoming = eventDate > new Date();

  // Parse team members from the event
  const getTeamMembers = () => {
    const members: { name: string; role: string }[] = [];

    if (event.photographer) {
      event.photographer.split(", ").forEach(name => {
        members.push({ name: name.trim(), role: "photographer" });
      });
    }
    if (event.cinematographer) {
      event.cinematographer.split(", ").forEach(name => {
        members.push({ name: name.trim(), role: "cinematographer" });
      });
    }
    if (event.drone_operator) {
      event.drone_operator.split(", ").forEach(name => {
        members.push({ name: name.trim(), role: "drone_operator" });
      });
    }
    if (event.site_manager) {
      members.push({ name: event.site_manager, role: "site_manager" });
    }
    if (event.assistant) {
      members.push({ name: event.assistant, role: "assistant" });
    }

    return members;
  };

  const { token } = useAuth();

  const fetchEventData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Fetch team contacts
      const contactsData = await api.get("/contacts/", token);
      setTeamContacts(contactsData || []);

      // Fetch checklists for this event
      const checklistsData = await api.get(`/event-checklists/?event_id=${event.id}`, token);
      setChecklists(checklistsData?.sort((a: any, b: any) => a.category.localeCompare(b.category)) || []);

      // Fetch file submissions for this event
      const submissionsData = await api.get(`/submissions/?event_id=${event.id}`, token);
      setFileSubmissions(submissionsData?.sort((a: any, b: any) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()) || []);

      // Fetch tasks from the project that contains this event
      // First get event details to know project_id
      // Current 'event' prop might not have project_id if it comes from a list view that didn't include it. 
      // But let's check if we can fetch the event details from API to be sure.
      const eventDetails = await api.get(`/events/${event.id}/`, token);

      if (eventDetails && eventDetails.project) {
        // eventDetails.project is likely an ID string based on my serializer
        const tasksData = await api.get(`/tasks/?project_id=${eventDetails.project}`, token);
        setTasks(tasksData?.sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()) || []);
      }

    } catch (error) {
      console.error("Error fetching event data:", error);
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && token) {
      fetchEventData();
    }
  }, [open, event.id, token]);

  const toggleChecklistItem = async (itemId: string, isCompleted: boolean) => {
    if (!token) return;
    try {
      await api.patch(`/event-checklists/${itemId}/`, { is_completed: !isCompleted }, token);

      setChecklists(prev =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, is_completed: !isCompleted }
            : item
        )
      );

      toast({
        title: "Success",
        description: "Checklist item updated",
      });
    } catch (error) {
      console.error("Error updating checklist:", error);
      toast({
        title: "Error",
        description: "Failed to update checklist item",
        variant: "destructive",
      });
    }
  };

  const addChecklistItem = async () => {
    if (!newChecklistItem.trim() || !token) return;

    try {
      const data = await api.post("/event-checklists/", {
        event: event.id, // DRF expects 'event' as ID
        item_name: newChecklistItem,
        category: selectedCategory,
        assigned_role: selectedRole || null,
        is_completed: false
      }, token);

      setChecklists(prev => [...prev, data]);
      setNewChecklistItem("");
      setSelectedRole("");
      setShowChecklistForm(false);

      toast({
        title: "Success",
        description: "Checklist item added",
      });
    } catch (error) {
      console.error("Error adding checklist item:", error);
      toast({
        title: "Error",
        description: "Failed to add checklist item",
        variant: "destructive",
      });
    }
  };

  const getContactInfo = (memberName: string) => {
    return teamContacts.find(contact =>
      contact.name.toLowerCase() === memberName.toLowerCase()
    );
  };

  const getProgressPercentage = () => {
    if (checklists.length === 0) return 0;
    const completedItems = checklists.filter(item => item.is_completed).length;
    return Math.round((completedItems / checklists.length) * 100);
  };

  const getRoleColor = (role: string) => {
    const colors = {
      photographer: "bg-blue-100 text-blue-800",
      cinematographer: "bg-purple-100 text-purple-800",
      drone_operator: "bg-green-100 text-green-800",
      site_manager: "bg-orange-100 text-orange-800",
      assistant: "bg-gray-100 text-gray-800",
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "image": return <ImageIcon className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "text-green-600";
      case "rejected": return "text-red-600";
      case "needs_revision": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  const toggleMemberExpansion = (memberName: string) => {
    setExpandedMembers(prev => ({
      ...prev,
      [memberName]: !prev[memberName]
    }));
  };

  const addMemberComment = (memberName: string) => {
    const comment = newComments[memberName];
    if (!comment?.trim()) return;

    setMemberComments(prev => ({
      ...prev,
      [memberName]: prev[memberName]
        ? `${prev[memberName]}\n\n• ${comment}`
        : `• ${comment}`
    }));

    setNewComments(prev => ({
      ...prev,
      [memberName]: ''
    }));

    toast({
      title: "Comment Added",
      description: `Comment added for ${memberName}`,
    });
  };

  const toggleTaskForm = (memberName: string) => {
    setShowTaskForm(prev => ({
      ...prev,
      [memberName]: !prev[memberName]
    }));
  };

  const addTask = async (memberName: string) => {
    const taskData = newTask[memberName];
    if (!taskData?.title.trim() || !token) return;

    try {
      // Get project ID first
      const eventDetails = await api.get(`/events/${event.id}/`, token);

      if (!eventDetails || !eventDetails.project) throw new Error("Project not found");

      const data = await api.post("/tasks/", {
        project: eventDetails.project, // API expects 'project'
        title: taskData.title,
        description: taskData.description || "",
        priority: taskData.priority,
        assigned_to: memberName,
        due_date: taskData.due_date || null,
        status: 'pending'
      }, token);

      setTasks(prev => [...prev, data]);
      setNewTask(prev => ({
        ...prev,
        [memberName]: { title: '', description: '', priority: 'medium', due_date: '' }
      }));
      setShowTaskForm(prev => ({ ...prev, [memberName]: false }));

      toast({
        title: "Task Added",
        description: `Task assigned to ${memberName}`,
      });
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      });
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    if (!token) return;
    try {
      await api.patch(`/tasks/${taskId}/`, { status: newStatus }, token);

      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ));

      toast({
        title: "Task Updated",
        description: "Task status changed successfully",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const teamMembers = getTeamMembers();
  const progressPercentage = getProgressPercentage();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {event.event_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {!isMobile && "Overview"}
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {!isMobile && "Team & Tasks"}
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {!isMobile && "File Submissions"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Event Information */}
            <Card>
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Date:</span>
                      <span>{format(eventDate, "PPP")}</span>
                      <Badge variant={isUpcoming ? "default" : "secondary"}>
                        {isUpcoming ? "Upcoming" : "Past"}
                      </Badge>
                    </div>

                    {(event.time_from || event.time_to) && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Time:</span>
                        <span>
                          {event.time_from && event.time_to
                            ? `${event.time_from} - ${event.time_to}`
                            : event.time_from || event.time_to
                          }
                        </span>
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Location:</span>
                        <span>{event.location}</span>
                        {event.google_map_link && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={event.google_map_link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Team Size:</span>
                      <span>{teamMembers.length} members</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Progress:</span>
                      <span>{progressPercentage}% complete</span>
                    </div>
                  </div>
                </div>

                {event.details && (
                  <div className="space-y-2">
                    <span className="font-medium">Description:</span>
                    <p className="text-muted-foreground">{event.details}</p>
                  </div>
                )}

                {event.instructions && (
                  <div className="space-y-2">
                    <span className="font-medium">Special Instructions:</span>
                    <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                      <p className="text-yellow-800">{event.instructions}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion Status</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{checklists.filter(item => item.is_completed).length} completed</span>
                    <span>{checklists.length} total items</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Checklist Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckSquare className="h-5 w-5" />
                    Event Checklist
                    <Badge variant="secondary" className="ml-2">
                      {Math.round(getProgressPercentage())}% Complete
                    </Badge>
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => setShowChecklistForm(!showChecklistForm)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                {showChecklistForm && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    addChecklistItem();
                  }} className="mb-4 p-4 border rounded-lg bg-muted/20">
                    <div className="space-y-3">
                      <MentionInput
                        value={newChecklistItem}
                        onChange={setNewChecklistItem}
                        onMentionSelect={(mention) => setSelectedRole(mention.name)}
                        mentions={[
                          ...teamMembers.map(member => ({
                            id: member.name,
                            name: member.name,
                            role: member.role
                          })),
                          ...teamContacts.map(contact => ({
                            id: contact.id,
                            name: contact.name,
                            role: contact.role
                          }))
                        ]}
                        placeholder="Checklist item name (type @ to mention team members)"
                        className="w-full"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button type="submit" size="sm" disabled={!newChecklistItem.trim()}>
                          Add
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowChecklistForm(false);
                            setNewChecklistItem('');
                            setSelectedRole('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {checklists.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No checklist items yet.</p>
                  ) : (
                    checklists.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                        <Button
                          size="sm"
                          variant={item.is_completed ? "default" : "outline"}
                          onClick={() => toggleChecklistItem(item.id, item.is_completed)}
                          className="h-6 w-6 p-0"
                        >
                          {item.is_completed && <Check className="h-3 w-3" />}
                        </Button>
                        <div className="flex-1">
                          <div className={`font-medium ${item.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                            {item.item_name}
                          </div>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                            {item.assigned_role && (
                              <Badge variant="secondary" className="text-xs">
                                {item.assigned_role}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members & Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member, index) => {
                    const contact = getContactInfo(member.name);
                    const memberTasks = tasks.filter(task =>
                      task.assigned_to?.toLowerCase().includes(member.name.toLowerCase())
                    );
                    const isExpanded = expandedMembers[member.name];
                    const memberChecklistItems = checklists.filter(item =>
                      item.assigned_role === member.name ||
                      item.item_name.toLowerCase().includes(`@${member.name.toLowerCase()}`)
                    );

                    return (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-0">
                          {/* Main Member Info */}
                          <div className="p-4 bg-muted/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div>
                                  <h4 className="font-semibold text-lg">{member.name}</h4>
                                  <Badge variant="outline" className={getRoleColor(member.role)}>
                                    {member.role.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Contact Actions */}
                                {contact && (
                                  <div className="flex gap-1">
                                    {contact.phone_number && (
                                      <Button variant="ghost" size="sm" asChild>
                                        <a href={`tel:${contact.phone_number}`}>
                                          <Phone className="h-3 w-3" />
                                        </a>
                                      </Button>
                                    )}
                                    {contact.whatsapp_number && (
                                      <Button variant="ghost" size="sm" asChild>
                                        <a href={`https://wa.me/${contact.whatsapp_number.replace(/[^\d]/g, "")}`} target="_blank">
                                          <MessageCircle className="h-3 w-3" />
                                        </a>
                                      </Button>
                                    )}
                                    {contact.email && (
                                      <Button variant="ghost" size="sm" asChild>
                                        <a href={`mailto:${contact.email}`}>
                                          <Mail className="h-3 w-3" />
                                        </a>
                                      </Button>
                                    )}
                                  </div>
                                )}

                                {/* Expand/Collapse Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleMemberExpansion(member.name)}
                                  className="ml-2"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CheckSquare className="h-3 w-3" />
                                {memberChecklistItems.length} checklist items
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {memberTasks.length} tasks
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                Comments
                              </span>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="p-4 space-y-4 animate-fade-in">
                              {/* Contact Details */}
                              {contact && (
                                <div>
                                  <h5 className="font-medium text-sm mb-2">Contact Information</h5>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                                    {contact.phone_number && (
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                        <span>{contact.phone_number}</span>
                                      </div>
                                    )}
                                    {contact.whatsapp_number && (
                                      <div className="flex items-center gap-2">
                                        <MessageCircle className="h-3 w-3 text-muted-foreground" />
                                        <span>{contact.whatsapp_number}</span>
                                      </div>
                                    )}
                                    {contact.email && (
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                        <span>{contact.email}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Tasks Section */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-sm">Tasks</h5>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleTaskForm(member.name)}
                                    className="h-6 text-xs"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Task
                                  </Button>
                                </div>

                                {/* Add Task Form */}
                                {showTaskForm[member.name] && (
                                  <div className="p-3 border rounded-lg mb-3 bg-background">
                                    <div className="space-y-3">
                                      <div>
                                        <Input
                                          placeholder="Task title"
                                          value={newTask[member.name]?.title || ''}
                                          onChange={(e) => setNewTask(prev => ({
                                            ...prev,
                                            [member.name]: { ...prev[member.name] || { title: '', description: '', priority: 'medium', due_date: '' }, title: e.target.value }
                                          }))}
                                          className="text-sm"
                                        />
                                      </div>
                                      <div>
                                        <Textarea
                                          placeholder="Task description (optional)"
                                          value={newTask[member.name]?.description || ''}
                                          onChange={(e) => setNewTask(prev => ({
                                            ...prev,
                                            [member.name]: { ...prev[member.name] || { title: '', description: '', priority: 'medium', due_date: '' }, description: e.target.value }
                                          }))}
                                          className="text-sm min-h-[60px]"
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <select
                                          value={newTask[member.name]?.priority || 'medium'}
                                          onChange={(e) => setNewTask(prev => ({
                                            ...prev,
                                            [member.name]: { ...prev[member.name] || { title: '', description: '', priority: 'medium', due_date: '' }, priority: e.target.value }
                                          }))}
                                          className="text-sm p-2 border rounded"
                                        >
                                          <option value="low">Low Priority</option>
                                          <option value="medium">Medium Priority</option>
                                          <option value="high">High Priority</option>
                                          <option value="urgent">Urgent</option>
                                        </select>
                                        <Input
                                          type="date"
                                          value={newTask[member.name]?.due_date || ''}
                                          onChange={(e) => setNewTask(prev => ({
                                            ...prev,
                                            [member.name]: { ...prev[member.name] || { title: '', description: '', priority: 'medium', due_date: '' }, due_date: e.target.value }
                                          }))}
                                          className="text-sm"
                                        />
                                      </div>
                                      <div className="flex gap-2 justify-end">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => toggleTaskForm(member.name)}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => addTask(member.name)}
                                          disabled={!newTask[member.name]?.title.trim()}
                                        >
                                          Add Task
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Tasks List */}
                                <div className="space-y-2">
                                  {memberTasks.length > 0 ? (
                                    memberTasks.map(task => (
                                      <div key={task.id} className="p-3 bg-muted/30 rounded-lg">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="font-medium text-sm">{task.title}</div>
                                            {task.description && (
                                              <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2">
                                              <Badge
                                                variant={task.priority === 'urgent' ? 'destructive' : task.priority === 'high' ? 'default' : 'secondary'}
                                                className="text-xs"
                                              >
                                                {task.priority}
                                              </Badge>
                                              {task.due_date && (
                                                <span className="text-xs text-muted-foreground">
                                                  Due: {format(new Date(task.due_date), "MMM d")}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <div className="ml-2">
                                            <select
                                              value={task.status}
                                              onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                              className="text-xs p-1 border rounded bg-background"
                                            >
                                              <option value="pending">Pending</option>
                                              <option value="in_progress">In Progress</option>
                                              <option value="completed">Completed</option>
                                              <option value="on_hold">On Hold</option>
                                            </select>
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-xs text-muted-foreground text-center py-4">
                                      No tasks assigned yet
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Mentioned in Checklist Items */}
                              {memberChecklistItems.length > 0 && (
                                <div>
                                  <h5 className="font-medium text-sm mb-2">Mentioned in Checklist</h5>
                                  <div className="space-y-2">
                                    {memberChecklistItems.map(item => (
                                      <div key={item.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                                        <div className={`w-2 h-2 rounded-full ${item.is_completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <span className={`text-sm ${item.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                          {item.item_name}
                                        </span>
                                        <Badge variant="outline" className="text-xs ml-auto">
                                          {item.category}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Comments Section */}
                              <div>
                                <h5 className="font-medium text-sm mb-2">Team Comments</h5>
                                <div className="space-y-3">
                                  {/* Existing Comments */}
                                  {memberComments[member.name] && (
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                      <div className="text-sm whitespace-pre-line">
                                        {memberComments[member.name]}
                                      </div>
                                    </div>
                                  )}

                                  {/* Add Comment Form */}
                                  <div className="space-y-3 w-full p-4 border rounded-lg bg-background">
                                    <MentionInput
                                      value={newComments[member.name] || ''}
                                      onChange={(value) => setNewComments(prev => ({
                                        ...prev,
                                        [member.name]: value
                                      }))}
                                      onMentionSelect={(mention) => {
                                        // Handle mention selection in comments
                                      }}
                                      mentions={[
                                        ...teamMembers.map(m => ({
                                          id: m.name,
                                          name: m.name,
                                          role: m.role
                                        })),
                                        ...tasks.map(task => ({
                                          id: task.id,
                                          name: task.title,
                                          role: 'task'
                                        }))
                                      ]}
                                      placeholder="Add a comment or mention tasks/team members..."
                                      className="w-full"
                                    />
                                    <div className="flex justify-end">
                                      <Button
                                        size="sm"
                                        onClick={() => addMemberComment(member.name)}
                                        disabled={!newComments[member.name]?.trim()}
                                      >
                                        <Send className="h-3 w-3 mr-1" />
                                        {!isMobile && "Send Comment"}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="submissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>File Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamMembers.map((member, index) => {
                    const memberSubmissions = fileSubmissions.filter(sub =>
                      sub.team_member_name.toLowerCase() === member.name.toLowerCase()
                    );

                    return (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{member.name}</h4>
                            <Badge variant="outline" className={getRoleColor(member.role)}>
                              {member.role.replace("_", " ")}
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            <Upload className="h-3 w-3 mr-1" />
                            Upload
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {memberSubmissions.length > 0 ? (
                            memberSubmissions.map(submission => (
                              <div key={submission.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                                <div className="flex items-center gap-2">
                                  {getFileIcon(submission.file_type)}
                                  <span>{submission.file_name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className={getStatusColor(submission.review_status)}>
                                    {submission.review_status}
                                  </Badge>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No submissions yet
                            </p>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {memberSubmissions.length} files uploaded
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}