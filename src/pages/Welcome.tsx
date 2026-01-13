import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  Camera, 
  Video, 
  Edit3, 
  Scissors, 
  Plane, 
  Crown,
  User,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const roleConfig = {
  studio_owner: {
    title: 'Studio Owner',
    icon: Crown,
    description: 'Manage your entire wedding photography business',
    features: [
      'Team management and oversight',
      'Business analytics and reporting',
      'Project creation and assignment',
      'Revenue and booking tracking'
    ],
    dashboardPath: '/admin-dashboard',
    color: 'bg-gradient-primary'
  },
  photographer: {
    title: 'Photographer',
    icon: Camera,
    description: 'Capture beautiful moments and manage your shoots',
    features: [
      'Shot list management',
      'Equipment tracking',
      'Client gallery delivery',
      'Shoot scheduling'
    ],
    dashboardPath: '/photographer-dashboard',
    color: 'bg-gradient-secondary'
  },
  cinematographer: {
    title: 'Cinematographer',
    icon: Video,
    description: 'Create stunning wedding films and videos',
    features: [
      'Video project timeline',
      'Footage organization',
      'Client preview sharing',
      'Production planning'
    ],
    dashboardPath: '/cinematographer-dashboard',
    color: 'bg-gradient-accent'
  },
  photo_editor: {
    title: 'Photo Editor',
    icon: Edit3,
    description: 'Transform raw captures into stunning memories',
    features: [
      'Photo editing queue',
      'Client approval workflow',
      'Delivery management',
      'Quality control'
    ],
    dashboardPath: '/photo-editor-dashboard',
    color: 'bg-gradient-success'
  },
  video_editor: {
    title: 'Video Editor',
    icon: Scissors,
    description: 'Craft cinematic wedding stories',
    features: [
      'Video editing projects',
      'Render queue management',
      'Client review system',
      'Final delivery'
    ],
    dashboardPath: '/video-editor-dashboard',
    color: 'bg-gradient-warning'
  },
  drone_operator: {
    title: 'Drone Operator',
    icon: Plane,
    description: 'Capture breathtaking aerial footage',
    features: [
      'Flight planning and logs',
      'Weather monitoring',
      'Equipment maintenance',
      'Airspace compliance'
    ],
    dashboardPath: '/drone-dashboard',
    color: 'bg-gradient-info'
  },
  client: {
    title: 'Client',
    icon: User,
    description: 'Track your wedding project progress',
    features: [
      'Project progress tracking',
      'Gallery viewing and approval',
      'Team communication',
      'Download completed work'
    ],
    dashboardPath: '/client-portal',
    color: 'bg-gradient-muted'
  }
};

export const Welcome = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { user, userRoles } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Get user's actual role from auth
  const userRole = userRoles?.[0]?.role || role;
  const config = roleConfig[userRole as keyof typeof roleConfig];

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleContinue = async () => {
    setIsLoading(true);
    
    // Navigate to role-specific dashboard
    if (config?.dashboardPath) {
      navigate(config.dashboardPath);
    } else {
      navigate('/dashboard');
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <h1 className="text-2xl font-heading font-bold text-center">Welcome!</h1>
          <p className="text-muted-foreground text-center mt-2">
            Setting up your dashboard...
          </p>
          <Button onClick={() => navigate('/dashboard')} className="w-full mt-4">
            Continue to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card className="relative overflow-hidden">
          {/* Background gradient */}
          <div className={`absolute inset-0 ${config.color} opacity-5`}></div>
          
          <div className="relative p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4"
              >
                <Icon className="w-10 h-10 text-primary" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Badge variant="secondary" className="mb-4">
                  Welcome to the team!
                </Badge>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                  You're now a {config.title}
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                  {config.description}
                </p>
              </motion.div>
            </div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold mb-4">What you can do:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {config.features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Action button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-center"
            >
              <Button
                onClick={handleContinue}
                disabled={isLoading}
                size="lg"
                className="px-8 py-3 text-lg font-semibold"
              >
                {isLoading ? (
                  "Setting up..."
                ) : (
                  <>
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};