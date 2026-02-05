import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StepConfig, FormData } from "./types";

interface StepRendererProps {
  step: StepConfig;
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
  canProceed: () => boolean;
  goToNext: () => void;
}

export const StepRenderer = ({ step, formData, onInputChange, canProceed, goToNext }: StepRendererProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{step.title}</h2>
        <p className="text-muted-foreground">{step.description}</p>
      </div>
      
      <div className="space-y-4">
        {step.type === "text" || step.type === "email" || step.type === "password" ? (
          <Input
            type={step.type}
            placeholder={step.placeholder}
            value={formData[step.field as keyof FormData] as string}
            onChange={(e) => onInputChange(step.field, e.target.value)}
            className="text-lg py-6"
            autoFocus
          />
        ) : step.type === "select" ? (
          <Select 
            value={formData[step.field as keyof FormData] as string}
            onValueChange={(value) => onInputChange(step.field, value)}
          >
            <SelectTrigger className="text-lg py-6">
              <SelectValue placeholder="Choose an option" />
            </SelectTrigger>
            <SelectContent>
              {step.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : step.type === "radio" ? (
          <RadioGroup
            value={formData[step.field as keyof FormData] as string}
            onValueChange={(value) => onInputChange(step.field, value)}
            className="space-y-3"
          >
            {step.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-3">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="text-lg cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : null}
      </div>
    </div>
  );
};