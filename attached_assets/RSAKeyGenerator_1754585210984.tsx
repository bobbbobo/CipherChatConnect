import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Key } from 'lucide-react';
import { generateRSAKeyPair, getKeyGenerationSteps, RSAKeyPair, RSAMathSteps } from '@/lib/rsa';
import { useToast } from '@/hooks/use-toast';

interface RSAKeyGeneratorProps {
  onKeysGenerated?: (keyPair: RSAKeyPair) => void;
}

export default function RSAKeyGenerator({ onKeysGenerated }: RSAKeyGeneratorProps) {
  const [primeP, setPrimeP] = useState('');
  const [primeQ, setPrimeQ] = useState('');
  const [keyPair, setKeyPair] = useState<RSAKeyPair | null>(null);
  const [mathSteps, setMathSteps] = useState<RSAMathSteps | null>(null);
  const [showMath, setShowMath] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateKeys = async () => {
    try {
      setLoading(true);
      const p = parseInt(primeP);
      const q = parseInt(primeQ);

      if (!p || !q) {
        throw new Error('Please enter both prime numbers');
      }

      const keys = generateRSAKeyPair(p, q);
      if (!keys) {
        throw new Error('Failed to generate keys');
      }
      const steps = getKeyGenerationSteps(p, q, keys);
      
      setKeyPair(keys);
      setMathSteps(steps);
      
      if (onKeysGenerated) {
        onKeysGenerated(keys);
      }

      toast({
        title: 'Keys Generated Successfully',
        description: 'RSA key pair has been generated from your prime numbers.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate keys';
      toast({
        title: 'Key Generation Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Key Generation
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMath(!showMath)}
            data-testid="toggle-key-math"
          >
            {showMath ? (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                Hide Math
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                Show Math
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primeP">Prime p:</Label>
            <Input
              id="primeP"
              type="number"
              placeholder="e.g., 17"
              value={primeP}
              onChange={(e) => setPrimeP(e.target.value)}
              data-testid="input-prime-p"
            />
          </div>
          <div>
            <Label htmlFor="primeQ">Prime q:</Label>
            <Input
              id="primeQ"
              type="number"
              placeholder="e.g., 19"
              value={primeQ}
              onChange={(e) => setPrimeQ(e.target.value)}
              data-testid="input-prime-q"
            />
          </div>
        </div>
        
        <Button
          onClick={handleGenerateKeys}
          disabled={loading}
          className="w-full"
          data-testid="button-generate-keys"
        >
          <Key className="h-4 w-4 mr-2" />
          {loading ? 'Generating...' : 'Generate Keys'}
        </Button>
        
        {keyPair && (
          <div className="space-y-3 mt-6">
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <Label className="block text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                Public Key (e):
              </Label>
              <Input
                readOnly
                value={keyPair.publicKey.e}
                className="bg-green-50 dark:bg-green-950 border-0 text-green-900 dark:text-green-100 font-mono text-sm"
                data-testid="text-public-key"
              />
            </div>
            
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <Label className="block text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Private Key (d):
              </Label>
              <Input
                readOnly
                value={keyPair.privateKey.d}
                className="bg-red-50 dark:bg-red-950 border-0 text-red-900 dark:text-red-100 font-mono text-sm"
                data-testid="text-private-key"
              />
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <Label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                Modulus (n):
              </Label>
              <Input
                readOnly
                value={keyPair.publicKey.n}
                className="bg-blue-50 dark:bg-blue-950 border-0 text-blue-900 dark:text-blue-100 font-mono text-sm"
                data-testid="text-modulus"
              />
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <Label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                Totient (φ):
              </Label>
              <Input
                readOnly
                value={keyPair.phi}
                className="bg-gray-50 dark:bg-gray-800 border-0 text-gray-900 dark:text-gray-100 font-mono text-sm"
                data-testid="text-totient"
              />
            </div>
          </div>
        )}
        
        {showMath && mathSteps && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg" data-testid="math-steps-display">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Key Generation Process:</h3>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 font-mono">
              <div>1. n = p × q = {mathSteps.nCalculation}</div>
              <div>2. φ(n) = (p-1) × (q-1) = {mathSteps.phiCalculation}</div>
              <div>3. e = {mathSteps.eCalculation}</div>
              <div>4. d = e⁻¹ mod φ(n) = {mathSteps.dCalculation}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
