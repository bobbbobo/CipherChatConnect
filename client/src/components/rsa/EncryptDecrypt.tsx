import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { EducationalRSA, ProductionRSA } from "@/lib/rsa";
import { MathVisualizer } from "./MathVisualizer";
import { Lock, Unlock, Calculator } from "lucide-react";

export function EncryptDecrypt() {
  const { toast } = useToast();
  const [mode, setMode] = useState<'educational' | 'production'>('educational');
  
  // Encryption state
  const [plaintext, setPlaintext] = useState("");
  const [publicKeyN, setPublicKeyN] = useState("143");
  const [publicKeyE, setPublicKeyE] = useState("7");
  const [productionPublicKey, setProductionPublicKey] = useState("");
  const [encryptionResult, setEncryptionResult] = useState<any>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  
  // Decryption state
  const [ciphertext, setCiphertext] = useState("");
  const [privateKeyN, setPrivateKeyN] = useState("143");
  const [privateKeyD, setPrivateKeyD] = useState("103");
  const [productionPrivateKey, setProductionPrivateKey] = useState("");
  const [decryptionResult, setDecryptionResult] = useState<any>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const handleEncrypt = async () => {
    if (!plaintext.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message to encrypt",
        variant: "destructive",
      });
      return;
    }

    setIsEncrypting(true);
    try {
      if (mode === 'educational') {
        const result = EducationalRSA.encrypt(plaintext, {
          n: parseInt(publicKeyN),
          e: parseInt(publicKeyE)
        });
        setEncryptionResult(result);
      } else {
        // Production mode encryption would use Web Crypto API
        toast({
          title: "Production Mode",
          description: "Production encryption requires key import functionality",
        });
      }
      
      toast({
        title: "Encryption Complete",
        description: "Message has been encrypted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Encryption Failed",
        description: error.message || "Failed to encrypt message",
        variant: "destructive",
      });
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDecrypt = async () => {
    if (!ciphertext.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message to decrypt",
        variant: "destructive",
      });
      return;
    }

    setIsDecrypting(true);
    try {
      if (mode === 'educational') {
        // Parse ciphertext as array of numbers
        const numbers = ciphertext.split(',').map(n => parseInt(n.trim()));
        const result = EducationalRSA.decrypt(numbers, {
          n: parseInt(privateKeyN),
          d: parseInt(privateKeyD)
        });
        setDecryptionResult(result);
      } else {
        // Production mode decryption would use Web Crypto API
        toast({
          title: "Production Mode",
          description: "Production decryption requires key import functionality",
        });
      }
      
      toast({
        title: "Decryption Complete",
        description: "Message has been decrypted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Decryption Failed",
        description: error.message || "Failed to decrypt message",
        variant: "destructive",
      });
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">Encrypt & Decrypt Messages</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Test RSA encryption and decryption with your own messages. 
          See the mathematical process in action.
        </p>
      </div>

      {/* Mode Selection */}
      <div className="flex justify-center">
        <Tabs value={mode} onValueChange={(value: any) => setMode(value)} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="educational">Educational</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Encryption Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 text-primary mr-3" />
              Encrypt Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="plaintext">Plaintext Message</Label>
              <Textarea
                id="plaintext"
                placeholder="Enter your message to encrypt..."
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
                className="resize-none"
                rows={4}
              />
            </div>

            {mode === 'educational' ? (
              <div>
                <Label>Public Key (n, e)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="n = 143"
                    value={publicKeyN}
                    onChange={(e) => setPublicKeyN(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Input
                    placeholder="e = 7"
                    value={publicKeyE}
                    onChange={(e) => setPublicKeyE(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="prodPublicKey">Public Key (PEM Format)</Label>
                <Textarea
                  id="prodPublicKey"
                  placeholder="-----BEGIN PUBLIC KEY-----..."
                  value={productionPublicKey}
                  onChange={(e) => setProductionPublicKey(e.target.value)}
                  className="font-mono text-sm"
                  rows={6}
                />
              </div>
            )}

            <Button 
              onClick={handleEncrypt}
              disabled={isEncrypting}
              className="w-full"
            >
              <Lock className="h-4 w-4 mr-2" />
              {isEncrypting ? 'Encrypting...' : 'Encrypt Message'}
            </Button>

            <div>
              <Label>Encrypted Result</Label>
              <div className="bg-muted border border-border rounded-lg p-3 min-h-[100px]">
                <div className="font-mono text-sm text-green-600 dark:text-green-400">
                  {encryptionResult ? (
                    mode === 'educational' ? 
                      `[${encryptionResult.encrypted.join(', ')}]` :
                      'Encrypted message would appear here...'
                  ) : (
                    'Encrypted message will appear here...'
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Decryption Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Unlock className="h-5 w-5 text-secondary mr-3" />
              Decrypt Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ciphertext">Encrypted Message</Label>
              <Textarea
                id="ciphertext"
                placeholder={mode === 'educational' ? 
                  "Enter encrypted numbers (comma-separated)..." :
                  "Enter encrypted message to decrypt..."
                }
                value={ciphertext}
                onChange={(e) => setCiphertext(e.target.value)}
                className="font-mono text-sm resize-none"
                rows={4}
              />
            </div>

            {mode === 'educational' ? (
              <div>
                <Label>Private Key (n, d)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="n = 143"
                    value={privateKeyN}
                    onChange={(e) => setPrivateKeyN(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Input
                    placeholder="d = 103"
                    value={privateKeyD}
                    onChange={(e) => setPrivateKeyD(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="prodPrivateKey">Private Key (PEM Format)</Label>
                <Textarea
                  id="prodPrivateKey"
                  placeholder="-----BEGIN PRIVATE KEY-----..."
                  value={productionPrivateKey}
                  onChange={(e) => setProductionPrivateKey(e.target.value)}
                  className="font-mono text-sm"
                  rows={6}
                />
              </div>
            )}

            <Button 
              onClick={handleDecrypt}
              disabled={isDecrypting}
              className="w-full"
              variant="secondary"
            >
              <Unlock className="h-4 w-4 mr-2" />
              {isDecrypting ? 'Decrypting...' : 'Decrypt Message'}
            </Button>

            <div>
              <Label>Decrypted Result</Label>
              <div className="bg-muted border border-border rounded-lg p-3 min-h-[100px]">
                <div className="font-mono text-sm text-yellow-600 dark:text-yellow-400">
                  {decryptionResult ? 
                    decryptionResult.decrypted :
                    'Decrypted message will appear here...'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mathematical Steps Visualization */}
      {mode === 'educational' && (encryptionResult || decryptionResult) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 text-yellow-500 mr-3" />
              Encryption/Decryption Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Encryption Steps */}
              {encryptionResult && (
                <div>
                  <h4 className="text-lg font-medium text-foreground mb-4">Encryption Process</h4>
                  <div className="space-y-3 font-mono text-sm">
                    {encryptionResult.steps.map((step: any, index: number) => (
                      <div key={index} className="bg-muted rounded-lg p-3">
                        <div className="text-muted-foreground text-xs mb-1">
                          Character: '{step.char}' (ASCII: {step.ascii})
                        </div>
                        <div className="text-foreground">{step.calculation}</div>
                        <div className="text-green-600 dark:text-green-400 text-xs mt-1">
                          Result: {step.result}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Decryption Steps */}
              {decryptionResult && (
                <div>
                  <h4 className="text-lg font-medium text-foreground mb-4">Decryption Process</h4>
                  <div className="space-y-3 font-mono text-sm">
                    {decryptionResult.steps.map((step: any, index: number) => (
                      <div key={index} className="bg-muted rounded-lg p-3">
                        <div className="text-muted-foreground text-xs mb-1">
                          Encrypted: {step.encrypted}
                        </div>
                        <div className="text-foreground">{step.calculation}</div>
                        <div className="text-yellow-600 dark:text-yellow-400 text-xs mt-1">
                          ASCII: {step.ascii} → '{step.char}'
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
