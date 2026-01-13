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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Create team member via API (Triggering invitation automatically)

      const payload = {
        name: values.name,
        email: values.email,
        role: values.role,
        phone_number: values.whatsapp, // Mapping whatsapp to phone for now or add field
        whatsapp_number: values.whatsapp,
        category: values.categories, // Send array of categories
      };

      await api.post('/contacts/', payload, token);

      toast({
        title: "Success",
        description: `Team member invitation sent to ${values.email}`,
      });

      onTeamMemberAdded(values.name, values.role);

      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send team member invitation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="invite-team-member-description">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        <div id="invite-team-member-description" className="sr-only">
          Add a new team member by filling out their information and sending an invitation email
        </div>

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
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending Invitation..." : "Send Invitation"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}