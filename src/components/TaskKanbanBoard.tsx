
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Strict Mode fix for react-beautiful-dnd in React 18
import { useEffect, useState } from "react";

interface Task {
    id: string;
    title: string;
    category?: string;
    priority?: string;
    due_date?: string;
    assigned_to?: string;
    status: string;
}

interface Column {
    id: string;
    title: string;
}

interface TaskKanbanBoardProps {
    tasks: Task[];
    columns: Column[];
    onStatusChange: (taskId: string, newStatus: string) => void;
    title: string;
}

export function TaskKanbanBoard({ tasks, columns, onStatusChange, title }: TaskKanbanBoardProps) {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const animation = requestAnimationFrame(() => setEnabled(true));
        return () => {
            cancelAnimationFrame(animation);
            setEnabled(false);
        };
    }, []);

    const getTasksByStatus = (status: string) => {
        return tasks.filter((task) => task.status === status);
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const { draggableId, destination } = result;
        const newStatus = destination.droppableId;

        // Only call if status changed
        const task = tasks.find(t => t.id === draggableId);
        if (task && task.status !== newStatus) {
            onStatusChange(draggableId, newStatus);
        }
    };

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

    if (!enabled) {
        return null;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {columns.map((column) => (
                        <div key={column.id} className="min-w-[280px] w-full max-w-[320px]">
                            <div className="bg-gray-100/50 p-3 rounded-t-lg border-b">
                                <h4 className="font-semibold text-sm text-gray-700 flex justify-between items-center">
                                    {column.title}
                                    <Badge variant="secondary" className="text-xs">
                                        {getTasksByStatus(column.id).length}
                                    </Badge>
                                </h4>
                            </div>
                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={cn(
                                            "bg-gray-50/50 p-2 rounded-b-lg min-h-[500px]",
                                            snapshot.isDraggingOver && "bg-blue-50/50"
                                        )}
                                    >
                                        {getTasksByStatus(column.id).map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={cn(
                                                            "mb-2",
                                                            snapshot.isDragging && "opacity-75"
                                                        )}
                                                    >
                                                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                                                            <CardContent className="p-3 space-y-2">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="font-medium text-sm line-clamp-2">{task.title}</div>
                                                                    {task.priority && (
                                                                        <div className={cn("text-[10px] px-1.5 py-0.5 rounded border uppercase font-semibold", getPriorityColor(task.priority))}>
                                                                            {task.priority}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground space-y-1">
                                                                    {task.category && <div>{task.category}</div>}
                                                                    {task.assigned_to && <div>{task.assigned_to}</div>}
                                                                    {task.due_date && <div>Due: {format(new Date(task.due_date), "MMM d")}</div>}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
}
