import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Copy, Check, Eye, EyeOff, UserPlus } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  whatsapp: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  categories: z.array(z.string()).refine((value) => value.length > 0, {
    message: "You have to select at least one category.",
  }),
});

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamMemberAdded: (name: string, role: string) => void;
  projectName?: string;
}

export function AddTeamMemberDialog({
  open,
  onOpenChange,
  onTeamMemberAdded,
  projectName
}: AddTeamMemberDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<{ username: string, password?: string, message?: string } | null>(null);
  const [copied, setCopied] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      whatsapp: "",
      role: "",
      categories: ["crew"], // Default to crew
    },
  });

  const { token } = useAuth(); // We need auth token

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setCredentials(null);
      form.reset();
    }
    onOpenChange(newOpen);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(""), 2000);
    toast({
      title: "Copied",
      description: `${field} copied to clipboard`,
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: values.name,
        email: values.email,
        role: values.role,
        phone_number: values.whatsapp,
        whatsapp_number: values.whatsapp,
        category: values.categories,
      };

      const response = await api.post('/contacts/', payload, token);

      toast({
        title: "Success",
        description: `Team member ${values.name} added successfully`,
      });

      onTeamMemberAdded(values.name, values.role);

      // Set credentials to show success screen
      setCredentials({
        username: response.username || values.email,
        password: response.generated_password,
        message: response.message
      });

    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add team member",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const SuccessView = () => (
    <div className="space-y-6 pt-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <div className="flex justify-center mb-2">
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-green-800">Team Member Added!</h3>
        <p className="text-green-700 text-sm mt-1">
          {credentials?.message || "Share these credentials with your team member. They will be prompted to change their password on first login."}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Username / Email</label>
          <div className="flex gap-2">
            <Input value={credentials?.username} readOnly className="bg-muted" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(credentials?.username || "", "Username")}
            >
              {copied === "Username" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {credentials?.password && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Temporary Password</label>
            <div className="flex gap-2 relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                readOnly
                className="bg-muted pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-14 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => copyToClipboard(credentials.password || "", "Password")}
              >
                {copied === "Password" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-200">
              ⚠️ This password will successfully authenticate the user. Please make sure to copy it now as it won't be shown again.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={() => handleOpenChange(false)} className="w-full">
          Done
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="invite-team-member-description">
        <DialogHeader>
          <DialogTitle>{credentials ? "Credentials Generated" : "Add Team Member"}</DialogTitle>
          <DialogDescription>
            {credentials ? "Login details for the new member." : "Add a new team member and generate their login credentials."}
          </DialogDescription>
        </DialogHeader>

        {credentials ? (
          <SuccessView />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter team member's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter WhatsApp number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="photographer">Photographer</SelectItem>
                        <SelectItem value="cinematographer">Cinematographer</SelectItem>
                        <SelectItem value="drone_operator">Drone Operator</SelectItem>
                        <SelectItem value="site_manager">Site Manager</SelectItem>
                        <SelectItem value="assistant">Assistant</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="album_editor">Album Editor</SelectItem>
                        <SelectItem value="video_editor">Video Editor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categories"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Team Category</FormLabel>
                    </div>
                    <div className="flex gap-4">
                      <FormField
                        control={form.control}
                        name="categories"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key="crew"
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes("crew")}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, "crew"])
                                      : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== "crew"
                                        )
                                      )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Crew Member
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                      <FormField
                        control={form.control}
                        name="categories"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key="post_production"
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes("post_production")}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, "post_production"])
                                      : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== "post_production"
                                        )
                                      )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Post Production
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Generating..." : "Add Member"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}