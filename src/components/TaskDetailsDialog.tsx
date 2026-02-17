
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
    title: z.string().min(1, "Task title is required"),
    department: z.string().min(1, "Department is required"),
    category: z.string().optional(),
    priority: z.string().optional(),
    due_date: z.date().optional(),
    assigned_to: z.string().optional(),
    estimated_hours: z.string().optional(),
    description: z.string().optional(),
    status: z.string().optional(),
    expected_deliverables: z.string().optional(),
});

interface Task {
    id: string;
    project: string;
    title: string;
    department: string;
    category?: string;
    priority?: string;
    due_date?: string;
    assigned_to?: string;
    estimated_hours?: number;
    description?: string;
    status: string;
    expected_deliverables?: string;
}

interface TeamMemberContact {
    name: string;
    category?: string[];
}

interface TaskDetailsDialogProps {
    task: Task;
    onTaskUpdated: () => void;
    trigger: React.ReactNode;
}

export function TaskDetailsDialog({ task, onTaskUpdated, trigger }: TaskDetailsDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { token } = useAuth();
    const [teamMembers, setTeamMembers] = useState<string[]>([]);

    // Fetch team members logic similar to CreateTaskDialog
    useEffect(() => {
        if (open && token) {
            const fetchMembers = async () => {
                try {
                    const data = await api.get('/contacts/', token);
                    const membersList = Array.isArray(data) ? data : (data.results || []);
                    const postProduction: string[] = [];

                    membersList.forEach((m: TeamMemberContact) => {
                        const name = m.name;
                        const categories = m.category || [];
                        if (categories.includes("post_production")) {
                            postProduction.push(name);
                        }
                    });

                    setTeamMembers(postProduction);
                } catch (error) {
                    console.error("Failed to load team members", error);
                }
            };
            fetchMembers();
        }
    }, [open, token]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: task.title,
            department: task.department || "photo", // Default fallback
            category: task.category || "",
            priority: task.priority || "",
            assigned_to: task.assigned_to || "",
            estimated_hours: task.estimated_hours?.toString() || "",
            description: task.description || "",
            status: task.status || "backlog",
            expected_deliverables: task.expected_deliverables || "",
            due_date: task.due_date ? new Date(task.due_date) : undefined,
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            const payload = {
                title: values.title,
                department: values.department,
                category: values.category || null,
                priority: values.priority || null,
                due_date: values.due_date ? format(values.due_date, "yyyy-MM-dd") : null,
                assigned_to: values.assigned_to || null,
                estimated_hours: values.estimated_hours ? parseInt(values.estimated_hours) : null,
                description: values.description || null,
                expected_deliverables: values.expected_deliverables || null,
                status: values.status,
            };

            await api.patch(`/tasks/${task.id}/`, payload, token);

            toast({
                title: "Success",
                description: "Task updated successfully",
            });

            onTaskUpdated();
            setOpen(false);
        } catch (error: unknown) {
            console.error("Error updating task:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update task",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Task Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter task title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {/* Status options depend on department theoretically, but we can show all or dynamic */}
                                                <SelectItem value="backlog">Backlog</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="client_review">Client Review</SelectItem>
                                                <SelectItem value="editing">Editing</SelectItem>
                                                <SelectItem value="printing">Printing</SelectItem>
                                                <SelectItem value="delivered">Delivered</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="in_review">In Review</SelectItem>
                                                <SelectItem value="correction">Correction</SelectItem>
                                                <SelectItem value="submitted">Submitted</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="department"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="photo">Photo Team</SelectItem>
                                                <SelectItem value="video">Video Team</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="urgent">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="due_date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Due Date</FormLabel>
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
                                name="assigned_to"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assigned To</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select team member" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {teamMembers.map((member) => (
                                                    <SelectItem key={member} value={member}>{member}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Task description..."
                                            rows={4}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
