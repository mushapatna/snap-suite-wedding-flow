import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: number;
}

export const LoadingSpinner = ({ className, size = 24, ...props }: LoadingSpinnerProps) => {
    return (
        <div className={cn("flex justify-center items-center p-4", className)} {...props}>
            <Loader2 className="animate-spin text-primary" size={size} />
        </div>
    );
};
