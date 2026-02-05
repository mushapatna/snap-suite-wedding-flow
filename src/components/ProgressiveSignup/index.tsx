import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Check, ChevronLeft } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { StepRenderer } from "./StepRenderer";
import { PlanSelection } from "./PlanSelection";
import { useSignupForm } from "./hooks/useSignupForm";
import { steps } from "./types";

interface ProgressiveSignupProps {
  onBack: () => void;
}

const ProgressiveSignup = ({ onBack }: ProgressiveSignupProps) => {
  const {
    currentStep,
    formData,
    isSubmitting,
    direction,
    progress,
    handleInputChange,
    canProceed,
    handleSubmit,
    goToNext,
    goToPrev,
  } = useSignupForm();

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const renderStep = () => {
    if (currentStep >= steps.length) {
      return (
        <PlanSelection
          formData={formData}
          onValueChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      );
    }

    const step = steps[currentStep];
    
    return (
      <StepRenderer
        step={step}
        formData={formData}
        onInputChange={handleInputChange}
        canProceed={canProceed}
        goToNext={goToNext}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-soft py-8 px-4 sm:px-6 lg:px-8">
      <ProgressBar progress={progress} />

      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={currentStep === 0 ? onBack : goToPrev}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length + 1}
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-6 sm:p-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-end mt-8">
              {currentStep < steps.length ? (
                <Button
                  onClick={goToNext}
                  disabled={!canProceed()}
                  className="px-6 sm:px-8 py-3 text-base sm:text-lg bg-gradient-primary hover:scale-[1.02] transition-transform"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 sm:px-8 py-3 text-base sm:text-lg bg-gradient-primary hover:scale-[1.02] transition-transform"
                >
                  {isSubmitting ? "Creating Account..." : "Finish"}
                  {!isSubmitting && <Check className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressiveSignup;