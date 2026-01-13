import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, Search, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
import { AddTeamMemberDialog } from "@/components/ui/AddTeamMemberDialog";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  event_name: z.string().min(1, "Event name is required"),
  event_date: z.date({
    required_error: "Event date is required",
  }),
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

// Team members data - using state to allow dynamic updates
const initialTeamMembers = {
  photographers: ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Connor", "Alex Rodriguez"],
  cinematographers: ["Alex Brown", "Sarah Wilson", "David Lee", "Emma Stone", "Chris Evans"],
  droneOperators: ["Tom Clark", "Lisa Taylor", "Chris Martin", "Diana Prince", "Bruce Wayne"],
  siteManagers: ["Ryan Garcia", "Emma Davis", "Kevin Moore", "Tony Stark", "Peter Parker"],
  assistants: ["Amy White", "Jason Hall", "Nina Lopez", "Clark Kent", "Lois Lane"],
};

interface AddEventDialogProps {
  projectId: string;
  onEventAdded: () => void;
  trigger: React.ReactNode;
}

export function AddEventDialog({ projectId, onEventAdded, trigger }: AddEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [addTeamMemberOpen, setAddTeamMemberOpen] = useState(false);
  const { toast } = useToast();

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

  const { token } = useAuth();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Format time (ensure HH:mm:ss for Django)
      // Input type="time" returns HH:mm in 24-hour format, so we don't need the separate period field
      const formatTime = (time: string) => {
        if (!time) return null;
        return `${time}:00`;
      };

      const payload = {
        project: projectId,
        event_name: values.event_name,
        event_date: format(values.event_date, "yyyy-MM-dd"),
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
    setTeamMembers(prev => ({
      ...prev,
      [role]: [...prev[role as keyof typeof prev], name]
    }));
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

                <FormField
                  control={form.control}
                  name="event_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="time_from"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time From</FormLabel>
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
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="time_to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time To</FormLabel>
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
                        <MultiSelect
                          options={teamMembers.photographers}
                          selected={field.value || []}
                          onChange={field.onChange}
                          placeholder="Select photographers..."
                          onAddCollaborator={() => setAddTeamMemberOpen(true)}
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
                        <MultiSelect
                          options={teamMembers.cinematographers}
                          selected={field.value || []}
                          onChange={field.onChange}
                          placeholder="Select cinematographers..."
                          onAddCollaborator={() => setAddTeamMemberOpen(true)}
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
                        <MultiSelect
                          options={teamMembers.droneOperators}
                          selected={field.value || []}
                          onChange={field.onChange}
                          placeholder="Select drone operators..."
                          onAddCollaborator={() => setAddTeamMemberOpen(true)}
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select site manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teamMembers.siteManagers.map((manager) => (
                            <SelectItem key={manager} value={manager.toLowerCase().replace(" ", "-")}>
                              {manager}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assistant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teamMembers.assistants.map((assistant) => (
                            <SelectItem key={assistant} value={assistant.toLowerCase().replace(" ", "-")}>
                              {assistant}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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