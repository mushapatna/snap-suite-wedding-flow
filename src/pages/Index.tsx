import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Users, FolderOpen, Bell, Shield, Camera, CheckCircle, Star, ArrowRight, Menu, Play, Clock, Upload, Award, Zap } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // New feature set for modern wedding project management
  const features = [
    {
      icon: Camera,
      title: "Assign Roles to Your Team",
      description: "Seamlessly delegate tasks to photographers, videographers, and editors with role-specific dashboards and permissions."
    },
    {
      icon: FolderOpen,
      title: "Share Albums & Raw Footage",
      description: "Centralized media library with instant sharing, client galleries, and secure download controls for seamless delivery."
    },
    {
      icon: Clock,
      title: "Manage Editor Deadlines",
      description: "Track editing progress, set deadlines, and automate reminders to ensure every wedding is delivered on time."
    },
    {
      icon: Calendar,
      title: "Calendar & Smart Alerts",
      description: "Visual timeline with drag-and-drop scheduling, milestone tracking, and intelligent notifications for your entire team."
    },
    {
      icon: Shield,
      title: "Secure Client Access",
      description: "Branded client portals with password protection, approval workflows, and professional presentation features."
    },
    {
      icon: Zap,
      title: "Workflow Automation",
      description: "Automate repetitive tasks, sync with your favorite tools, and streamline communication across all projects."
    }
  ];

  // How it works steps
  const steps = [
    {
      step: "01",
      title: "Create Your Wedding Project",
      description: "Add wedding details, timeline, and key milestones in under 2 minutes",
      icon: Upload
    },
    {
      step: "02", 
      title: "Add Your Team or Freelancers",
      description: "Invite photographers, videographers, editors with specific role permissions",
      icon: Users
    },
    {
      step: "03",
      title: "Assign Roles and Deadlines",
      description: "Set clear expectations, deadlines, and deliverables for each team member",
      icon: Calendar
    },
    {
      step: "04",
      title: "Upload, Approve, and Deliver",
      description: "Review content, get client approval, and deliver professional galleries",
      icon: Award
    }
  ];

  const testimonials = [
    {
      quote: "SnapSuite transformed our chaotic workflow into a seamless machine. We've delivered 50+ weddings stress-free!",
      author: "Sarah Chen",
      company: "Crystal Eye Studio",
      rating: 5
    },
    {
      quote: "No more WhatsApp chaos! Our team efficiency increased 300% and clients love the professional delivery.",
      author: "Michael Rodriguez", 
      company: "Golden Hour Films",
      rating: 5
    },
    {
      quote: "The client portal feature alone has generated 40% more referrals. Our delivery has never been this professional.",
      author: "Emma Thompson",
      company: "Eternal Moments Photography", 
      rating: 5
    }
  ];

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 }
  };

  // Custom hook for scroll animations
  const useScrollAnimation = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    return { ref, isInView };
  };

  const heroRef = useScrollAnimation();
  const featuresRef = useScrollAnimation();
  const stepsRef = useScrollAnimation();
  const testimonialsRef = useScrollAnimation();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Sticky Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 shadow-soft"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Camera className="h-8 w-8 text-primary mr-3" />
              <span className="text-xl font-bold text-foreground">SnapSuite</span>
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <motion.a 
                href="#features" 
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
              >
                Product
              </motion.a>
              <motion.a 
                href="#features" 
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
              >
                Features
              </motion.a>
              <motion.a 
                href="#testimonials" 
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
              >
                Pricing
              </motion.a>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/login">
                  <Button variant="ghost" className="font-medium">Login</Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/signup">
                  <Button className="bg-gradient-primary font-medium shadow-soft">Get Started</Button>
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t"
            >
              <div className="flex flex-col space-y-3">
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors py-2 font-medium">Product</a>
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors py-2 font-medium">Features</a>
                <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors py-2 font-medium">Pricing</a>
                <div className="flex flex-col space-y-2 pt-2">
                  <Link to="/login">
                    <Button variant="ghost" className="w-full font-medium">Login</Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="w-full bg-gradient-primary font-medium">Get Started</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-soft opacity-50"></div>
        <div className="container mx-auto relative z-10">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            ref={heroRef.ref}
            initial="initial"
            animate={heroRef.isInView ? "animate" : "initial"}
            variants={staggerContainer}
          >
            {/* Hero Text */}
            <motion.div variants={fadeInUp} className="max-w-xl">
              <motion.h1 
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
                variants={fadeInUp}
              >
                Manage Your Entire{" "}
                <motion.span 
                  className="text-primary"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  Wedding Workflow
                </motion.span>{" "}
                From One Place
              </motion.h1>
              <motion.p 
                className="text-xl text-muted-foreground mb-8 leading-relaxed"
                variants={fadeInUp}
              >
                Plan shoots, assign editors, share galleries, and stay on schedule — stress free.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full"
                variants={fadeInUp}
              >
                <motion.div
                  whileHover={{ scale: 1.02, boxShadow: "var(--shadow-medium)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto"
                >
                  <Link to="/signup" className="block w-full">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto text-sm sm:text-lg px-4 sm:px-8 py-4 sm:py-6 bg-gradient-primary shadow-medium whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">Start Free — No Credit Card</span>
                      <span className="sm:hidden">Start Free</span>
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-lg px-4 sm:px-8 py-4 sm:py-6 shadow-soft">
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="hidden sm:inline">Continue with Google</span>
                    <span className="sm:hidden">Google</span>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div 
              variants={scaleIn}
              className="relative"
            >
              <div className="relative bg-card rounded-2xl shadow-large p-8 border">
                <motion.div 
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Sarah's Wedding - Oct 15</span>
                    <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Users className="h-5 w-5 text-accent" />
                    <span className="text-sm font-medium">Team Assignment</span>
                    <div className="ml-auto w-2 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Gallery Ready</span>
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            ref={featuresRef.ref}
            initial="initial"
            animate={featuresRef.isInView ? "animate" : "initial"}
            variants={fadeInUp}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Everything You Need to Manage Weddings
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From first consultation to final delivery, streamline every aspect of your wedding photography business.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate={featuresRef.isInView ? "animate" : "initial"}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
              >
                <Card className="text-center hover:shadow-medium transition-all duration-300 border-0 bg-gradient-soft h-full">
                  <CardHeader className="pb-4">
                    <motion.div 
                      className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="h-8 w-8 text-primary" />
                    </motion.div>
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            ref={stepsRef.ref}
            initial="initial"
            animate={stepsRef.isInView ? "animate" : "initial"}
            variants={fadeInUp}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes and transform your wedding workflow today
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate={stepsRef.isInView ? "animate" : "initial"}
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="text-center"
              >
                <motion.div 
                  className="mx-auto w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-medium"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <step.icon className="h-10 w-10 text-primary-foreground" />
                </motion.div>
                <div className="text-sm font-bold text-primary mb-3">{step.step}</div>
                <h3 className="text-xl font-bold text-foreground mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            ref={testimonialsRef.ref}
            initial="initial"
            animate={testimonialsRef.isInView ? "animate" : "initial"}
            variants={fadeInUp}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Loved by Photography Agencies Worldwide
            </h2>
            <p className="text-xl text-muted-foreground">
              See how SnapSuite has transformed wedding workflows for studios like yours.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate={testimonialsRef.isInView ? "animate" : "initial"}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="hover:shadow-medium transition-all duration-300 border-0 bg-gradient-soft h-full">
                  <CardContent className="pt-8">
                    <motion.div 
                      className="flex mb-6 justify-center"
                      initial={{ opacity: 0 }}
                      animate={testimonialsRef.isInView ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: index * 0.2 + 0.5 }}
                    >
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </motion.div>
                    <blockquote className="text-foreground mb-6 text-center leading-relaxed font-medium">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="text-center">
                      <div className="font-bold text-foreground">{testimonial.author}</div>
                      <div className="text-muted-foreground text-sm">{testimonial.company}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90"></div>
        <motion.div 
          className="container mx-auto text-center relative z-10 max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Ready to take control of your wedding projects?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90 leading-relaxed">
            Join hundreds of wedding photography agencies who have streamlined their workflow with SnapSuite.
          </p>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white text-primary hover:bg-gray-100 shadow-large">
                Start Free — No Credit Card
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <motion.div 
                className="flex items-center mb-6"
                whileHover={{ scale: 1.02 }}
              >
                <Camera className="h-8 w-8 text-primary mr-3" />
                <span className="text-xl font-bold text-foreground">SnapSuite</span>
              </motion.div>
              <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
                Built for Creators Who Capture Forever
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-4">Company</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-4">Legal</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2024 SnapSuite. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <motion.a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.405.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                </svg>
              </motion.a>
              <motion.a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
              </motion.a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;