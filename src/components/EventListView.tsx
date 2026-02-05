
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
import { EventDetailsDialog } from "@/components/EventDetailsDialog";
import { Button } from "@/components/ui/button";

interface Event {
    id: string;
    event_name: string;
    event_date: string;
    status: string;
    location?: string;
    time_from?: string;
    time_to?: string;
    photographer?: string;
    cinematographer?: string;
    drone_operator?: string;
    site_manager?: string;
    assistant?: string;
}

interface EventListViewProps {
    events: Event[];
    onRefresh: () => void;
}

export function EventListView({ events, onRefresh }: EventListViewProps) {
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
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Event Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Assigned Crew</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {events.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                No events found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        events.map((event) => (
                            <TableRow key={event.id}>
                                <TableCell className="font-medium">{event.event_name}</TableCell>
                                <TableCell>{format(new Date(event.event_date), "dd MMM yyyy")}</TableCell>
                                <TableCell>{event.location || "-"}</TableCell>
                                <TableCell className="max-w-[200px] truncate" title={getAssignedCrew(event)}>
                                    {getAssignedCrew(event) || "-"}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{event.status || 'upcoming'}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <EventDetailsDialog
                                        event={event}
                                        onUpdate={onRefresh}
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
