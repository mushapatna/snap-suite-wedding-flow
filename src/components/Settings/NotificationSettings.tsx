import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth, type User } from "@/hooks/useAuth";
import { Bell, Mail, MessageCircle, Smartphone } from "lucide-react";

interface Profile {
  id: string;
}

interface NotificationSettingsProps {
  user: User | null;
  profile: Profile | null;
}

interface UserPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  whatsapp_notifications: boolean;
  project_reminders: boolean;
  task_reminders: boolean;
  event_reminders: boolean;
  weekly_summary: boolean;
}

export const NotificationSettings = ({ user, profile }: NotificationSettingsProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    email_notifications: true,
    push_notifications: true,
    whatsapp_notifications: false,
    project_reminders: true,
    task_reminders: true,
    event_reminders: true,
    weekly_summary: true,
  });

  const { token } = useAuth();

  useEffect(() => {
    if (token) fetchPreferences();
  }, [token]);

  const fetchPreferences = async () => {
    if (!token) return;

    try {
      const data = await api.get("/preferences/", token);

      if (data && data.length > 0) {
        const pref = data[0];
        setPreferences({
          email_notifications: pref.email_notifications,
          push_notifications: pref.push_notifications,
          whatsapp_notifications: pref.whatsapp_notifications,
          project_reminders: pref.project_reminders,
          task_reminders: pref.task_reminders,
          event_reminders: pref.event_reminders,
          weekly_summary: pref.weekly_summary,
        });
        setPreferenceId(pref.id);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    }
  };

  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!token) return;

    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);

    setIsLoading(true);
    try {
      if (preferenceId) {
        await api.patch(`/preferences/${preferenceId}/`, newPreferences, token);
      } else {
        const res = await api.post("/preferences/", updatedPreferences, token);
        if (res && res.id) setPreferenceId(res.id);
      }

      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
      // Revert the change
      setPreferences(preferences);
    } finally {
      setIsLoading(false);
    }
  };

  const notificationChannels = [
    {
      key: "email_notifications" as keyof UserPreferences,
      title: "Email Notifications",
      description: "Receive notifications via email",
      icon: Mail,
    },
    {
      key: "push_notifications" as keyof UserPreferences,
      title: "Push Notifications",
      description: "Receive browser push notifications",
      icon: Smartphone,
    },
    {
      key: "whatsapp_notifications" as keyof UserPreferences,
      title: "WhatsApp Notifications",
      description: "Receive notifications via WhatsApp",
      icon: MessageCircle,
    },
  ];

  const notificationTypes = [
    {
      key: "project_reminders" as keyof UserPreferences,
      title: "Project Reminders",
      description: "Get reminded about upcoming project deadlines",
    },
    {
      key: "task_reminders" as keyof UserPreferences,
      title: "Task Reminders",
      description: "Get reminded about pending and overdue tasks",
    },
    {
      key: "event_reminders" as keyof UserPreferences,
      title: "Event Reminders",
      description: "Get reminded about upcoming events and shoots",
    },
    {
      key: "weekly_summary" as keyof UserPreferences,
      title: "Weekly Summary",
      description: "Receive a weekly summary of your projects and tasks",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose how you want to receive notifications.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationChannels.map((channel) => {
            const Icon = channel.icon;
            return (
              <div key={channel.key} className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor={channel.key} className="text-base font-medium">
                      {channel.title}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {channel.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={channel.key}
                  checked={preferences[channel.key] as boolean}
                  onCheckedChange={(checked) =>
                    updatePreferences({ [channel.key]: checked })
                  }
                  disabled={isLoading}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose what types of notifications you want to receive.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationTypes.map((type) => (
            <div key={type.key} className="flex items-center justify-between space-x-2">
              <div>
                <Label htmlFor={type.key} className="text-base font-medium">
                  {type.title}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {type.description}
                </p>
              </div>
              <Switch
                id={type.key}
                checked={preferences[type.key] as boolean}
                onCheckedChange={(checked) =>
                  updatePreferences({ [type.key]: checked })
                }
                disabled={isLoading}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Frequency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Task Reminder Frequency</Label>
            <Select defaultValue="daily">
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Event Reminder Timing</Label>
            <Select defaultValue="1day">
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select timing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1hour">1 hour before</SelectItem>
                <SelectItem value="1day">1 day before</SelectItem>
                <SelectItem value="3days">3 days before</SelectItem>
                <SelectItem value="1week">1 week before</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};