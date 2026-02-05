import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth, type User } from "@/hooks/useAuth";
import { Settings as SettingsIcon, Globe, Clock, Palette } from "lucide-react";

interface Profile {
  id: string;
}

interface PreferencesSettingsProps {
  user: User | null;
  profile: Profile | null;
}

interface UserPreferences {
  theme: string;
  language: string;
  timezone: string;
}

export const PreferencesSettings = ({ user, profile }: PreferencesSettingsProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "system",
    language: "en",
    timezone: "UTC",
  });

  const { token } = useAuth();

  useEffect(() => {
    if (token) fetchPreferences();
  }, [token]);

  const fetchPreferences = async () => {
    if (!token) return;

    try {
      const data = await api.get("/preferences/", token);

      // API returns a list, take the first one or default
      if (data && data.length > 0) {
        const pref = data[0];
        setPreferences({
          theme: pref.theme || "system",
          language: pref.language || "en",
          timezone: pref.timezone || "UTC",
        });
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
        description: "Your preferences have been saved.",
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
      // Revert the change (complex without prev state, skipping for now)
    } finally {
      setIsLoading(false);
    }
  };

  const timezones = [
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Central European Time (CET)" },
    { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
    { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
  ];

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "it", label: "Italiano" },
    { value: "pt", label: "Português" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Theme</Label>
            <Select
              value={preferences.theme}
              onValueChange={(value) => updatePreferences({ theme: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Choose how the interface looks. System will use your device's setting.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language & Region
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Language</Label>
            <Select
              value={preferences.language}
              onValueChange={(value) => updatePreferences({ language: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Timezone</Label>
            <Select
              value={preferences.timezone}
              onValueChange={(value) => updatePreferences({ timezone: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Calendar Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Start of Week</Label>
            <Select defaultValue="monday">
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select start of week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sunday">Sunday</SelectItem>
                <SelectItem value="monday">Monday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Time Format</Label>
            <Select defaultValue="24">
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select time format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12-hour (AM/PM)</SelectItem>
                <SelectItem value="24">24-hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Date Format</Label>
            <Select defaultValue="mm/dd/yyyy">
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            General Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-save drafts</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save your work as you type
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show project progress</Label>
              <p className="text-sm text-muted-foreground">
                Display progress bars on project cards
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Compact view</Label>
              <p className="text-sm text-muted-foreground">
                Use a more compact layout to fit more information
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};