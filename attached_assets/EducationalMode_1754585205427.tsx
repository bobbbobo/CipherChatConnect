import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Calculator, Clock } from 'lucide-react';
import { isPrime, calculateModular, generatePrimes } from '@/lib/rsa';
import { useToast } from '@/hooks/use-toast';

export default function EducationalMode() {
  const [primeCheck, setPrimeCheck] = useState('');
  const [primeResult, setPrimeResult] = useState<string | null>(null);
  const [modBase, setModBase] = useState('');
  const [modExp, setModExp] = useState('');
  const [modMod, setModMod] = useState('');
  const [modResult, setModResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePrimeCheck = () => {
    const num = parseInt(primeCheck);
    
    if (!num || num < 1) {
      setPrimeResult('Please enter a valid positive number');
      return;
    }

    if (isPrime(num)) {
      setPrimeResult(`${num} is prime!`);
    } else {
      setPrimeResult(`${num} is not prime`);
    }
  };

  const handleModularCalculation = () => {
    const base = parseInt(modBase);
    const exp = parseInt(modExp);
    const mod = parseInt(modMod);

    if (!base || !exp || !mod) {
      setModResult('Please fill all fields');
      return;
    }

    if (mod <= 0) {
      setModResult('Modulus must be positive');
      return;
    }

    try {
      const result = calculateModular(base, exp, mod);
      setModResult(`${base}^${exp} mod ${mod} = ${result}`);
    } catch (error) {
      setModResult('Calculation error');
    }
  };

  const generatePrimeList = () => {
    const primes = generatePrimes(100);
    toast({
      title: 'Common Prime Numbers',
      description: `First few primes: ${primes.slice(0, 15).join(', ')}...`,
    });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* RSA Tutorial */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              RSA Algorithm Tutorial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">What is RSA?</h3>
              <p className="text-blue-800 dark:text-blue-200">
                RSA is a public-key cryptosystem that enables secure communication over insecure channels. 
                It was developed by Ron Rivest, Adi Shamir, and Leonard Adleman in 1977.
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-950 border-l-4 border-green-500 p-4 rounded-r-lg">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">Key Generation Steps</h3>
              <ol className="text-green-800 dark:text-green-200 space-y-2 list-decimal list-inside">
                <li>Choose two distinct prime numbers p and q</li>
                <li>Compute n = p × q (modulus)</li>
                <li>Compute φ(n) = (p-1) × (q-1) (Euler's totient)</li>
                <li>Choose e such that 1 &lt; e &lt; φ(n) and gcd(e, φ(n)) = 1</li>
                <li>Compute d ≡ e⁻¹ (mod φ(n)) using Extended Euclidean Algorithm</li>
              </ol>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Encryption & Decryption</h3>
              <div className="text-yellow-800 dark:text-yellow-200 space-y-2">
                <p><strong>Public Key:</strong> (e, n) - used for encryption</p>
                <p><strong>Private Key:</strong> (d, n) - used for decryption</p>
                <p><strong>Encryption:</strong> c ≡ m^e (mod n)</p>
                <p><strong>Decryption:</strong> m ≡ c^d (mod n)</p>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 rounded-r-lg">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Security Considerations</h3>
              <ul className="text-red-800 dark:text-red-200 space-y-1 list-disc list-inside">
                <li>Use large prime numbers (1024+ bits for real applications)</li>
                <li>Keep private keys secure and never share them</li>
                <li>Use proper padding schemes (OAEP) in production</li>
                <li>This demo uses small numbers for educational purposes only</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tools Sidebar */}
      <div className="space-y-6">
        {/* Prime Checker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Prime Number Checker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="primeCheck">Number to check:</Label>
              <Input
                id="primeCheck"
                type="number"
                placeholder="Enter number"
                value={primeCheck}
                onChange={(e) => setPrimeCheck(e.target.value)}
                data-testid="input-prime-check"
              />
            </div>
            <Button
              onClick={handlePrimeCheck}
              className="w-full"
              data-testid="button-check-prime"
            >
              Check Prime
            </Button>
            {primeResult && (
              <div 
                className={`text-sm text-center font-medium ${
                  primeResult.includes('is prime') 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}
                data-testid="text-prime-result"
              >
                {primeResult}
              </div>
            )}
            <Button
              onClick={generatePrimeList}
              variant="outline"
              size="sm"
              className="w-full"
              data-testid="button-show-primes"
            >
              Show Common Primes
            </Button>
          </CardContent>
        </Card>
        
        {/* Modular Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Modular Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="modBase" className="text-xs">Base</Label>
                <Input
                  id="modBase"
                  type="number"
                  placeholder="base"
                  value={modBase}
                  onChange={(e) => setModBase(e.target.value)}
                  className="text-sm"
                  data-testid="input-mod-base"
                />
              </div>
              <div>
                <Label htmlFor="modExp" className="text-xs">Exp</Label>
                <Input
                  id="modExp"
                  type="number"
                  placeholder="exp"
                  value={modExp}
                  onChange={(e) => setModExp(e.target.value)}
                  className="text-sm"
                  data-testid="input-mod-exp"
                />
              </div>
              <div>
                <Label htmlFor="modMod" className="text-xs">Mod</Label>
                <Input
                  id="modMod"
                  type="number"
                  placeholder="mod"
                  value={modMod}
                  onChange={(e) => setModMod(e.target.value)}
                  className="text-sm"
                  data-testid="input-mod-mod"
                />
              </div>
            </div>
            <Button
              onClick={handleModularCalculation}
              className="w-full"
              data-testid="button-calculate-mod"
            >
              Calculate a^b mod n
            </Button>
            {modResult && (
              <div 
                className="text-sm text-center font-medium font-mono text-blue-600 dark:text-blue-400"
                data-testid="text-mod-result"
              >
                {modResult}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* RSA Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              RSA Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <div className="border-l-2 border-primary pl-3 mb-3">
                <div className="font-medium text-gray-900 dark:text-gray-100">1977</div>
                <div className="text-gray-600 dark:text-gray-400">RSA algorithm published</div>
              </div>
              <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-3 mb-3">
                <div className="font-medium text-gray-900 dark:text-gray-100">1983</div>
                <div className="text-gray-600 dark:text-gray-400">RSA Security founded</div>
              </div>
              <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-3 mb-3">
                <div className="font-medium text-gray-900 dark:text-gray-100">1994</div>
                <div className="text-gray-600 dark:text-gray-400">RSA patent expires</div>
              </div>
              <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-3">
                <div className="font-medium text-gray-900 dark:text-gray-100">Today</div>
                <div className="text-gray-600 dark:text-gray-400">Widely used in HTTPS, SSH, etc.</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
