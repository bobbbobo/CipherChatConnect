import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Book, Key, Lock, Unlock, Shield, Globe, PlayCircle, ArrowRight, CheckCircle, Clock, Play } from "lucide-react";

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: 'completed' | 'in-progress' | 'not-started';
  icon: React.ComponentType<any>;
  color: string;
}

const learningModules: LearningModule[] = [
  {
    id: 'basics',
    title: 'Basic Concepts',
    description: 'Learn about prime numbers, modular arithmetic, and the foundation of public key cryptography.',
    duration: '15 min read',
    status: 'completed',
    icon: Book,
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'keygen',
    title: 'Key Generation',
    description: 'Understand how RSA key pairs are generated, including the selection of primes and calculation of exponents.',
    duration: '20 min read',
    status: 'completed',
    icon: Key,
    color: 'from-green-500 to-teal-600'
  },
  {
    id: 'encryption',
    title: 'Encryption Process',
    description: 'Step through the encryption algorithm and see how plaintext is transformed into ciphertext.',
    duration: '18 min read',
    status: 'completed',
    icon: Lock,
    color: 'from-yellow-500 to-orange-600'
  },
  {
    id: 'decryption',
    title: 'Decryption Process',
    description: 'Learn how ciphertext is decrypted back to plaintext using the private key.',
    duration: '16 min read',
    status: 'in-progress',
    icon: Unlock,
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'security',
    title: 'Security Concepts',
    description: 'Explore the security assumptions, potential attacks, and best practices for RSA implementation.',
    duration: '25 min read',
    status: 'not-started',
    icon: Shield,
    color: 'from-red-500 to-pink-600'
  },
  {
    id: 'applications',
    title: 'Real-World Uses',
    description: 'Discover how RSA is used in HTTPS, email encryption, digital signatures, and more.',
    duration: '22 min read',
    status: 'not-started',
    icon: Globe,
    color: 'from-teal-500 to-blue-600'
  }
];

interface VisualizationStep {
  id: number;
  title: string;
  description: string;
  isActive: boolean;
}

const visualizationSteps: VisualizationStep[] = [
  { id: 1, title: 'Choose Primes', description: 'Select two distinct prime numbers p and q', isActive: true },
  { id: 2, title: 'Calculate n', description: 'Multiply p and q to get the modulus', isActive: false },
  { id: 3, title: 'Calculate φ(n)', description: 'Calculate Euler\'s totient function', isActive: false },
  { id: 4, title: 'Choose e', description: 'Select the public exponent', isActive: false },
  { id: 5, title: 'Calculate d', description: 'Find the private exponent', isActive: false },
  { id: 6, title: 'Encrypt Message', description: 'Apply the encryption formula', isActive: false }
];

export function EducationHub() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const completedModules = learningModules.filter(m => m.status === 'completed').length;
  const inProgressModules = learningModules.filter(m => m.status === 'in-progress').length;
  const remainingModules = learningModules.filter(m => m.status === 'not-started').length;

  const getStatusIcon = (status: LearningModule['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Play className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: LearningModule['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500';
      case 'in-progress':
        return 'border-yellow-500';
      default:
        return 'border-border hover:border-muted-foreground';
    }
  };

  const nextStep = () => {
    if (currentStep < visualizationSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">RSA Cryptography Education</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Learn how RSA encryption works through interactive visualizations and step-by-step explanations.
          Master the mathematical concepts behind one of the most important cryptographic algorithms.
        </p>
      </div>

      {/* Learning Modules */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learningModules.map((module) => {
          const IconComponent = module.icon;
          return (
            <Card 
              key={module.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${getStatusColor(module.status)}`}
              onClick={() => setSelectedModule(module.id)}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-lg flex items-center justify-center mb-4`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{module.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {module.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {module.duration}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(module.status)}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Interactive Visualizer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PlayCircle className="h-5 w-5 text-primary mr-3" />
            Interactive RSA Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Step Controls */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-foreground">Visualization Steps</h4>
              <div className="space-y-2">
                {visualizationSteps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentStep === step.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <span className="font-medium">{step.id}. {step.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Visualization Area */}
            <div className="lg:col-span-2">
              <div className="bg-muted rounded-lg p-6 min-h-[400px]">
                {/* Current Step Display */}
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-foreground mb-4">
                    Step {currentStep}: {visualizationSteps[currentStep - 1]?.title}
                  </h4>
                  <p className="text-muted-foreground mb-6">
                    {visualizationSteps[currentStep - 1]?.description}
                  </p>

                  {/* Step-specific content */}
                  {currentStep === 1 && (
                    <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl font-bold text-white">p</span>
                        </div>
                        <div className="text-foreground font-mono text-xl">11</div>
                        <div className="text-sm text-muted-foreground mt-1">Prime number</div>
                      </div>
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl font-bold text-white">q</span>
                        </div>
                        <div className="text-foreground font-mono text-xl">13</div>
                        <div className="text-sm text-muted-foreground mt-1">Prime number</div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="text-center">
                      <div className="text-2xl font-mono text-foreground mb-4">
                        n = p × q = 11 × 13 = 143
                      </div>
                      <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl font-bold text-white">143</span>
                      </div>
                    </div>
                  )}

                  {/* Add more step visualizations as needed */}
                  
                  {/* Next Step Button */}
                  <Button 
                    onClick={nextStep}
                    disabled={currentStep >= visualizationSteps.length}
                    className="mt-8"
                  >
                    {currentStep >= visualizationSteps.length ? 'Complete' : 'Next Step'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracker */}
      <Card>
        <CardHeader>
          <CardTitle>Your Learning Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-medium text-foreground mb-1">Completed</h4>
              <p className="text-2xl font-bold text-green-600">{completedModules}</p>
              <p className="text-sm text-muted-foreground">modules</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-medium text-foreground mb-1">In Progress</h4>
              <p className="text-2xl font-bold text-yellow-600">{inProgressModules}</p>
              <p className="text-sm text-muted-foreground">module</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <Play className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="font-medium text-foreground mb-1">Remaining</h4>
              <p className="text-2xl font-bold text-muted-foreground">{remainingModules}</p>
              <p className="text-sm text-muted-foreground">modules</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round((completedModules + inProgressModules * 0.5) / learningModules.length * 100)}%
              </span>
            </div>
            <Progress 
              value={(completedModules + inProgressModules * 0.5) / learningModules.length * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
