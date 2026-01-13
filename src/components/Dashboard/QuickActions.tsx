import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, UserPlus, Calendar, Upload } from "lucide-react";
import { AddTeamMemberDialog } from "@/components/ui/AddTeamMemberDialog";
import { format } from "date-fns";

const actions = [
  {
    title: "View Projects",
    description: "See all your wedding projects",
    icon: Calendar,
    color: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  {
    title: "New Project",
    description: "Create a new wedding project",
    icon: Plus,
    color: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  },
  {
    title: "Invite Team",
    description: "Add team members to your agency",
    icon: UserPlus,
    color: "bg-accent text-accent-foreground hover:bg-accent/80",
  },
  {
    title: "Full Calendar",
    description: "View full monthly calendar",
    icon: Calendar,
    color: "bg-muted text-muted-foreground hover:bg-muted/80",
  },
];

export const QuickActions = () => {
  const navigate = useNavigate();
  const [addTeamMemberOpen, setAddTeamMemberOpen] = useState(false);

  const handleActionClick = (title: string) => {
    if (title === "New Project") {
      navigate("/new-project");
    } else if (title === "View Projects") {
      navigate("/projects");
    } else if (title === "Invite Team") {
      setAddTeamMemberOpen(true);
    } else if (title === "Full Calendar") {
      navigate("/calendar");
    }
    // Add other action handlers here as needed
  };

  const handleTeamMemberAdded = (name: string, role: string) => {
    console.log(`Team member added: ${name} as ${role}`);
  };

   return (
     <div className="space-y-6">
       {/* Quick Actions */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-xl font-heading">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action, index) => {
              const Icon = action.icon;
              const today = new Date();
              
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => handleActionClick(action.title)}
                    className={`relative h-auto p-6 flex flex-col items-center justify-center space-y-3 w-full border-2 hover:border-primary/30 transition-all duration-300 ${action.color} overflow-hidden`}
                  >
                    {/* Today's Date Background for Full Calendar */}
                    {action.title === "Full Calendar" && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <div className="text-6xl font-bold">
                          {format(today, 'dd')}
                        </div>
                      </div>
                    )}
                    
                    <Icon className="h-8 w-8 relative z-10" />
                    <div className="text-center relative z-10">
                      <div className="font-semibold">{action.title}</div>
                      <div className="text-xs opacity-80 mt-1">
                        {action.description}
                      </div>
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>

        <AddTeamMemberDialog
          open={addTeamMemberOpen}
          onOpenChange={setAddTeamMemberOpen}
          onTeamMemberAdded={handleTeamMemberAdded}
        />
      </Card>
    </div>
  );
};