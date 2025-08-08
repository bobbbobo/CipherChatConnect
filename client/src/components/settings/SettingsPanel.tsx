import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/ui/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { User, Shield, MessageCircle, Palette, Save, Settings } from "lucide-react";

export function SettingsPanel() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  // Account settings state
  const [displayName, setDisplayName] = useState(user?.firstName || user?.username || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [timezone, setTimezone] = useState("UTC-05:00");
  
  // Encryption settings state
  const [defaultMode, setDefaultMode] = useState<'educational' | 'production'>('educational');
  const [showMathSteps, setShowMathSteps] = useState(true);
  const [autoEncrypt, setAutoEncrypt] = useState(true);
  const [autoSaveKeys, setAutoSaveKeys] = useState(false);
  
  // Chat settings state
  const [showTypingIndicators, setShowTypingIndicators] = useState(true);
  const [messageAnimations, setMessageAnimations] = useState(true);
  const [selfDestructMessages, setSelfDestructMessages] = useState(false);
  const [encryptedFileSharing, setEncryptedFileSharing] = useState(true);

  const handleSaveSettings = async () => {
    try {
      // Save settings to backend or local storage
      localStorage.setItem('cipherChat-settings', JSON.stringify({
        defaultMode,
        showMathSteps,
        autoEncrypt,
        autoSaveKeys,
        showTypingIndicators,
        messageAnimations,
        selfDestructMessages,
        encryptedFileSharing,
      }));
      
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    // Load settings from storage on mount
    try {
      const savedSettings = localStorage.getItem('cipherChat-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setDefaultMode(settings.defaultMode || 'educational');
        setShowMathSteps(settings.showMathSteps ?? true);
        setAutoEncrypt(settings.autoEncrypt ?? true);
        setAutoSaveKeys(settings.autoSaveKeys ?? false);
        setShowTypingIndicators(settings.showTypingIndicators ?? true);
        setMessageAnimations(settings.messageAnimations ?? true);
        setSelfDestructMessages(settings.selfDestructMessages ?? false);
        setEncryptedFileSharing(settings.encryptedFileSharing ?? true);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">Settings</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Customize your CipherChat experience and configure encryption preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 text-primary mr-3" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label htmlFor="timezone">Time Zone</Label>
                <select 
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="UTC-05:00">UTC-05:00 (Eastern Time)</option>
                  <option value="UTC-08:00">UTC-08:00 (Pacific Time)</option>
                  <option value="UTC+00:00">UTC+00:00 (GMT)</option>
                  <option value="UTC+01:00">UTC+01:00 (CET)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Encryption Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 text-secondary mr-3" />
              Encryption Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Default Encryption Mode */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Default Encryption Mode</Label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative">
                  <input 
                    type="radio" 
                    name="defaultMode" 
                    value="educational" 
                    checked={defaultMode === 'educational'}
                    onChange={(e) => setDefaultMode(e.target.value as 'educational')}
                    className="sr-only" 
                  />
                  <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    defaultMode === 'educational' ? 'border-primary bg-primary/10' : 'border-border hover:border-border/80'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">Educational Mode</span>
                      <Settings className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Small primes, visible mathematics</p>
                  </div>
                </label>
                <label className="relative">
                  <input 
                    type="radio" 
                    name="defaultMode" 
                    value="production" 
                    checked={defaultMode === 'production'}
                    onChange={(e) => setDefaultMode(e.target.value as 'production')}
                    className="sr-only" 
                  />
                  <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    defaultMode === 'production' ? 'border-primary bg-primary/10' : 'border-border hover:border-border/80'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">Production Mode</span>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Large primes, maximum security</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Settings Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Show Mathematical Steps</h4>
                  <p className="text-sm text-muted-foreground">Display step-by-step encryption/decryption process</p>
                </div>
                <Switch checked={showMathSteps} onCheckedChange={setShowMathSteps} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Auto-Encrypt Messages</h4>
                  <p className="text-sm text-muted-foreground">Automatically encrypt all outgoing messages</p>
                </div>
                <Switch checked={autoEncrypt} onCheckedChange={setAutoEncrypt} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Auto-Save Generated Keys</h4>
                  <p className="text-sm text-muted-foreground">Automatically save key pairs to your account</p>
                </div>
                <Switch checked={autoSaveKeys} onCheckedChange={setAutoSaveKeys} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 text-yellow-500 mr-3" />
              Chat Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Show Typing Indicators</h4>
                  <p className="text-sm text-muted-foreground">Let others see when you're typing</p>
                </div>
                <Switch checked={showTypingIndicators} onCheckedChange={setShowTypingIndicators} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Message Animations</h4>
                  <p className="text-sm text-muted-foreground">Enable smooth message animations</p>
                </div>
                <Switch checked={messageAnimations} onCheckedChange={setMessageAnimations} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Self-Destructing Messages</h4>
                  <p className="text-sm text-muted-foreground">Messages auto-delete after specified time</p>
                </div>
                <Switch checked={selfDestructMessages} onCheckedChange={setSelfDestructMessages} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Encrypted File Sharing</h4>
                  <p className="text-sm text-muted-foreground">Allow sharing encrypted files in chat</p>
                </div>
                <Switch checked={encryptedFileSharing} onCheckedChange={setEncryptedFileSharing} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 text-purple-500 mr-3" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Theme</Label>
              <div className="grid grid-cols-3 gap-4">
                <label className="relative">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="dark" 
                    checked={theme === 'dark'}
                    onChange={() => setTheme('dark')}
                    className="sr-only" 
                  />
                  <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    theme === 'dark' ? 'border-primary' : 'border-border hover:border-border/80'
                  }`}>
                    <div className="w-full h-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded mb-2"></div>
                    <span className="text-sm font-medium text-foreground">Dark</span>
                  </div>
                </label>
                <label className="relative">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="light" 
                    checked={theme === 'light'}
                    onChange={() => setTheme('light')}
                    className="sr-only" 
                  />
                  <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    theme === 'light' ? 'border-primary' : 'border-border hover:border-border/80'
                  }`}>
                    <div className="w-full h-12 bg-gradient-to-r from-gray-100 to-white rounded mb-2 border"></div>
                    <span className="text-sm font-medium text-foreground">Light</span>
                  </div>
                </label>
                <label className="relative">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="system" 
                    checked={theme === 'system'}
                    onChange={() => setTheme('system')}
                    className="sr-only" 
                  />
                  <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    theme === 'system' ? 'border-primary' : 'border-border hover:border-border/80'
                  }`}>
                    <div className="w-full h-12 bg-gradient-to-r from-gray-900 via-gray-100 to-white rounded mb-2"></div>
                    <span className="text-sm font-medium text-foreground">Auto</span>
                  </div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} className="px-8">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
