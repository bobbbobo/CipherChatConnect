import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Key, 
  MessageCircle, 
  GraduationCap, 
  Shield, 
  Users,
  CheckCircle,
  Star
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const features = [
    {
      icon: Key,
      title: "RSA Key Generation",
      description: "Generate RSA key pairs from your own prime numbers with detailed mathematical explanations."
    },
    {
      icon: Lock,
      title: "Message Encryption",
      description: "Encrypt and decrypt messages using RSA algorithm with step-by-step process visualization."
    },
    {
      icon: GraduationCap,
      title: "Educational Mode",
      description: "Learn RSA cryptography through interactive tutorials, prime checkers, and modular calculators."
    },
    {
      icon: MessageCircle,
      title: "Secure Chat",
      description: "Real-time encrypted messaging using your generated RSA keys for authentic secure communication."
    },
    {
      icon: Shield,
      title: "Advanced Features",
      description: "File encryption, key export/import, and support for larger key sizes in settings."
    },
    {
      icon: Users,
      title: "Multi-User Support",
      description: "Unique usernames, profile pictures, and collaborative learning environment."
    }
  ];

  const highlights = [
    "Hand-computable RSA for educational purposes",
    "Real-time encrypted chat system", 
    "Step-by-step mathematical breakdowns",
    "Mobile-responsive modern interface",
    "Google OAuth and email authentication",
    "Advanced cryptography learning tools"
  ];

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
              <Button
                onClick={() => setShowAuthModal(true)}
                data-testid="button-login-header"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              Educational Cryptography Tool
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Learn RSA Cryptography
              <span className="text-primary block">Hands-On</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
              A comprehensive educational platform for learning RSA encryption with real-time secure chat, 
              interactive tutorials, and step-by-step mathematical breakdowns you can do by hand.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => setShowAuthModal(true)}
                className="text-lg px-8 py-3"
                data-testid="button-get-started-hero"
              >
                <Lock className="h-5 w-5 mr-2" />
                Start Learning RSA
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                className="text-lg px-8 py-3"
                data-testid="button-login-google"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Everything You Need to Master RSA
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From basic concepts to advanced implementations, our platform provides comprehensive tools for learning cryptography.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Why Choose Our RSA Platform?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Built specifically for education with a focus on understanding the mathematical foundations 
                of RSA cryptography while providing modern tools for practical learning.
              </p>
              
              <div className="space-y-4">
                {highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:pl-8">
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="p-8">
                  <div className="text-center">
                    <Star className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Ready to Get Started?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Join students and educators already learning RSA cryptography through our interactive platform.
                    </p>
                    <Button
                      size="lg"
                      onClick={() => setShowAuthModal(true)}
                      className="w-full"
                      data-testid="button-join-now"
                    >
                      <Lock className="h-5 w-5 mr-2" />
                      Join Now - It's Free
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-primary" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">RSA Cryptosystem</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Made with ❤️ by <span className="font-medium text-primary">Shane</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          // The auth components handle the redirect
        }}
      />
    </div>
  );
}
