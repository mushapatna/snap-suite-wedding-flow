import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";

interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  plan_type: string | null;
  role: string | null;
  phone_number: string | null;
  location: string | null;
  years_in_business: string | null;
  weddings_per_year: string | null;
  services_offered: string[] | null;
  current_tools: string[] | null;
}

// Define simple User interface compatible with what we get from useAuth
interface User {
  id: string;
  email?: string;
}

interface ProfileSettingsProps {
  user: User | null;
  profile: Profile | null;
}

const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  company_name: z.string().optional(),
  phone_number: z.string().optional(),
  location: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  years_in_business: z.string().optional(),
  weddings_per_year: z.string().optional(),
});

export const ProfileSettings = ({ user, profile }: ProfileSettingsProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [servicesOffered, setServicesOffered] = useState<string[]>(profile?.services_offered || []);
  const [currentTools, setCurrentTools] = useState<string[]>(profile?.current_tools || []);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      company_name: profile?.company_name || "",
      phone_number: profile?.phone_number || "",
      location: profile?.location || "",
      role: profile?.role || "photographer",
      years_in_business: profile?.years_in_business || "",
      weddings_per_year: profile?.weddings_per_year || "",
    },
  });

  const { token } = useAuth();

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!profile || !token) return;

    setIsLoading(true);
    try {
      const payload = {
        ...values,
        services_offered: servicesOffered,
        current_tools: currentTools,
      };

      await api.put(`/profiles/${profile.id}/`, payload, token);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addService = (service: string) => {
    if (service && !servicesOffered.includes(service)) {
      setServicesOffered([...servicesOffered, service]);
    }
  };

  const removeService = (service: string) => {
    setServicesOffered(servicesOffered.filter(s => s !== service));
  };

  const addTool = (tool: string) => {
    if (tool && !currentTools.includes(tool)) {
      setCurrentTools([...currentTools, tool]);
    }
  };

  const removeTool = (tool: string) => {
    setCurrentTools(currentTools.filter(t => t !== tool));
  };

  const serviceOptions = [
    "Photography", "Videography", "Drone Services", "Photo Editing",
    "Video Editing", "Album Design", "Live Streaming"
  ];

  const toolOptions = [
    "Lightroom", "Photoshop", "Premiere Pro", "Final Cut Pro",
    "Capture One", "DaVinci Resolve", "Canva", "InDesign"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="City, Country" />
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
                      <FormLabel>Role *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="photographer">Photographer</SelectItem>
                          <SelectItem value="videographer">Videographer</SelectItem>
                          <SelectItem value="owner">Studio Owner</SelectItem>
                          <SelectItem value="coordinator">Coordinator</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="years_in_business"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years in Business</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select years" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0-1">0-1 years</SelectItem>
                          <SelectItem value="2-5">2-5 years</SelectItem>
                          <SelectItem value="6-10">6-10 years</SelectItem>
                          <SelectItem value="10+">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Services Offered</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {servicesOffered.map((service) => (
                      <Badge
                        key={service}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeService(service)}
                      >
                        {service} ×
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={addService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceOptions.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Current Tools</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {currentTools.map((tool) => (
                      <Badge
                        key={tool}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => removeTool(tool)}
                      >
                        {tool} ×
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={addTool}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add a tool" />
                    </SelectTrigger>
                    <SelectContent>
                      {toolOptions.map((tool) => (
                        <SelectItem key={tool} value={tool}>
                          {tool}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};