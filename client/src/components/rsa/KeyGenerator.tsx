import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { EducationalRSA, ProductionRSA, generateQRCode } from "@/lib/rsa";
import { MathVisualizer } from "./MathVisualizer";
import { Key, Shield, Copy, Download, QrCode, Cog } from "lucide-react";

export function KeyGenerator() {
  const { toast } = useToast();
  const [mode, setMode] = useState<'educational' | 'production'>('educational');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSteps, setShowSteps] = useState(true);
  const [saveToAccount, setSaveToAccount] = useState(false);
  
  // Educational mode state
  const [p, setP] = useState(11);
  const [q, setQ] = useState(13);
  const [educationalKeys, setEducationalKeys] = useState<any>(null);
  
  // Production mode state
  const [keySize, setKeySize] = useState(2048);
  const [productionKeys, setProductionKeys] = useState<any>(null);

  const generateEducationalKeys = async () => {
    setIsGenerating(true);
    try {
      const result = EducationalRSA.generateKeyPair(p, q);
      setEducationalKeys(result);
      
      toast({
        title: "Keys Generated Successfully",
        description: "Educational RSA key pair has been generated with visible mathematical steps.",
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate keys",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateProductionKeys = async () => {
    setIsGenerating(true);
    try {
      const result = await ProductionRSA.generateKeyPair(keySize);
      setProductionKeys(result);
      
      toast({
        title: "Keys Generated Successfully",
        description: "Production RSA key pair has been generated securely.",
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate keys",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied",
        description: `${type} copied to clipboard`,
      });
    });
  };

  const downloadKey = (key: string, filename: string) => {
    const blob = new Blob([key], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const showQRCode = (key: string, type: string) => {
    const qrCode = generateQRCode(key);
    // In a real implementation, you'd show this in a modal
    toast({
      title: "QR Code Generated",
      description: `QR code for ${type} is ready`,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">RSA Key Generator</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Generate secure RSA key pairs for encryption. Choose between educational mode with visible mathematics 
          or production mode with secure key generation.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Key Generation Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 text-primary mr-3" />
              Generate New Key Pair
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Selection */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Encryption Mode</Label>
              <Tabs value={mode} onValueChange={(value: any) => setMode(value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="educational">Educational</TabsTrigger>
                  <TabsTrigger value="production">Production</TabsTrigger>
                </TabsList>
                
                <TabsContent value="educational" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="p">Prime p</Label>
                      <Input
                        id="p"
                        type="number"
                        value={p}
                        onChange={(e) => setP(parseInt(e.target.value) || 11)}
                        placeholder="11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="q">Prime q</Label>
                      <Input
                        id="q"
                        type="number"
                        value={q}
                        onChange={(e) => setQ(parseInt(e.target.value) || 13)}
                        placeholder="13"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="production" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="keySize">Key Size</Label>
                    <select 
                      id="keySize"
                      value={keySize}
                      onChange={(e) => setKeySize(parseInt(e.target.value))}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value={1024}>1024 bits</option>
                      <option value={2048}>2048 bits</option>
                      <option value={3072}>3072 bits</option>
                      <option value={4096}>4096 bits</option>
                    </select>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={showSteps}
                  onChange={(e) => setShowSteps(e.target.checked)}
                  className="rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-0" 
                />
                <span className="ml-2 text-sm">Show mathematical steps</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={saveToAccount}
                  onChange={(e) => setSaveToAccount(e.target.checked)}
                  className="rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-0" 
                />
                <span className="ml-2 text-sm">Save key pair to account</span>
              </label>
            </div>

            {/* Generate Button */}
            <Button 
              onClick={mode === 'educational' ? generateEducationalKeys : generateProductionKeys}
              disabled={isGenerating}
              className="w-full"
            >
              <Cog className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating...' : 'Generate Key Pair'}
            </Button>
          </CardContent>
        </Card>

        {/* Mathematical Steps Panel */}
        {mode === 'educational' && showSteps && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 text-secondary mr-3" />
                Mathematical Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              {educationalKeys ? (
                <MathVisualizer steps={educationalKeys.steps} />
              ) : (
                <div className="space-y-4 font-mono text-sm">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-muted-foreground mb-2">Step 1: Choose prime numbers</div>
                    <div className="text-foreground">p = {p}, q = {q}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-muted-foreground mb-2">Step 2: Calculate n</div>
                    <div className="text-foreground">n = p × q = {p} × {q} = {p * q}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-muted-foreground mb-2">Step 3: Calculate φ(n)</div>
                    <div className="text-foreground">φ(n) = (p-1) × (q-1) = {p-1} × {q-1} = {(p-1) * (q-1)}</div>
                  </div>
                  <div className="text-center text-muted-foreground">
                    Generate keys to see complete steps
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Generated Keys Display */}
      {(educationalKeys || productionKeys) && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Public Key */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 text-green-500 mr-3" />
                Public Key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-2">
                  {mode === 'educational' ? 'RSA Public Key (n, e)' : 'RSA Public Key (PEM Format)'}
                </div>
                <div className="font-mono text-sm text-foreground break-all">
                  {mode === 'educational' && educationalKeys ? (
                    <>
                      n = {educationalKeys.publicKey.n}<br />
                      e = {educationalKeys.publicKey.e}
                    </>
                  ) : mode === 'production' && productionKeys ? (
                    productionKeys.publicKeyPem
                  ) : (
                    'No key generated'
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    const key = mode === 'educational' && educationalKeys 
                      ? `n=${educationalKeys.publicKey.n}, e=${educationalKeys.publicKey.e}`
                      : productionKeys?.publicKeyPem || '';
                    copyToClipboard(key, 'Public key');
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    const key = mode === 'educational' && educationalKeys 
                      ? `n=${educationalKeys.publicKey.n}, e=${educationalKeys.publicKey.e}`
                      : productionKeys?.publicKeyPem || '';
                    showQRCode(key, 'public key');
                  }}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Private Key */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 text-red-500 mr-3" />
                Private Key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-2">
                  {mode === 'educational' ? 'RSA Private Key (n, d)' : 'RSA Private Key (PEM Format)'}
                </div>
                <div className="font-mono text-sm text-foreground break-all">
                  {mode === 'educational' && educationalKeys ? (
                    <>
                      n = {educationalKeys.privateKey.n}<br />
                      d = {educationalKeys.privateKey.d}
                    </>
                  ) : mode === 'production' && productionKeys ? (
                    productionKeys.privateKeyPem
                  ) : (
                    'No key generated'
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    const key = mode === 'educational' && educationalKeys 
                      ? `n=${educationalKeys.privateKey.n}, d=${educationalKeys.privateKey.d}`
                      : productionKeys?.privateKeyPem || '';
                    copyToClipboard(key, 'Private key');
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    const key = mode === 'educational' && educationalKeys 
                      ? `n=${educationalKeys.privateKey.n}, d=${educationalKeys.privateKey.d}`
                      : productionKeys?.privateKeyPem || '';
                    downloadKey(key, `private_key_${Date.now()}.pem`);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
