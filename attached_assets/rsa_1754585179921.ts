// RSA algorithm implementation for educational purposes
// Note: This is a simplified implementation using small numbers for demonstration
// Production systems should use proper cryptographic libraries

export interface RSAKeyPair {
  publicKey: {
    e: number;
    n: number;
  };
  privateKey: {
    d: number;
    n: number;
  };
  p: number;
  q: number;
  phi: number;
}

export interface RSAMathSteps {
  nCalculation: string;
  phiCalculation: string;
  eCalculation: string;
  dCalculation: string;
}

export interface EncryptionSteps {
  character: string;
  ascii: number;
  calculation: string;
  result: number;
}

// Check if a number is prime
export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

// Calculate GCD using Euclidean algorithm
export function gcd(a: number, b: number): number {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// Calculate modular inverse using Extended Euclidean Algorithm
export function modInverse(a: number, m: number): number | null {
  // Simple brute force for educational purposes
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x;
  }
  return null;
}

// Fast modular exponentiation
export function modPow(base: number, exp: number, mod: number): number {
  let result = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) {
      result = (result * base) % mod;
    }
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
}

// Generate RSA key pair from two prime numbers
export function generateRSAKeyPair(p: number, q: number): RSAKeyPair | null {
  // Validate inputs
  if (!isPrime(p) || !isPrime(q)) {
    throw new Error('Both p and q must be prime numbers');
  }
  
  if (p === q) {
    throw new Error('p and q must be different prime numbers');
  }

  const n = p * q;
  const phi = (p - 1) * (q - 1);
  
  // Find e (commonly 3, 17, or 65537)
  let e = 3;
  while (gcd(e, phi) !== 1) {
    e += 2; // Try next odd number
  }
  
  // Calculate d
  const d = modInverse(e, phi);
  if (!d) {
    throw new Error('Could not generate valid private key');
  }

  return {
    publicKey: { e, n },
    privateKey: { d, n },
    p,
    q,
    phi,
  };
}

// Get mathematical steps for key generation
export function getKeyGenerationSteps(p: number, q: number, keyPair: RSAKeyPair): RSAMathSteps {
  return {
    nCalculation: `${p} × ${q} = ${keyPair.publicKey.n}`,
    phiCalculation: `(${p}-1) × (${q}-1) = ${keyPair.phi}`,
    eCalculation: `${keyPair.publicKey.e} (coprime with φ(n))`,
    dCalculation: `${keyPair.publicKey.e}⁻¹ mod ${keyPair.phi} = ${keyPair.privateKey.d}`,
  };
}

// Encrypt a message
export function encryptMessage(message: string, publicKey: { e: number; n: number }): number[] {
  return Array.from(message).map(char => 
    modPow(char.charCodeAt(0), publicKey.e, publicKey.n)
  );
}

// Decrypt a message
export function decryptMessage(ciphertext: number[], privateKey: { d: number; n: number }): string {
  return ciphertext.map(num => 
    String.fromCharCode(modPow(num, privateKey.d, privateKey.n))
  ).join('');
}

// Get encryption steps for educational display
export function getEncryptionSteps(
  message: string, 
  publicKey: { e: number; n: number }
): EncryptionSteps[] {
  return Array.from(message).map(char => {
    const ascii = char.charCodeAt(0);
    const result = modPow(ascii, publicKey.e, publicKey.n);
    return {
      character: char,
      ascii,
      calculation: `${ascii}^${publicKey.e} mod ${publicKey.n}`,
      result,
    };
  });
}

// Get decryption steps for educational display
export function getDecryptionSteps(
  ciphertext: number[],
  privateKey: { d: number; n: number }
): EncryptionSteps[] {
  return ciphertext.map(num => {
    const result = modPow(num, privateKey.d, privateKey.n);
    const character = String.fromCharCode(result);
    return {
      character,
      ascii: result,
      calculation: `${num}^${privateKey.d} mod ${privateKey.n}`,
      result,
    };
  });
}

// Generate list of prime numbers up to n
export function generatePrimes(max: number): number[] {
  const primes: number[] = [];
  for (let i = 2; i <= max; i++) {
    if (isPrime(i)) {
      primes.push(i);
    }
  }
  return primes;
}

// Calculate modular arithmetic (base^exp mod m)
export function calculateModular(base: number, exp: number, mod: number): number {
  return modPow(base, exp, mod);
}
