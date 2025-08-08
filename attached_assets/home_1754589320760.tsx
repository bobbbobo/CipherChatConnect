import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  GraduationCap, 
  MessageCircle, 
  Settings, 
  Lock,
  LogOut
} from 'lucide-react';
import RSAKeyGenerator from '@/components/RSAKeyGenerator';
import RSAEncryption from '@/components/RSAEncryption';
import EducationalMode from '@/components/EducationalMode';
import SecureChat from '@/components/SecureChat';
import SettingsModal from '@/components/SettingsModal';
import { useAuth } from '@/hooks/useAuth';
import { RSAKeyPair } from '@/lib/rsa';

export default function Home() {
  const { user } = useAuth();
  const [keyPair, setKeyPair] = useState<RSAKeyPair | null>(null);
  const [activeTab, setActiveTab] = useState('main');
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    const userData = user as any;
    return userData.firstName && userData.lastName 
      ? `${userData.firstName} ${userData.lastName}`
      : userData.username || userData.email || 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Lock className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                RSA Cryptosystem
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User Profile */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={(user as any).profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(user as any).username}`} 
                      alt={getUserDisplayName()}
                    />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {getUserDisplayName()}
                    </span>
                  </div>
                </div>
              ) : null}
              
              {/* Settings Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                data-testid="button-settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
              
              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="main" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">RSA Tools</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Educational Mode</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Secure Chat</span>
            </TabsTrigger>
          </TabsList>

          {/* Main RSA Tools Tab */}
          <TabsContent value="main" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <RSAKeyGenerator onKeysGenerated={setKeyPair} />
              <RSAEncryption keyPair={keyPair} />
            </div>
            
            {/* Key Status Indicator */}
            {keyPair && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-600">
                        <Lock className="h-3 w-3 mr-1" />
                        Keys Active
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Public Key: ({keyPair.publicKey.e}, {keyPair.publicKey.n})
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setKeyPair(null)}
                      data-testid="button-clear-keys"
                    >
                      Clear Keys
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Educational Mode Tab */}
          <TabsContent value="education">
            <EducationalMode />
          </TabsContent>

          {/* Secure Chat Tab */}
          <TabsContent value="chat">
            <SecureChat keyPair={keyPair} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Made with ❤️ by <span className="font-medium text-primary">Shane</span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
