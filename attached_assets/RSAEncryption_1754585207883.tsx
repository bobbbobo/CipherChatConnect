import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { 
  encryptMessage, 
  decryptMessage, 
  getEncryptionSteps,
  getDecryptionSteps,
  RSAKeyPair,
  EncryptionSteps
} from '@/lib/rsa';
import { useToast } from '@/hooks/use-toast';

interface RSAEncryptionProps {
  keyPair: RSAKeyPair | null;
}

export default function RSAEncryption({ keyPair }: RSAEncryptionProps) {
  const [message, setMessage] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [showMath, setShowMath] = useState(false);
  const [encryptionSteps, setEncryptionSteps] = useState<EncryptionSteps[]>([]);
  const [decryptionSteps, setDecryptionSteps] = useState<EncryptionSteps[]>([]);
  const { toast } = useToast();

  const handleEncrypt = () => {
    if (!keyPair) {
      toast({
        title: 'No Keys Available',
        description: 'Please generate RSA keys first.',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'No Message',
        description: 'Please enter a message to encrypt.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const encrypted = encryptMessage(message, keyPair.publicKey);
      const steps = getEncryptionSteps(message, keyPair.publicKey);
      
      setEncryptedMessage(encrypted.join(' '));
      setEncryptionSteps(steps);
      setDecryptedMessage(''); // Clear previous decryption
      setDecryptionSteps([]);

      toast({
        title: 'Message Encrypted',
        description: 'Your message has been encrypted successfully.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Encryption failed';
      toast({
        title: 'Encryption Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDecrypt = () => {
    if (!keyPair) {
      toast({
        title: 'No Keys Available',
        description: 'Please generate RSA keys first.',
        variant: 'destructive',
      });
      return;
    }

    if (!encryptedMessage.trim()) {
      toast({
        title: 'No Encrypted Message',
        description: 'Please encrypt a message first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const ciphertext = encryptedMessage.split(' ').map(num => parseInt(num.trim()));
      
      // Validate ciphertext
      if (ciphertext.some(num => isNaN(num))) {
        throw new Error('Invalid encrypted message format');
      }

      const decrypted = decryptMessage(ciphertext, keyPair.privateKey);
      const steps = getDecryptionSteps(ciphertext, keyPair.privateKey);
      
      setDecryptedMessage(decrypted);
      setDecryptionSteps(steps);

      toast({
        title: 'Message Decrypted',
        description: 'Your message has been decrypted successfully.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Decryption failed';
      toast({
        title: 'Decryption Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Message Encryption
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMath(!showMath)}
            data-testid="toggle-encryption-math"
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
        <div>
          <Label htmlFor="message">Message:</Label>
          <Input
            id="message"
            placeholder="Enter your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            data-testid="input-message"
          />
        </div>
        
        <div className="flex space-x-3">
          <Button
            onClick={handleEncrypt}
            disabled={!keyPair || !message.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700"
            data-testid="button-encrypt"
          >
            <Lock className="h-4 w-4 mr-2" />
            Encrypt
          </Button>
          <Button
            onClick={handleDecrypt}
            disabled={!keyPair || !encryptedMessage.trim()}
            className="flex-1 bg-red-600 hover:bg-red-700"
            data-testid="button-decrypt"
          >
            <Unlock className="h-4 w-4 mr-2" />
            Decrypt
          </Button>
        </div>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="encrypted">Encrypted Message:</Label>
            <Textarea
              id="encrypted"
              readOnly
              value={encryptedMessage}
              className="font-mono text-sm bg-gray-50 dark:bg-gray-800"
              rows={3}
              data-testid="text-encrypted-message"
            />
          </div>
          
          <div>
            <Label htmlFor="decrypted">Decrypted Message:</Label>
            <Textarea
              id="decrypted"
              readOnly
              value={decryptedMessage}
              className="font-mono text-sm bg-gray-50 dark:bg-gray-800"
              rows={2}
              data-testid="text-decrypted-message"
            />
          </div>
        </div>
        
        {showMath && (encryptionSteps.length > 0 || decryptionSteps.length > 0) && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg" data-testid="math-process-display">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Encryption/Decryption Process:
            </h3>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 font-mono">
              <div>Encryption: c ≡ m^e mod n</div>
              <div>Decryption: m ≡ c^d mod n</div>
              
              {encryptionSteps.length > 0 && (
                <div className="mt-3">
                  <div className="font-medium mb-2">Encryption Steps:</div>
                  {encryptionSteps.map((step, index) => (
                    <div key={index} className="text-xs">
                      '{step.character}' ({step.ascii}) → {step.calculation} = {step.result}
                    </div>
                  ))}
                </div>
              )}
              
              {decryptionSteps.length > 0 && (
                <div className="mt-3">
                  <div className="font-medium mb-2">Decryption Steps:</div>
                  {decryptionSteps.map((step, index) => (
                    <div key={index} className="text-xs">
                      {decryptionSteps[index] && encryptedMessage.split(' ')[index]} → {step.calculation} = {step.ascii} ('{step.character}')
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
