import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

export const WorkHistory = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader user={user} />

            <main className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-dashed">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-8 h-8 text-muted-foreground" />
                        </div>

                        <h1 className="text-2xl font-bold mb-2">Work History</h1>
                        <p className="text-muted-foreground mb-6">
                            This feature is currently under development. Soon you'll be able to view your complete history of past projects and submissions here.
                        </p>

                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            Coming Soon
                        </div>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
};

export default WorkHistory;
