import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isSameDay, parse, areIntervalsOverlapping } from "date-fns";
import { CalendarIcon, Clock, Search, X, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AddTeamMemberDialog } from "@/components/ui/AddTeamMemberDialog";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  event_name: z.string().min(1, "Event name is required"),
  event_date: z.date({
    required_error: "Start date is required",
  }),
  end_date: z.date().optional(),
  time_from: z.string().optional(),
  time_from_period: z.enum(["AM", "PM"]).optional(),
  time_to: z.string().optional(),
  time_to_period: z.enum(["AM", "PM"]).optional(),
  location: z.string().optional(),
  google_map_link: z.string().optional(),
  photographer: z.array(z.string()).optional(),
  cinematographer: z.array(z.string()).optional(),
  drone_operator: z.array(z.string()).optional(),
  site_manager: z.string().optional(),
  assistant: z.string().optional(),
  details: z.string().optional(),
  instructions: z.string().optional(),
});

interface AddEventDialogProps {
  projectId: string;
  onEventAdded: () => void;
  trigger: React.ReactNode;
}

interface TeamContact {
  id: string;
  name: string;
  role: string;
}

export function AddEventDialog({ projectId, onEventAdded, trigger }: AddEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dailyEvents, setDailyEvents] = useState<any[]>([]);
  const [teamContacts, setTeamContacts] = useState<TeamContact[]>([]);

  // We maintain teamMembers categorized for simple grouping if needed, but we essentially rely on teamContacts
  const [teamMembers, setTeamMembers] = useState<{
    photographers: string[];
    cinematographers: string[];
    droneOperators: string[];
    siteManagers: string[];
    assistants: string[];
  }>({
    photographers: [],
    cinematographers: [],
    droneOperators: [],
    siteManagers: [],
    assistants: [],
  });

  const [addTeamMemberOpen, setAddTeamMemberOpen] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      event_name: "",
      location: "",
      google_map_link: "",
      photographer: [],
      cinematographer: [],
      drone_operator: [],
      site_manager: "",
      assistant: "",
      details: "",
      instructions: "",
      time_from: "",
      time_from_period: "AM",
      time_to: "",
      time_to_period: "PM",
    },
  });

  const watchDate = form.watch("event_date");
  const watchTimeFrom = form.watch("time_from");
  const watchTimeTo = form.watch("time_to");

  // Fetch team members AND daily events when dialog opens or date changes
  useEffect(() => {
    if (open && token) {
      const fetchMembers = async () => {
        try {
          const data = await api.get('/contacts/', token);
          const membersList = Array.isArray(data) ? data : (data.results || []);
          setTeamContacts(membersList);

          const newTeam = {
            photographers: [] as string[],
            cinematographers: [] as string[],
            droneOperators: [] as string[],
            siteManagers: [] as string[],
            assistants: [] as string[],
          };

          membersList.forEach((m: any) => {
            const name = m.name;
            const role = m.role?.toLowerCase() || "";
            const categories = (m.category && m.category.length > 0) ? m.category : ["crew"];

            if (categories.includes("crew")) {
              if (role.includes("photographer")) newTeam.photographers.push(name);
              if (role.includes("cinematographer") || role.includes("videographer")) newTeam.cinematographers.push(name);
              if (role.includes("drone")) newTeam.droneOperators.push(name);
              if (role.includes("manager")) newTeam.siteManagers.push(name);
              if (role.includes("assistant")) newTeam.assistants.push(name);
            }
          });

          setTeamMembers(newTeam);
        } catch (error) {
          console.error("Failed to load team members", error);
        }
      };

      fetchMembers();
    }
  }, [open, token]);

  // Fetch daily events when date is selected
  useEffect(() => {
    if (open && token && watchDate) {
      const fetchDailyEvents = async () => {
        try {
          const formattedDate = format(watchDate, 'yyyy-MM-dd');
          const dailyEventsData = await api.get(`/events/?start_date=${formattedDate}&end_date=${formattedDate}`, token);
          const dailyEventsList = Array.isArray(dailyEventsData) ? dailyEventsData : (dailyEventsData.results || []);
          setDailyEvents(dailyEventsList);
        } catch (error) {
          console.error("Failed to load daily events", error);
        }
      }
      fetchDailyEvents();
    }
  }, [open, token, watchDate]);


  // --- Availability Logic ---
  const checkAvailability = (memberName: string) => {
    if (!watchDate || !watchTimeFrom || !watchTimeTo) return { isAvailable: true };

    // Helper to construct full date object from time string + period + watchDate
    // Assuming time inputs are simple HH:mm strings from input type="time".
    // Actually, Input type="time" returns 24h format "HH:mm" directly, 
    // BUT the form logic separates period?
    // Wait, looking at the render:
    // <Input type="time" {...field} />  plus a Select for Period.
    // Usually type="time" is 24h. If user provides AM/PM manually, it's a bit redundant or conflicting.
    // Let's assume the Input type="time" gives us 14:30.
    // If we trust the Input value:

    try {
      const currentEventStart = parse(watchTimeFrom, 'HH:mm', watchDate);
      const currentEventEnd = parse(watchTimeTo, 'HH:mm', watchDate);

      // If parsing fails or invalid (e.g. empty string), return available
      if (isNaN(currentEventStart.getTime()) || isNaN(currentEventEnd.getTime())) return { isAvailable: true };

      const conflictingEvents = dailyEvents.filter(otherEvent => {
        // Note: AddEvent means we don't have an ID yet, so we don't exclude ourselves (we are new).

        const otherStart = otherEvent.time_from ? parse(otherEvent.time_from, 'HH:mm:ss', new Date(otherEvent.event_date)) : null;
        const otherEnd = otherEvent.time_to ? parse(otherEvent.time_to, 'HH:mm:ss', new Date(otherEvent.event_date)) : null;

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
    } catch (e) {
      // If date parsing errors, just ignore availability
      return { isAvailable: true };
    }
    return { isAvailable: true };
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Format time (ensure HH:mm:ss for Django)
      const formatTime = (time: string, period?: string) => {
        if (!time) return null;
        // If input is type="time", it is usually 24hr.
        // If the Period select is meant to convert 12h to 24h, we'd need logic. '
        // But usually <Input type="time"> is strictly 24h control on modern browsers.
        // If we simply pass the value: "14:30" -> "14:30:00"
        return `${time}:00`;
      };

      const payload = {
        project: projectId,
        event_name: values.event_name,
        event_date: format(values.event_date, "yyyy-MM-dd"),
        end_date: values.end_date ? format(values.end_date, "yyyy-MM-dd") : null,
        time_from: formatTime(values.time_from || ""),
        time_to: formatTime(values.time_to || ""),
        location: values.location || null,
        google_map_link: values.google_map_link || null,
        photographer: values.photographer?.join(", ") || null,
        cinematographer: values.cinematographer?.join(", ") || null,
        drone_operator: values.drone_operator?.join(", ") || null,
        site_manager: values.site_manager || null,
        assistant: values.assistant || null,
        details: values.details || null,
        instructions: values.instructions || null,
      };

      await api.post('/events/', payload, token);

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      form.reset();
      setOpen(false);
      onEventAdded();
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTeamMember = (name: string, role: string) => {
    // Re-fetch logic preferred or just optimistically update contacts
    setTeamContacts(prev => [...prev, { id: name + Date.now(), name, role }]);

    // Also update legacy categories if needed
    const roleLower = role.toLowerCase();
    setTeamMembers(prev => {
      const newState = { ...prev };
      if (roleLower.includes("photographer")) newState.photographers = [...prev.photographers, name];
      else if (roleLower.includes("cinematographer") || roleLower.includes("videographer")) newState.cinematographers = [...prev.cinematographers, name];
      else if (roleLower.includes("drone")) newState.droneOperators = [...prev.droneOperators, name];
      else if (roleLower.includes("manager")) newState.siteManagers = [...prev.siteManagers, name];
      else if (roleLower.includes("assistant")) newState.assistants = [...prev.assistants, name];
      return newState;
    });
  };

  // --- Reusable Team Select Component for Add Dialog ---
  const TeamMemberSelect = ({
    value,
    onChange,
    isMulti = false,
    placeholder = "Select team member..."
  }: {
    value: string | string[];
    onChange: (val: string | string[]) => void;
    isMulti?: boolean;
    placeholder?: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedList = Array.isArray(value) ? value : (value ? [value] : []);

    const handleSelect = (memberName: string) => {
      if (isMulti) {
        const newSelection = selectedList.includes(memberName)
          ? selectedList.filter(m => m !== memberName)
          : [...selectedList, memberName];
        onChange(newSelection);
      } else {
        // Single select: Toggle off if same, or switch to new
        const newSelection = selectedList.includes(memberName) ? "" : memberName;
        onChange(newSelection);
        setIsOpen(false);
      }
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
            <span className="truncate">
              {selectedList.length > 0
                ? `${selectedList.join(", ")}`
                : placeholder}
            </span>
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
                  const isSelected = selectedList.includes(member.name);

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

              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    setIsOpen(false);
                    setAddTeamMemberOpen(true);
                  }}
                >
                  <Check className="mr-2 h-3 w-3" />
                  + Add New Member
                </Button>
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="event_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mehndi Ceremony, Wedding, Reception" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Row 1: Start Date and Time */}
                  <FormField
                    control={form.control}
                    name="event_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd-MM-yyyy")
                                ) : (
                                  <span>dd-mm-yyyy</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time_from"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <div className="relative flex-1">
                              <Input type="time" {...field} />
                              <Clock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                            </div>
                          </FormControl>
                          <FormField
                            control={form.control}
                            name="time_from_period"
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-20">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="AM">AM</SelectItem>
                                  <SelectItem value="PM">PM</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Row 2: End Date and Time */}
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd-MM-yyyy")
                                ) : (
                                  <span>dd-mm-yyyy</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time_to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <div className="relative flex-1">
                              <Input type="time" {...field} />
                              <Clock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                            </div>
                          </FormControl>
                          <FormField
                            control={form.control}
                            name="time_to_period"
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-20">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="AM">AM</SelectItem>
                                  <SelectItem value="PM">PM</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Event venue" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="google_map_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Map Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://maps.google.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="photographer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photographer</FormLabel>
                      <FormControl>
                        <TeamMemberSelect
                          value={field.value || []}
                          onChange={field.onChange}
                          isMulti={true}
                          placeholder="Select photographers..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cinematographer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cinematographer</FormLabel>
                      <FormControl>
                        <TeamMemberSelect
                          value={field.value || []}
                          onChange={field.onChange}
                          isMulti={true}
                          placeholder="Select cinematographers..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="drone_operator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drone Operator</FormLabel>
                      <FormControl>
                        <TeamMemberSelect
                          value={field.value || []}
                          onChange={field.onChange}
                          isMulti={true}
                          placeholder="Select drone operators..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="site_manager"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Manager</FormLabel>
                      <FormControl>
                        <TeamMemberSelect
                          value={field.value || ""}
                          onChange={field.onChange}
                          isMulti={false}
                          placeholder="Select site manager..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assistant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assistant</FormLabel>
                      <FormControl>
                        <TeamMemberSelect
                          value={field.value || ""}
                          onChange={field.onChange}
                          isMulti={false}
                          placeholder="Select assistant..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>
            </div>

            {/* Full width fields */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Event details and description"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Special instructions for the team"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Event"}
              </Button>
            </div>
          </form>
        </Form>

        <AddTeamMemberDialog
          open={addTeamMemberOpen}
          onOpenChange={setAddTeamMemberOpen}
          onTeamMemberAdded={handleAddTeamMember}
          projectName="Current Project"
        />
      </DialogContent>
    </Dialog>
  );
}