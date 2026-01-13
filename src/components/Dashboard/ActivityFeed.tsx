import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const activities = [
  {
    id: 1,
    user: "Sarah M.",
    action: "uploaded teaser film for",
    subject: "Satyam & Shivangi's wedding",
    time: "2 hours ago",
    initials: "SM",
  },
  {
    id: 2,
    user: "Mike R.",
    action: "completed photo editing for",
    subject: "Jessica & David's engagement",
    time: "5 hours ago",
    initials: "MR",
  },
  {
    id: 3,
    user: "Lisa K.",
    action: "delivered final gallery to",
    subject: "Emma & Ryan's wedding",
    time: "1 day ago",
    initials: "LK",
  },
  {
    id: 4,
    user: "Alex T.",
    action: "started editing process for",
    subject: "Priya & Arjun's wedding",
    time: "2 days ago",
    initials: "AT",
  },
];

export const ActivityFeed = () => {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-xl font-heading">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200"
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {activity.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{activity.user}</span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>{" "}
                  <span className="font-medium">{activity.subject}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.time}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};