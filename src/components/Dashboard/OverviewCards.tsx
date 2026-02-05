import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, FolderOpen, HardDrive } from "lucide-react";

const cardData = [
  {
    title: "Upcoming Weddings",
    value: "12",
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Team Members",
    value: "8",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Projects In Progress",
    value: "5",
    icon: FolderOpen,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Storage Used",
    value: "67%",
    icon: HardDrive,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

export const OverviewCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cardData.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-soft hover:shadow-medium transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {card.value}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 to-primary opacity-50"></div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};