import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Settings, Palette, Shield, MessageSquare } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AppSettings {
  theme: 'light' | 'dark';
  fileEncryption: boolean;
  largeKeySupport: boolean;
  keyExportImport: boolean;
  showEncryptionSteps: boolean;
  desktopNotifications: boolean;
  soundNotifications: boolean;
}

const defaultSettings: AppSettings = {
  theme: 'light',
  fileEncryption: false,
  largeKeySupport: false,
  keyExportImport: false,
  showEncryptionSteps: true,
  desktopNotifications: false,
  soundNotifications: true,
};

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('rsa-app-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }

    // Apply theme on load
    const currentTheme = savedSettings ? JSON.parse(savedSettings).theme : 'light';
    applyTheme(currentTheme || 'light');
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('rsa-app-settings', JSON.stringify(settings));
  }, [settings]);

  const applyTheme = (theme: 'light' | 'dark') => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSettingChange = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // Apply theme immediately
      if (key === 'theme') {
        applyTheme(value as 'light' | 'dark');
      }
      
      return newSettings;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    applyTheme('light');
    localStorage.removeItem('rsa-app-settings');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Theme Settings */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-4 w-4" />
              <h3 className="text-sm font-medium">Theme</h3>
            </div>
            <RadioGroup
              value={settings.theme}
              onValueChange={(value: 'light' | 'dark') => handleSettingChange('theme', value)}
              data-testid="radio-theme"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">Dark</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Separator />
          
          {/* Advanced Features */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4" />
              <h3 className="text-sm font-medium">Advanced Features</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="fileEncryption" className="text-sm">
                  File Encryption/Decryption
                </Label>
                <Switch
                  id="fileEncryption"
                  checked={settings.fileEncryption}
                  onCheckedChange={(checked) => handleSettingChange('fileEncryption', checked)}
                  data-testid="switch-file-encryption"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="largeKeySupport" className="text-sm">
                  Large Key Support (1024+ bit)
                </Label>
                <Switch
                  id="largeKeySupport"
                  checked={settings.largeKeySupport}
                  onCheckedChange={(checked) => handleSettingChange('largeKeySupport', checked)}
                  data-testid="switch-large-keys"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="keyExportImport" className="text-sm">
                  Key Export/Import
                </Label>
                <Switch
                  id="keyExportImport"
                  checked={settings.keyExportImport}
                  onCheckedChange={(checked) => handleSettingChange('keyExportImport', checked)}
                  data-testid="switch-key-export"
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Chat Settings */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4" />
              <h3 className="text-sm font-medium">Chat Settings</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="showEncryptionSteps" className="text-sm">
                  Show Encryption Steps in Chat
                </Label>
                <Switch
                  id="showEncryptionSteps"
                  checked={settings.showEncryptionSteps}
                  onCheckedChange={(checked) => handleSettingChange('showEncryptionSteps', checked)}
                  data-testid="switch-show-encryption"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="desktopNotifications" className="text-sm">
                  Desktop Notifications
                </Label>
                <Switch
                  id="desktopNotifications"
                  checked={settings.desktopNotifications}
                  onCheckedChange={(checked) => handleSettingChange('desktopNotifications', checked)}
                  data-testid="switch-desktop-notifications"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="soundNotifications" className="text-sm">
                  Sound Notifications
                </Label>
                <Switch
                  id="soundNotifications"
                  checked={settings.soundNotifications}
                  onCheckedChange={(checked) => handleSettingChange('soundNotifications', checked)}
                  data-testid="switch-sound-notifications"
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Reset Settings */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={resetSettings}
              data-testid="button-reset-settings"
            >
              Reset to Defaults
            </Button>
            <Button onClick={onClose} data-testid="button-save-settings">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
