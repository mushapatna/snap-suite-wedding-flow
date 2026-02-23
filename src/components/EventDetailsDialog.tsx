import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, isSameDay, parse, areIntervalsOverlapping } from "date-fns";
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
  ChevronUp,
  Search,
  User,
  Link
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface EventDetailsDialogProps {
  event: {
    id: string;
    event_name: string;
    event_date: string;
    end_date?: string;
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
  onUpdate?: () => void;
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

export function EventDetailsDialog({ event, trigger, onUpdate }: EventDetailsDialogProps) {
  const [open, setOpen] = useState(false);

  // Local state to handle immediate updates before parent refresh
  const [currentEvent, setCurrentEvent] = useState(event);
  const lastSaveTime = useRef<number>(0);

  useEffect(() => {
    // If an update came from the parent within 2 seconds of our local save, 
    // it's likely the stale prop from the parent re-render before the fetch completed.
    // We ignore it to prevent reverting the UI.
    if (Date.now() - lastSaveTime.current < 2000) {
      return;
    }
    setCurrentEvent(event);
  }, [event]);

  const [teamContacts, setTeamContacts] = useState<TeamContact[]>([]);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [fileSubmissions, setFileSubmissions] = useState<FileSubmission[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [dailyEvents, setDailyEvents] = useState<any[]>([]); // To check for conflicts
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
  const [driveLinkInputs, setDriveLinkInputs] = useState<Record<string, string>>({});
  const [isSubmittingLink, setIsSubmittingLink] = useState<Record<string, boolean>>({});

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(currentEvent);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setEditForm(currentEvent);
  }, [currentEvent]);

  const { toast } = useToast();
  const isMobile = useIsMobile();

  const eventDate = new Date(currentEvent.event_date);
  const isUpcoming = eventDate > new Date();

  // Parse team members from the event
  const getTeamMembers = () => {
    const members: { name: string; role: string }[] = [];

    if (currentEvent.photographer) {
      currentEvent.photographer.split(", ").forEach(name => {
        if (name.trim()) members.push({ name: name.trim(), role: "photographer" });
      });
    }
    if (currentEvent.cinematographer) {
      currentEvent.cinematographer.split(", ").forEach(name => {
        if (name.trim()) members.push({ name: name.trim(), role: "cinematographer" });
      });
    }
    if (currentEvent.drone_operator) {
      currentEvent.drone_operator.split(", ").forEach(name => {
        if (name.trim()) members.push({ name: name.trim(), role: "drone_operator" });
      });
    }
    if (currentEvent.site_manager) {
      currentEvent.site_manager.split(", ").forEach(name => {
        if (name.trim()) members.push({ name: name.trim(), role: "site_manager" });
      });
    }
    if (currentEvent.assistant) {
      currentEvent.assistant.split(", ").forEach(name => {
        if (name.trim()) members.push({ name: name.trim(), role: "assistant" });
      });
    }

    return members;
  };

  const { user, token, hasRole, isStudioOwner, isTeamMember, profile } = useAuth();

  const handleAttachDriveLink = async (member: any) => {
    const link = driveLinkInputs[member.name];
    if (!link?.trim() || !token) return;

    setIsSubmittingLink(prev => ({ ...prev, [member.name]: true }));
    try {
      await api.post('/submissions/', {
        event: currentEvent.id,
        team_member_name: member.name,
        team_member_role: member.role,
        file_name: "Drive Link",
        file_url: link,
        file_type: "link",
        submission_type: "drive_link",
        review_status: "pending"
      }, token);

      toast({
        title: "Success",
        description: "Drive link attached successfully.",
      });

      setDriveLinkInputs(prev => ({ ...prev, [member.name]: "" }));
      fetchEventData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to attach drive link.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingLink(prev => ({ ...prev, [member.name]: false }));
    }
  };

  const fetchEventData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Fetch team contacts
      const contactsData = await api.get("/contacts/", token);
      setTeamContacts(contactsData || []);

      // Fetch checklists for this event
      const checklistsData = await api.get(`/event-checklists/?event_id=${currentEvent.id}`, token);
      setChecklists(checklistsData?.sort((a: any, b: any) => a.category.localeCompare(b.category)) || []);

      // Fetch file submissions for this event
      const submissionsData = await api.get(`/submissions/?event_id=${currentEvent.id}`, token);
      setFileSubmissions(submissionsData?.sort((a: any, b: any) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()) || []);

      // Fetch ALL events for the same day to check availability
      const formattedDate = format(new Date(currentEvent.event_date), 'yyyy-MM-dd');
      const dailyEventsData = await api.get(`/events/?start_date=${formattedDate}&end_date=${formattedDate}`, token);
      // Ensure we get an array, API might return pagination object
      const dailyEventsList = Array.isArray(dailyEventsData) ? dailyEventsData : (dailyEventsData.results || []);
      setDailyEvents(dailyEventsList);

      // Fetch tasks from the project that contains this event
      const eventDetails = await api.get(`/events/${currentEvent.id}/`, token);
      if (eventDetails && eventDetails.project) {
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
  }, [open, currentEvent.id, token]);


  // --- Availability Logic ---
  const checkAvailability = (memberName: string) => {
    // 1. Find overlapping events
    const currentEventStart = editForm.time_from ? parse(editForm.time_from, 'HH:mm:ss', new Date()) : null;
    const currentEventEnd = editForm.time_to ? parse(editForm.time_to, 'HH:mm:ss', new Date()) : null;

    if (!currentEventStart || !currentEventEnd) return { isAvailable: true };

    const conflictingEvents = dailyEvents.filter(otherEvent => {
      if (otherEvent.id === currentEvent.id) return false; // Ignore self

      const otherStart = otherEvent.time_from ? parse(otherEvent.time_from, 'HH:mm:ss', new Date()) : null;
      const otherEnd = otherEvent.time_to ? parse(otherEvent.time_to, 'HH:mm:ss', new Date()) : null;

      if (!otherStart || !otherEnd) return false;

      return areIntervalsOverlapping(
        { start: currentEventStart, end: currentEventEnd },
        { start: otherStart, end: otherEnd }
      );
    });

    // 2. Check if member is assigned to any conflicting event
    const busyWith = conflictingEvents.find(otherEvent => {
      const roles = ['photographer', 'cinematographer', 'drone_operator', 'site_manager', 'assistant'];
      return roles.some(role => {
        const assigned = otherEvent[role];
        return assigned && assigned.includes(memberName);
      });
    });

    if (busyWith) {
      return { isAvailable: false, busyWith: busyWith.event_name };
    }
    return { isAvailable: true };
  };


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
      if (onUpdate) onUpdate();
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
        event: currentEvent.id, // DRF expects 'event' as ID
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
      if (onUpdate) onUpdate();
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
      const eventDetails = await api.get(`/events/${currentEvent.id}/`, token);

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
      if (onUpdate) onUpdate();
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

  // --- Team Member Selector Component ---
  const TeamMemberSelect = ({
    role,
    value,
    onChange
  }: {
    role: string;
    value: string;
    onChange: (val: string) => void;
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Filter contacts by role preference (optional, showing all for flexibility)
    // But logically we might want to prioritize those with matching roles. 
    // For now, show all.

    const selectedMembers = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

    const handleSelect = (memberName: string) => {
      const newSelection = selectedMembers.includes(memberName)
        ? selectedMembers.filter(m => m !== memberName)
        : [...selectedMembers, memberName];

      onChange(newSelection.join(', '));
    };

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between"
          >
            {selectedMembers.length > 0
              ? `${selectedMembers.length} selected`
              : "Select team members..."}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search team..." />
            <CommandList>
              <CommandEmpty>No team member found.</CommandEmpty>
              <CommandGroup>
                {teamContacts.map((member) => {
                  const { isAvailable, busyWith } = checkAvailability(member.name);
                  const isSelected = selectedMembers.includes(member.name);

                  return (
                    <CommandItem
                      key={member.id}
                      value={member.name}
                      onSelect={() => handleSelect(member.name)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}
                          title={isAvailable ? "Available" : `Busy with: ${busyWith}`}
                        />
                        <div className="flex flex-col">
                          <span>{member.name}</span>
                          {!isAvailable && (
                            <span className="text-[10px] text-muted-foreground text-red-500">
                              Busy: {busyWith}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && <Check className="h-4 w-4 opacity-100" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };


  const handleSaveEvent = async () => {
    if (!token) return;
    try {
      const payload = {
        event_name: editForm.event_name,
        event_date: editForm.event_date,
        end_date: editForm.end_date,
        time_from: editForm.time_from,
        time_to: editForm.time_to,
        location: editForm.location,
        google_map_link: editForm.google_map_link,
        details: editForm.details,
        instructions: editForm.instructions,
        photographer: editForm.photographer,
        cinematographer: editForm.cinematographer,
        drone_operator: editForm.drone_operator,
        site_manager: editForm.site_manager,
        assistant: editForm.assistant,
      };

      await api.patch(`/events/${currentEvent.id}/`, payload, token);

      toast({
        title: "Success",
        description: "Event details updated successfully",
      });

      // Update local state immediately
      lastSaveTime.current = Date.now();
      setCurrentEvent({ ...currentEvent, ...payload });
      setIsEditing(false);
      if (onUpdate) onUpdate();

    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event details",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {currentEvent.event_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {!isMobile && "Overview"}
            </TabsTrigger>
            {isStudioOwner() && (
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {!isMobile && "Team & Tasks"}
              </TabsTrigger>
            )}
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {!isMobile && "File Submissions"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Event Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Event Information</CardTitle>
                {isStudioOwner() && (
                  !isEditing ? (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Edit Details
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveEvent}>
                        Save Changes
                      </Button>
                    </div>
                  )
                )}
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Event Name</label>
                        <Input
                          value={editForm.event_name}
                          onChange={(e) => setEditForm({ ...editForm, event_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <Input
                          type="date"
                          value={editForm.event_date}
                          onChange={(e) => setEditForm({ ...editForm, event_date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Time</label>
                        <Input
                          type="time"
                          value={editForm.time_from || ''}
                          onChange={(e) => setEditForm({ ...editForm, time_from: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Date</label>
                        <Input
                          type="date"
                          value={editForm.end_date || ''}
                          onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Time</label>
                        <Input
                          type="time"
                          value={editForm.time_to || ''}
                          onChange={(e) => setEditForm({ ...editForm, time_to: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Location</label>
                        <Input
                          value={editForm.location || ''}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        />
                      </div>
                      {/* Team Assignment Section - Now with Availability Check */}
                      <Separator className="md:col-span-2 my-2" />
                      <h4 className="md:col-span-2 font-medium text-muted-foreground">Team Assignment</h4>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Photographer(s)</label>
                        <TeamMemberSelect
                          role="photographer"
                          value={editForm.photographer || ''}
                          onChange={(val) => setEditForm({ ...editForm, photographer: val })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Cinematographer(s)</label>
                        <TeamMemberSelect
                          role="cinematographer"
                          value={editForm.cinematographer || ''}
                          onChange={(val) => setEditForm({ ...editForm, cinematographer: val })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Drone Operator(s)</label>
                        <TeamMemberSelect
                          role="drone_operator"
                          value={editForm.drone_operator || ''}
                          onChange={(val) => setEditForm({ ...editForm, drone_operator: val })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Site Manager</label>
                        <TeamMemberSelect
                          role="site_manager"
                          value={editForm.site_manager || ''}
                          onChange={(val) => setEditForm({ ...editForm, site_manager: val })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Assistant</label>
                        <TeamMemberSelect
                          role="assistant"
                          value={editForm.assistant || ''}
                          onChange={(val) => setEditForm({ ...editForm, assistant: val })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Google Map Link</label>
                        <Input
                          value={editForm.google_map_link || ''}
                          onChange={(e) => setEditForm({ ...editForm, google_map_link: e.target.value })}
                          placeholder="https://maps.google.com/..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={editForm.details || ''}
                        onChange={(e) => setEditForm({ ...editForm, details: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Special Instructions</label>
                      <Textarea
                        value={editForm.instructions || ''}
                        onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
                        className="border-yellow-200 focus-visible:ring-yellow-400"
                      />
                    </div>
                  </div>
                ) : (
                  <>
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

                        {(currentEvent.time_from || currentEvent.time_to) && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Time:</span>
                            <span>
                              {currentEvent.time_from && currentEvent.time_to
                                ? `${currentEvent.time_from} - ${currentEvent.time_to}`
                                : currentEvent.time_from || currentEvent.time_to
                              }
                            </span>
                          </div>
                        )}

                        {currentEvent.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Location:</span>
                            <span>{currentEvent.location}</span>
                            {currentEvent.google_map_link && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={currentEvent.google_map_link} target="_blank" rel="noopener noreferrer">
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

                    {currentEvent.details && (
                      <div className="space-y-2">
                        <span className="font-medium">Description:</span>
                        <p className="text-muted-foreground">{currentEvent.details}</p>
                      </div>
                    )}

                    {currentEvent.instructions && (
                      <div className="space-y-2">
                        <span className="font-medium">Special Instructions:</span>
                        <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                          <p className="text-yellow-800">{currentEvent.instructions}</p>
                        </div>
                      </div>
                    )}
                  </>
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
                  {isStudioOwner() && (
                    <Button
                      size="sm"
                      onClick={() => setShowChecklistForm(!showChecklistForm)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  )}
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Team Members & Collaboration</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveTab("overview");
                    setIsEditing(true);
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Team
                </Button>
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
                  {teamMembers
                    .filter(member => isStudioOwner() || member.name.toLowerCase() === profile?.full_name?.toLowerCase())
                    .map((member, index) => {
                      const memberSubmissions = fileSubmissions.filter(sub =>
                        sub.team_member_name.toLowerCase() === member.name.toLowerCase()
                      );

                      return (
                        <div key={index} className="flex flex-col p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{member.name}</h4>
                              <Badge variant="outline" className={getRoleColor(member.role)}>
                                {member.role.replace("_", " ")}
                              </Badge>
                            </div>
                            {isStudioOwner() ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Link className="h-3 w-3 mr-1" />
                                    Attach Drive Link
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 space-y-3">
                                  <h4 className="font-medium text-sm">Attach Drive Link for {member.name}</h4>
                                  <Input
                                    placeholder="https://drive.google.com/..."
                                    value={driveLinkInputs[member.name] || ''}
                                    onChange={(e) => setDriveLinkInputs(prev => ({ ...prev, [member.name]: e.target.value }))}
                                  />
                                  <Button
                                    size="sm"
                                    className="w-full"
                                    disabled={isSubmittingLink[member.name] || !driveLinkInputs[member.name]?.trim()}
                                    onClick={() => handleAttachDriveLink(member)}
                                  >
                                    {isSubmittingLink[member.name] ? "Attaching..." : "Attach Link"}
                                  </Button>
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const driveLinkSub = memberSubmissions.find(sub => sub.submission_type === 'drive_link');
                                  if (driveLinkSub && driveLinkSub.file_url) {
                                    window.open(driveLinkSub.file_url, '_blank', 'noopener,noreferrer');
                                  } else {
                                    toast({
                                      title: "No Drive Link",
                                      description: "The studio owner hasn't attached a drive link yet.",
                                    });
                                  }
                                }}
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                Upload
                              </Button>
                            )}
                          </div>

                          <div className="space-y-2">
                            {memberSubmissions.length > 0 ? (
                              memberSubmissions.map(submission => (
                                <div key={submission.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                                  <div className="flex items-center gap-2">
                                    {/* Just use FileText as a fallback if getFileIcon is present, assuming it handles 'link' */}
                                    {submission.submission_type === 'drive_link' ? <Link className="h-4 w-4" /> : getFileIcon(submission.file_type)}
                                    {submission.submission_type === 'drive_link' ? (
                                      <a href={submission.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                        {submission.file_name}
                                      </a>
                                    ) : (
                                      <span>{submission.file_name}</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Badge variant="outline" className={getStatusColor(submission.review_status)}>
                                      {submission.review_status}
                                    </Badge>
                                    <Button variant="ghost" size="sm" onClick={() => {
                                      if (submission.submission_type === 'drive_link') {
                                        window.open(submission.file_url, '_blank', 'noopener,noreferrer');
                                      }
                                    }}>
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