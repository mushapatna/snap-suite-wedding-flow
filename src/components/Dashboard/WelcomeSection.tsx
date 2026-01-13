import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  plan_type: string | null;
  role: string | null;
}

interface WelcomeSectionProps {
  profile: Profile | null;
}

export const WelcomeSection = ({ profile }: WelcomeSectionProps) => {
  const getGreetingName = () => {
    if (profile?.full_name) {
      return profile.full_name;
    }
    return "there";
  };

  const getPlanDisplay = () => {
    if (!profile?.plan_type) return "Free Plan";
    return profile.plan_type.charAt(0).toUpperCase() + profile.plan_type.slice(1) + " Plan";
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-primary border-0">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.3%22%3E%3Ccircle%20cx=%227%22%20cy=%227%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      <div className="relative p-8 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground">
                Hi {getGreetingName()}, ready for your next wedding?
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-2"
            >
              {profile?.company_name && (
                <p className="text-lg text-primary-foreground/90">
                  {profile.company_name}
                </p>
              )}
              <p className="text-primary-foreground/80">
                {getPlanDisplay()}
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center lg:justify-end"
          >
            <Button 
              size="lg" 
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold px-8 py-3 text-lg shadow-medium"
            >
              Create New Wedding Project
            </Button>
          </motion.div>
        </div>
      </div>
    </Card>
  );
};