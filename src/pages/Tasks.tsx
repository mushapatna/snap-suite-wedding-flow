import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar as CalendarIcon,
    CheckCircle,
    Clock,
    Briefcase,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Filter,
    X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { useAuth } from "@/hooks/useAuth";
import { format, isSameDay, addDays, parseISO } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface Task {
    id: string;
    title: string;
    department: string;
    priority: string;
    due_date: string;
    assigned_to: string;
    status: string;
    project_details: {
        couple_name: string;
        event_type: string;
        status?: string;
    };
    description?: string;
}

interface TasksGroupedByProject {
    [projectName: string]: Task[];
}

type DateFilterType = "today" | "tomorrow" | "day_after" | "custom" | "all";
type ProjectStatusFilter = "all" | "active" | "completed" | "archived";

const Tasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [groupedTasks, setGroupedTasks] = useState<TasksGroupedByProject>({});
    const [loading, setLoading] = useState(true);

    // Filters
    const [dateFilterType, setDateFilterType] = useState<DateFilterType>("today");
    const [customDate, setCustomDate] = useState<Date | undefined>(new Date());
    const [projectStatusFilter, setProjectStatusFilter] = useState<ProjectStatusFilter>("all");
    const [expandedTasks, setExpandedTasks] = useState<string[]>([]);

    const { toast } = useToast();
    const { user, token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            fetchTasks();
        }
    }, [token]);

    // Apply filters whenever tasks or filter states change
    useEffect(() => {
        if (tasks.length > 0) {
            applyFilters();
        }
    }, [tasks, dateFilterType, customDate, projectStatusFilter]);

    const fetchTasks = async () => {
        try {
            const data = await api.get('/tasks/', token);
            const tasksData = Array.isArray(data) ? data : (data.results || []);
            setTasks(tasksData);
        } catch (error: any) {
            console.error('Error fetching tasks:', error);
            toast({
                title: "Error",
                description: "Failed to load tasks",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...tasks];

        // 1. Filter by Project Status
        if (projectStatusFilter !== "all") {
            filtered = filtered.filter(task =>
                task.project_details?.status?.toLowerCase() === projectStatusFilter
            );
        }

        // 2. Filter by Due Date
        if (dateFilterType !== "all") {
            let targetDate: Date | null = null;
            const today = new Date();

            switch (dateFilterType) {
                case "today":
                    targetDate = today;
                    break;
                case "tomorrow":
                    targetDate = addDays(today, 1);
                    break;
                case "day_after":
                    targetDate = addDays(today, 2);
                    break;
                case "custom":
                    targetDate = customDate || null;
                    break;
            }

            if (targetDate) {
                filtered = filtered.filter(task => {
                    if (!task.due_date) return false;
                    return isSameDay(parseISO(task.due_date), targetDate);
                });
            }
        }

        // Group filtered tasks
        const grouped = filtered.reduce((acc: any, task: any) => {
            const projectName = task.project_details?.couple_name || 'Unassigned Project';
            if (!acc[projectName]) {
                acc[projectName] = [];
            }
            acc[projectName].push(task);
            return acc;
        }, {});

        setGroupedTasks(grouped);
    };

    const toggleTaskExpansion = (taskId: string) => {
        setExpandedTasks(prev =>
            prev.includes(taskId)
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-500/10 text-green-600 border-green-200';
            case 'in_progress':
            case 'active':
                return 'bg-blue-500/10 text-blue-600 border-blue-200';
            case 'pending':
                return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
            default:
                return 'bg-gray-500/10 text-gray-600 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'text-red-500';
            case 'medium':
                return 'text-yellow-500';
            case 'low':
                return 'text-green-500';
            default:
                return 'text-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading tasks...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader user={user} />

            <div className="container mx-auto px-4 py-6">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-heading text-foreground mb-2">My Tasks</h1>
                        <p className="text-muted-foreground">
                            View and manage your tasks across projects
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Due Date Filter */}
                        <div className="flex items-center gap-2">
                            <Select value={dateFilterType} onValueChange={(val: any) => setDateFilterType(val)}>
                                <SelectTrigger className="w-[180px]">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Due Date" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="today">Due Today</SelectItem>
                                    <SelectItem value="tomorrow">Due Tomorrow</SelectItem>
                                    <SelectItem value="day_after">Due Day After</SelectItem>
                                    <SelectItem value="custom">Pick a Date</SelectItem>
                                    <SelectItem value="all">All Dates</SelectItem>
                                </SelectContent>
                            </Select>

                            {dateFilterType === "custom" && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[180px] justify-start text-left font-normal",
                                                !customDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {customDate ? format(customDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={customDate}
                                            onSelect={setCustomDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        </div>

                        {/* Project Status Filter */}
                        <Select value={projectStatusFilter} onValueChange={(val: any) => setProjectStatusFilter(val)}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Project Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Projects</SelectItem>
                                <SelectItem value="active">Active Projects</SelectItem>
                                <SelectItem value="completed">Completed Projects</SelectItem>
                            </SelectContent>
                        </Select>

                        {(dateFilterType !== "today" || projectStatusFilter !== "all" || dateFilterType === "custom") && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setDateFilterType("today");
                                    setProjectStatusFilter("all");
                                    setCustomDate(new Date());
                                }}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Reset
                            </Button>
                        )}
                    </div>
                </div>

                {Object.keys(groupedTasks).length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-lg border shadow-sm">
                        <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No tasks found</h3>
                        <p className="text-muted-foreground">
                            Try adjusting your filters or check back later.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedTasks).map(([projectName, projectTasks], index) => (
                            <motion.div
                                key={projectName}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <div className="flex items-center mb-4">
                                    <Briefcase className="h-5 w-5 mr-2 text-primary" />
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-semibold text-foreground">{projectName}</h2>
                                        {projectTasks[0]?.project_details?.status && (
                                            <Badge variant="outline" className="text-xs">
                                                {projectTasks[0].project_details.status}
                                            </Badge>
                                        )}
                                    </div>
                                    <Badge variant="secondary" className="ml-4">
                                        {projectTasks.length} Tasks
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {projectTasks.map((task) => (
                                        <Collapsible
                                            key={task.id}
                                            open={expandedTasks.includes(task.id)}
                                            onOpenChange={() => toggleTaskExpansion(task.id)}
                                        >
                                            <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4" style={{ borderLeftColor: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#eab308' : '#22c55e' }}>
                                                <CollapsibleTrigger asChild>
                                                    <CardHeader className="pb-3 select-none">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex gap-2">
                                                                <Badge variant="outline" className={getStatusColor(task.status)}>
                                                                    {task.status.replace('_', ' ').toUpperCase()}
                                                                </Badge>
                                                            </div>
                                                            {task.priority && (
                                                                <div className={`flex items-center text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                                    {task.priority.toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <CardTitle className="text-base font-medium line-clamp-2">
                                                                {task.title}
                                                            </CardTitle>
                                                            {expandedTasks.includes(task.id) ? (
                                                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                    </CardHeader>
                                                </CollapsibleTrigger>

                                                <CardContent>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="flex items-center text-muted-foreground">
                                                            <Clock className="h-4 w-4 mr-2" />
                                                            <span>Due: {task.due_date ? format(parseISO(task.due_date), "MMM d, yyyy") : "No date"}</span>
                                                        </div>

                                                        <CollapsibleContent className="space-y-3 animate-in slide-in-from-top-2">
                                                            <div className="pt-2 border-t">
                                                                <div className="flex items-center text-muted-foreground mb-2">
                                                                    <span className="font-medium mr-2">Assigned to:</span>
                                                                    {task.assigned_to || "Unassigned"}
                                                                </div>
                                                                <div className="flex items-center text-muted-foreground mb-2">
                                                                    <span className="font-medium mr-2">Department:</span>
                                                                    <span className="capitalize">{task.department}</span>
                                                                </div>
                                                                {task.description && (
                                                                    <div className="bg-muted/50 p-3 rounded-md text-xs sm:text-sm">
                                                                        <p className="font-medium mb-1 text-muted-foreground">Description:</p>
                                                                        {task.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CollapsibleContent>

                                                        {!expandedTasks.includes(task.id) && (
                                                            <div className="text-xs text-muted-foreground text-center pt-1">
                                                                Click to view details
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Collapsible>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tasks;
