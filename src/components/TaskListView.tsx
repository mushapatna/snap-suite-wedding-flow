
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";
import { Button } from "@/components/ui/button";

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

interface TaskListViewProps {
    tasks: Task[];
    onRefresh: () => void;
}

export function TaskListView({ tasks, onRefresh }: TaskListViewProps) {
    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'text-red-700 bg-red-50 hover:bg-red-50';
            case 'medium':
                return 'text-yellow-700 bg-yellow-50 hover:bg-yellow-50';
            case 'low':
                return 'text-green-700 bg-green-50 hover:bg-green-50';
            default:
                return 'text-gray-700 bg-gray-50';
        }
    };

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Task Title</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                No tasks found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        tasks.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell className="font-medium">{task.title}</TableCell>
                                <TableCell className="capitalize">{task.department}</TableCell>
                                <TableCell>{task.assigned_to || "-"}</TableCell>
                                <TableCell>{task.due_date ? format(new Date(task.due_date), "dd MMM yyyy") : "-"}</TableCell>
                                <TableCell>
                                    {task.priority && (
                                        <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                                            {task.priority}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                        {(task.status || 'backlog').replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <TaskDetailsDialog
                                        task={task}
                                        onTaskUpdated={onRefresh}
                                        trigger={
                                            <Button variant="ghost" size="sm">
                                                View
                                            </Button>
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
