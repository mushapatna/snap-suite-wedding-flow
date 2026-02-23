import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { FormData, initialFormData, steps } from "../types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const useSignupForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp } = useAuth(); // Use auth hook

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof FormData] as string[];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const canProceed = () => {
    const step = steps[currentStep];
    if (!step) return true;

    if (step.required) {
      const value = formData[step.field as keyof FormData];
      return Array.isArray(value) ? value.length > 0 : value !== "";
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.email || !formData.password) {
        toast({
          title: "Missing Information",
          description: "Please provide email and password to create your account.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare user metadata for profile creation
      const userMetadata = {
        full_name: formData.fullName,
        company_name: formData.companyName,
        role: formData.role,
        plan_type: formData.planType,
        phone_number: formData.phoneNumber,
        location: formData.location,
        years_in_business: formData.yearsInBusiness,
        weddings_per_year: formData.weddingsPerYear,
        services_offered: formData.servicesOffered, // Array support in serializer
        current_tools: formData.currentTools, // Array support
        referral_source: formData.referralSource
      };

      // Create user account with custom hook
      const { success, error } = await signUp(formData.email, formData.password, userMetadata);

      if (!success) {
        toast({
          title: "Signup Failed",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created Successfully!",
          description: "Welcome to EVENTPIXIO. You can now log in.",
        });
        navigate('/login');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Signup Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToNext = () => {
    setDirection(1);
    handleNext();
  };

  const goToPrev = () => {
    setDirection(-1);
    handlePrev();
  };

  const progress = ((currentStep + 1) / (steps.length + 1)) * 100;

  return {
    currentStep,
    formData,
    isSubmitting,
    direction,
    progress,
    handleInputChange,
    handleArrayChange,
    canProceed,
    handleSubmit,
    goToNext,
    goToPrev,
  };
};