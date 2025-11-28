import { describe, it, expect } from 'vitest';
import {
  isPrime,
  factorize,
  textToPrimes,
  calculateResonance,
  visualizePrimes,
  getOntology,
  PRIMES,
} from './prime.js';

describe('isPrime', () => {
  it('returns false for numbers less than 2', () => {
    expect(isPrime(0)).toBe(false);
    expect(isPrime(1)).toBe(false);
    expect(isPrime(-1)).toBe(false);
    expect(isPrime(-5)).toBe(false);
  });

  it('returns true for 2', () => {
    expect(isPrime(2)).toBe(true);
  });

  it('returns false for even numbers greater than 2', () => {
    expect(isPrime(4)).toBe(false);
    expect(isPrime(6)).toBe(false);
    expect(isPrime(100)).toBe(false);
  });

  it('returns true for prime numbers', () => {
    expect(isPrime(3)).toBe(true);
    expect(isPrime(5)).toBe(true);
    expect(isPrime(7)).toBe(true);
    expect(isPrime(11)).toBe(true);
    expect(isPrime(13)).toBe(true);
    expect(isPrime(17)).toBe(true);
    expect(isPrime(97)).toBe(true);
    expect(isPrime(541)).toBe(true);
  });

  it('returns false for composite numbers', () => {
    expect(isPrime(9)).toBe(false);
    expect(isPrime(15)).toBe(false);
    expect(isPrime(21)).toBe(false);
    expect(isPrime(49)).toBe(false);
    expect(isPrime(100)).toBe(false);
  });
});

describe('factorize', () => {
  it('returns empty map for 0 and 1', () => {
    expect(factorize(0).size).toBe(0);
    expect(factorize(1).size).toBe(0);
  });

  it('returns single factor for prime numbers', () => {
    const factors5 = factorize(5);
    expect(factors5.size).toBe(1);
    expect(factors5.get(5)).toBe(1);

    const factors13 = factorize(13);
    expect(factors13.size).toBe(1);
    expect(factors13.get(13)).toBe(1);
  });

  it('correctly factors composite numbers', () => {
    const factors12 = factorize(12); // 2^2 * 3
    expect(factors12.get(2)).toBe(2);
    expect(factors12.get(3)).toBe(1);

    const factors60 = factorize(60); // 2^2 * 3 * 5
    expect(factors60.get(2)).toBe(2);
    expect(factors60.get(3)).toBe(1);
    expect(factors60.get(5)).toBe(1);
  });

  it('handles powers of primes', () => {
    const factors8 = factorize(8); // 2^3
    expect(factors8.size).toBe(1);
    expect(factors8.get(2)).toBe(3);

    const factors27 = factorize(27); // 3^3
    expect(factors27.size).toBe(1);
    expect(factors27.get(3)).toBe(3);
  });

  it('handles negative numbers by taking absolute value', () => {
    const factors = factorize(-12);
    expect(factors.get(2)).toBe(2);
    expect(factors.get(3)).toBe(1);
  });

  it('handles decimal numbers by flooring', () => {
    const factors = factorize(12.7);
    expect(factors.get(2)).toBe(2);
    expect(factors.get(3)).toBe(1);
  });
});

describe('textToPrimes', () => {
  it('returns empty arrays for empty string', () => {
    const result = textToPrimes('');
    expect(result.primes).toHaveLength(0);
    expect(result.factors.size).toBe(0);
  });

  it('encodes text characters to primes', () => {
    const result = textToPrimes('hello');
    expect(result.primes).toHaveLength(5);
    expect(result.primes.every((p) => PRIMES.includes(p))).toBe(true);
  });

  it('generates a resonance signature', () => {
    const result = textToPrimes('test');
    expect(result.resonanceSignature).toBeTruthy();
    expect(typeof result.resonanceSignature).toBe('string');
  });

  it('calculates product from factors', () => {
    const result = textToPrimes('ab');
    expect(result.product).toBeGreaterThan(1);
  });

  it('produces consistent results for same input', () => {
    const result1 = textToPrimes('hello');
    const result2 = textToPrimes('hello');
    expect(result1.primes).toEqual(result2.primes);
    expect(result1.resonanceSignature).toBe(result2.resonanceSignature);
  });

  it('produces different results for different inputs', () => {
    const result1 = textToPrimes('hello');
    const result2 = textToPrimes('world');
    expect(result1.resonanceSignature).not.toBe(result2.resonanceSignature);
  });
});

describe('calculateResonance', () => {
  it('returns 100% similarity for identical arrays', () => {
    const primes = [2, 3, 5, 7];
    const result = calculateResonance(primes, primes);
    expect(result.similarity).toBe(1);
    expect(result.sharedPrimes).toEqual([2, 3, 5, 7]);
    expect(result.uniqueToA).toHaveLength(0);
    expect(result.uniqueToB).toHaveLength(0);
  });

  it('returns 0% similarity for completely different arrays', () => {
    const result = calculateResonance([2, 3], [5, 7]);
    expect(result.similarity).toBe(0);
    expect(result.sharedPrimes).toHaveLength(0);
    expect(result.uniqueToA).toEqual([2, 3]);
    expect(result.uniqueToB).toEqual([5, 7]);
  });

  it('calculates partial similarity correctly', () => {
    const result = calculateResonance([2, 3, 5], [3, 5, 7]);
    expect(result.similarity).toBeCloseTo(0.5, 2); // 2 shared out of 4 unique
    expect(result.sharedPrimes).toEqual([3, 5]);
    expect(result.uniqueToA).toEqual([2]);
    expect(result.uniqueToB).toEqual([7]);
  });

  it('handles empty arrays', () => {
    const result = calculateResonance([], []);
    expect(result.similarity).toBeNaN(); // 0/0 produces NaN
    expect(result.sharedPrimes).toHaveLength(0);
  });

  it('provides interpretation for high similarity', () => {
    const result = calculateResonance([2, 3, 5, 7, 11], [2, 3, 5, 7, 11]);
    expect(result.interpretation).toContain('High resonance');
  });

  it('provides interpretation for moderate similarity', () => {
    // 3 shared out of 5 unique = 60% similarity
    const result = calculateResonance([2, 3, 5], [2, 3, 5, 7, 11]);
    expect(result.interpretation).toContain('Moderate resonance');
  });

  it('provides interpretation for weak similarity', () => {
    // 2 shared out of 6 unique = 33% similarity
    const result = calculateResonance([2, 3, 5, 7], [2, 3, 11, 13]);
    expect(result.interpretation).toContain('Weak resonance');
  });

  it('provides interpretation for minimal similarity', () => {
    const result = calculateResonance([2], [3, 5, 7, 11, 13, 17, 19, 23, 29]);
    expect(result.interpretation).toContain('Minimal resonance');
  });
});

describe('getOntology', () => {
  it('returns ontology for known primes', () => {
    const result2 = getOntology(2);
    expect(result2).not.toBeNull();
    expect(result2?.name).toBe('Duality');

    const result3 = getOntology(3);
    expect(result3).not.toBeNull();
    expect(result3?.name).toBe('Structure');

    const result7 = getOntology(7);
    expect(result7).not.toBeNull();
    expect(result7?.name).toBe('Identity');
  });

  it('returns null for primes without ontology', () => {
    expect(getOntology(41)).toBeNull();
    expect(getOntology(97)).toBeNull();
  });

  it('returns null for non-primes', () => {
    expect(getOntology(4)).toBeNull();
    expect(getOntology(100)).toBeNull();
  });
});

describe('visualizePrimes', () => {
  it('returns "(no primes)" for empty array', () => {
    expect(visualizePrimes([])).toBe('(no primes)');
  });

  it('creates visualization for single prime', () => {
    const result = visualizePrimes([2]);
    expect(result).toContain('2');
    expect(result).toContain('█');
  });

  it('creates visualization with counts', () => {
    const result = visualizePrimes([2, 2, 3]);
    expect(result).toContain('2');
    expect(result).toContain('3');
    expect(result).toContain('2'); // count
    expect(result).toContain('1'); // count
  });

  it('includes ontology names in visualization', () => {
    const result = visualizePrimes([2, 3, 7]);
    expect(result).toContain('Duality');
    expect(result).toContain('Structure');
    expect(result).toContain('Identity');
  });

  it('respects maxWidth parameter', () => {
    const result = visualizePrimes([2, 2, 2, 2, 2], 30);
    const lines = result.split('\n');
    // Each line should respect the max width
    expect(lines[0].length).toBeLessThanOrEqual(50); // padded label + bar
  });
});

describe('PRIMES constant', () => {
  it('contains first 100 primes', () => {
    expect(PRIMES).toHaveLength(100);
  });

  it('starts with 2', () => {
    expect(PRIMES[0]).toBe(2);
  });

  it('ends with 541', () => {
    expect(PRIMES[99]).toBe(541);
  });

  it('contains only prime numbers', () => {
    for (const p of PRIMES) {
      expect(isPrime(p)).toBe(true);
    }
  });
});