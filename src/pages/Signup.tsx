import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Camera, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import ProgressiveSignup from "@/components/ProgressiveSignup";

const Signup = () => {
  const [showProgressiveForm, setShowProgressiveForm] = useState(false);

  if (showProgressiveForm) {
    return <ProgressiveSignup onBack={() => setShowProgressiveForm(false)} />;
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-gradient-soft py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div 
        className="max-w-md mx-auto mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link to="/" className="flex items-center text-primary hover:text-primary/80 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <div className="flex items-center justify-center mb-6">
          <Camera className="h-8 w-8 text-primary mr-2" />
          <span className="text-2xl font-bold text-primary">SnapSuite</span>
        </div>
      </motion.div>

      <motion.div
        className="max-w-lg mx-auto"
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.div variants={fadeInUp} className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Join SnapSuite
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Choose how you'd like to get started
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-4">
          {/* Google Signup */}
          <Button
            variant="outline"
            className="w-full py-4 text-lg bg-background border-border hover:bg-muted/50 shadow-soft"
            onClick={() => {
              // Handle Google signup
              console.log("Google signup clicked");
            }}
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">or</span>
            </div>
          </div>

          {/* Progressive Form Button */}
          <Button
            className="w-full py-3 sm:py-4 text-base sm:text-lg bg-gradient-primary text-primary-foreground shadow-medium hover:scale-[1.02] transition-transform"
            onClick={() => setShowProgressiveForm(true)}
          >
            Create Account with Email
            <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-4">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;