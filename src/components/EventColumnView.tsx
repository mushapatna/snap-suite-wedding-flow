
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, MapPin, Clock } from "lucide-react";
import { EventDetailsDialog } from "@/components/EventDetailsDialog";

interface Event {
    id: string;
    event_name: string;
    event_date: string;
    location?: string;
    time_from?: string;
    time_to?: string;
    status: string;
    photographer?: string;
    cinematographer?: string;
    drone_operator?: string;
    site_manager?: string;
    assistant?: string;
}

interface EventColumnViewProps {
    events: Event[];
    title: string;
    onRefresh: () => void;
}

export function EventColumnView({ events, title, onRefresh }: EventColumnViewProps) {

    const columns = [
        { id: 'upcoming', title: 'Upcoming' },
        { id: 'completed', title: 'Completed' },
        { id: 'submitted', title: 'Uploaded/Submitted' }
    ];

    const getEventsByStatus = (status: string) => {
        // Default to upcoming if no status (backward compatibility)
        return events.filter((event) => (event.status || 'upcoming') === status);
    };

    const getAssignedCrew = (event: Event) => {
        const crew = [];
        if (event.photographer) crew.push(event.photographer);
        if (event.cinematographer) crew.push(event.cinematographer);
        if (event.drone_operator) crew.push(event.drone_operator);
        if (event.site_manager) crew.push(event.site_manager);
        if (event.assistant) crew.push(event.assistant);

        return crew.join(", ");
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
                {columns.map((column) => (
                    <div key={column.id} className="min-w-[300px] w-full">
                        <div className="bg-gray-100/50 p-3 rounded-t-lg border-b">
                            <h4 className="font-semibold text-sm text-gray-700 flex justify-between items-center">
                                {column.title}
                                <Badge variant="secondary" className="text-xs">
                                    {getEventsByStatus(column.id).length}
                                </Badge>
                            </h4>
                        </div>
                        <div className="bg-gray-50/50 p-2 rounded-b-lg min-h-[300px] space-y-3">
                            {getEventsByStatus(column.id).map((event) => {
                                const eventDate = new Date(event.event_date);
                                const assignedCrew = getAssignedCrew(event);

                                return (
                                    <EventDetailsDialog
                                        key={event.id}
                                        event={event}
                                        onUpdate={onRefresh} // Pass refresh trigger
                                        trigger={
                                            <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                                <CardContent className="p-4 space-y-3">
                                                    <div>
                                                        <h4 className="font-medium text-base">{event.event_name}</h4>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {format(eventDate, "dd MMM yyyy")}
                                                        </div>
                                                    </div>

                                                    {event.location && (
                                                        <div className="text-sm text-gray-600 flex items-start gap-2">
                                                            <MapPin className="h-3 w-3 mt-1 shrink-0" />
                                                            <span className="line-clamp-1">{event.location}</span>
                                                        </div>
                                                    )}

                                                    {assignedCrew && (
                                                        <div className="pt-2 border-t mt-2">
                                                            <p className="text-xs font-medium text-gray-500 mb-1">Assigned to:</p>
                                                            <p className="text-xs text-gray-700 line-clamp-2">{assignedCrew}</p>
                                                        </div>
                                                    )}

                                                    <div className="flex gap-2">
                                                        <Badge variant="outline" className="text-[10px] h-5">{column.title}</Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        }
                                    />
                                );
                            })}
                            {getEventsByStatus(column.id).length === 0 && (
                                <div className="text-center py-8 text-xs text-muted-foreground italic">
                                    No events
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
