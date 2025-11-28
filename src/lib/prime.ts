import { PRIME_ONTOLOGY } from '../config/constants.js';
import type { PrimeFactorization, ResonanceResult } from '../types/index.js';

// First 100 primes for encoding
const PRIMES = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
  157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233,
  239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317,
  331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419,
  421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503,
  509, 521, 523, 541,
];

/**
 * Check if a number is prime
 */
export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  
  const sqrt = Math.sqrt(n);
  for (let i = 3; i <= sqrt; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

/**
 * Factorize a number into prime factors
 */
export function factorize(n: number): Map<number, number> {
  const factors = new Map<number, number>();
  let num = Math.abs(Math.floor(n));
  
  if (num < 2) return factors;
  
  for (const prime of PRIMES) {
    if (prime * prime > num) break;
    
    while (num % prime === 0) {
      factors.set(prime, (factors.get(prime) || 0) + 1);
      num = num / prime;
    }
  }
  
  if (num > 1) {
    factors.set(num, 1);
  }
  
  return factors;
}

/**
 * Encode text to prime representation
 */
export function textToPrimes(text: string): PrimeFactorization {
  const primes: number[] = [];
  const factors = new Map<number, number>();
  
  // Simple encoding: use character codes mapped to primes
  for (let i = 0; i < Math.min(text.length, PRIMES.length); i++) {
    const charCode = text.charCodeAt(i);
    const primeIndex = charCode % PRIMES.length;
    const prime = PRIMES[primeIndex];
    
    primes.push(prime);
    factors.set(prime, (factors.get(prime) || 0) + 1);
  }
  
  // Calculate product (capped to avoid overflow)
  let product = 1;
  for (const [prime, count] of factors) {
    for (let i = 0; i < count && product < Number.MAX_SAFE_INTEGER / prime; i++) {
      product *= prime;
    }
  }
  
  // Create resonance signature
  const sortedPrimes = [...factors.keys()].sort((a, b) => a - b);
  const resonanceSignature = sortedPrimes.slice(0, 5).join('·');
  
  return {
    primes,
    factors,
    product,
    resonanceSignature,
  };
}

/**
 * Calculate resonance between two prime sets
 */
export function calculateResonance(a: number[], b: number[]): ResonanceResult {
  const setA = new Set(a);
  const setB = new Set(b);
  
  const shared: number[] = [];
  const uniqueToA: number[] = [];
  const uniqueToB: number[] = [];
  
  for (const prime of setA) {
    if (setB.has(prime)) {
      shared.push(prime);
    } else {
      uniqueToA.push(prime);
    }
  }
  
  for (const prime of setB) {
    if (!setA.has(prime)) {
      uniqueToB.push(prime);
    }
  }
  
  // Jaccard similarity
  const union = new Set([...a, ...b]);
  const similarity = shared.length / union.size;
  
  // Generate interpretation based on shared ontological primes
  const interpretation = interpretResonance(shared, similarity);
  
  return {
    similarity,
    sharedPrimes: shared.sort((a, b) => a - b),
    uniqueToA: uniqueToA.sort((a, b) => a - b),
    uniqueToB: uniqueToB.sort((a, b) => a - b),
    interpretation,
  };
}

/**
 * Interpret resonance based on prime ontology
 */
function interpretResonance(sharedPrimes: number[], similarity: number): string {
  const ontologyMatches: string[] = [];
  
  for (const prime of sharedPrimes) {
    const ontology = PRIME_ONTOLOGY[prime as keyof typeof PRIME_ONTOLOGY];
    if (ontology) {
      ontologyMatches.push(ontology.name);
    }
  }
  
  if (similarity >= 0.8) {
    return `High resonance (${(similarity * 100).toFixed(0)}%): Strong alignment through ${ontologyMatches.join(', ') || 'shared structure'}`;
  } else if (similarity >= 0.5) {
    return `Moderate resonance (${(similarity * 100).toFixed(0)}%): Partial alignment via ${ontologyMatches.join(', ') || 'common factors'}`;
  } else if (similarity >= 0.2) {
    return `Weak resonance (${(similarity * 100).toFixed(0)}%): Divergent structures with ${ontologyMatches.length ? `some ${ontologyMatches.join(', ')}` : 'minimal overlap'}`;
  } else {
    return `Minimal resonance (${(similarity * 100).toFixed(0)}%): Largely independent structures`;
  }
}

/**
 * Get ontology description for a prime
 */
export function getOntology(prime: number): { name: string; description: string } | null {
  return PRIME_ONTOLOGY[prime as keyof typeof PRIME_ONTOLOGY] || null;
}

/**
 * Generate ASCII visualization of prime factors
 */
export function visualizePrimes(primes: number[], maxWidth: number = 60): string {
  if (primes.length === 0) return '(no primes)';
  
  const counts = new Map<number, number>();
  for (const p of primes) {
    counts.set(p, (counts.get(p) || 0) + 1);
  }
  
  const maxCount = Math.max(...counts.values());
  const lines: string[] = [];
  
  for (const [prime, count] of [...counts.entries()].sort((a, b) => a[0] - b[0])) {
    const barLength = Math.ceil((count / maxCount) * (maxWidth - 10));
    const bar = '█'.repeat(barLength);
    const ontology = getOntology(prime);
    const label = ontology ? `${prime} (${ontology.name})` : prime.toString();
    lines.push(`${label.padEnd(20)} ${bar} ${count}`);
  }
  
  return lines.join('\n');
}

export { PRIMES };
