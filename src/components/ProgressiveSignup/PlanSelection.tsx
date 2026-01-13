import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FormData, plans } from "./types";

interface PlanSelectionProps {
  formData: FormData;
  onValueChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

export const PlanSelection = ({ formData, onValueChange, onSubmit }: PlanSelectionProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Choose your plan</h2>
        <p className="text-muted-foreground">Start your 14-day free trial</p>
      </div>
      
      <RadioGroup
        value={formData.planType}
        onValueChange={(value) => onValueChange("planType", value)}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {plans.map((plan) => (
          <div key={plan.id} className="relative">
            <RadioGroupItem
              value={plan.id}
              id={plan.id}
              className="peer sr-only"
            />
            <Label
              htmlFor={plan.id}
              className="flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all peer-checked:border-primary peer-checked:bg-primary/5 hover:border-primary/50 hover:shadow-medium"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{plan.name}</span>
                <span className="text-lg font-bold text-primary">{plan.price}/mo</span>
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};