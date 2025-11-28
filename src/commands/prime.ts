import { Command } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import { 
  textToPrimes, 
  calculateResonance, 
  visualizePrimes, 
  factorize,
  isPrime,
  getOntology,
  PRIMES 
} from '../lib/prime.js';
import { PRIME_ONTOLOGY } from '../config/constants.js';

export const primeCommand = new Command('prime')
  .description('Prime resonance utilities');

// Factor text or number
primeCommand
  .command('factor <input>')
  .description('Factor text or number into primes')
  .option('-v, --verbose', 'Show detailed output')
  .action((input, options) => {
    // Check if input is a number
    const num = parseInt(input);
    
    if (!isNaN(num) && num > 0) {
      // Factor number
      const factors = factorize(num);
      
      console.log(`\n${chalk.bold('Prime Factorization')}: ${num}\n`);
      
      if (factors.size === 0) {
        console.log(chalk.dim('(not factorizable - number is 0 or 1)\n'));
        return;
      }
      
      const parts: string[] = [];
      for (const [prime, exp] of [...factors.entries()].sort((a, b) => a[0] - b[0])) {
        const ontology = getOntology(prime);
        const label = ontology ? chalk.dim(` (${ontology.name})`) : '';
        parts.push(exp > 1 ? `${prime}^${exp}${label}` : `${prime}${label}`);
      }
      
      console.log(`  ${parts.join(' × ')}\n`);
      
      if (options.verbose) {
        console.log(chalk.dim('Ontological interpretation:'));
        for (const [prime] of factors) {
          const ontology = getOntology(prime);
          if (ontology) {
            console.log(`  ${chalk.cyan(prime.toString())} ${ontology.name}: ${ontology.description}`);
          }
        }
        console.log();
      }
    } else {
      // Factor text
      const result = textToPrimes(input);
      
      console.log(`\n${chalk.bold('Text Prime Encoding')}\n`);
      console.log(`${chalk.dim('Input:')} "${input}"`);
      console.log(`${chalk.dim('Signature:')} ${chalk.cyan(result.resonanceSignature)}\n`);
      
      console.log(visualizePrimes(result.primes, 50));
      console.log();
      
      if (options.verbose) {
        console.log(chalk.dim('Ontological components:'));
        for (const [prime, count] of result.factors) {
          const ontology = getOntology(prime);
          if (ontology) {
            console.log(`  ${chalk.cyan(prime.toString())} ${ontology.name} (×${count})`);
          }
        }
        console.log();
      }
    }
  });

// Calculate resonance between two texts
primeCommand
  .command('resonance <text1> <text2>')
  .description('Calculate resonance between two texts')
  .action((text1, text2) => {
    const primes1 = textToPrimes(text1);
    const primes2 = textToPrimes(text2);
    
    const result = calculateResonance(primes1.primes, primes2.primes);
    
    console.log(boxen(
      `${chalk.bold('Resonance Analysis')}\n\n` +
      `${chalk.dim('Text A:')} "${text1.slice(0, 30)}${text1.length > 30 ? '...' : ''}"\n` +
      `${chalk.dim('Text B:')} "${text2.slice(0, 30)}${text2.length > 30 ? '...' : ''}"\n\n` +
      `${chalk.dim('Similarity:')} ${chalk.cyan(`${(result.similarity * 100).toFixed(1)}%`)}\n\n` +
      `${chalk.dim('Shared primes:')} ${result.sharedPrimes.length > 0 ? result.sharedPrimes.join(' · ') : 'none'}\n` +
      `${chalk.dim('Unique to A:')} ${result.uniqueToA.slice(0, 5).join(' · ') || 'none'}\n` +
      `${chalk.dim('Unique to B:')} ${result.uniqueToB.slice(0, 5).join(' · ') || 'none'}\n\n` +
      result.interpretation,
      {
        padding: 1,
        margin: { top: 1, bottom: 1, left: 0, right: 0 },
        borderStyle: 'round',
        borderColor: result.similarity > 0.5 ? 'green' : result.similarity > 0.2 ? 'yellow' : 'dim',
      }
    ));
  });

// Visualize prime numbers
primeCommand
  .command('visualize [numbers...]')
  .description('ASCII visualization of prime numbers')
  .action((numbers) => {
    let primes: number[];
    
    if (numbers && numbers.length > 0) {
      primes = numbers.map((n: string) => parseInt(n)).filter((n: number) => !isNaN(n));
    } else {
      // Show first 20 primes as default
      primes = PRIMES.slice(0, 20);
    }
    
    console.log(`\n${chalk.bold('Prime Visualization')}\n`);
    console.log(visualizePrimes(primes, 60));
    console.log();
  });

// Show ontology reference
primeCommand
  .command('ontology')
  .description('Show the 108-ontology reference')
  .action(() => {
    console.log(boxen(
      `${chalk.cyan('ℵ')} ${chalk.bold('Prime Ontology (108 System)')}\n\n` +
      `${chalk.dim('The fundamental semantic primes that encode meaning:')}\n`,
      {
        padding: 1,
        margin: { top: 1, bottom: 0, left: 0, right: 0 },
        borderStyle: 'round',
        borderColor: 'cyan',
      }
    ));
    
    for (const [prime, data] of Object.entries(PRIME_ONTOLOGY)) {
      const p = parseInt(prime);
      console.log(`  ${chalk.cyan(prime.padStart(3))} ${chalk.bold(data.name.padEnd(15))} ${chalk.dim(data.description)}`);
    }
    
    console.log(`
${chalk.dim('Higher primes encode specialized concepts through factor composition.')}
${chalk.dim('For example: 6 = 2 × 3 encodes "Structured Duality"')}
`);
  });

// Check if number is prime
primeCommand
  .command('check <number>')
  .description('Check if a number is prime')
  .action((number) => {
    const n = parseInt(number);
    
    if (isNaN(n) || n < 0) {
      console.log(chalk.red('\nInvalid number\n'));
      return;
    }
    
    const prime = isPrime(n);
    const ontology = getOntology(n);
    
    console.log(`\n${n} is ${prime ? chalk.green('prime ✓') : chalk.dim('not prime')}`);
    
    if (prime && ontology) {
      console.log(`${chalk.dim('Ontology:')} ${ontology.name} - ${ontology.description}`);
    } else if (!prime && n > 1) {
      const factors = factorize(n);
      const parts = [...factors.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([p, e]) => e > 1 ? `${p}^${e}` : p.toString());
      console.log(`${chalk.dim('Factors:')} ${parts.join(' × ')}`);
    }
    console.log();
  });

// Generate primes
primeCommand
  .command('generate <count>')
  .description('Generate prime numbers')
  .option('--from <start>', 'Start from number', '2')
  .action((count, options) => {
    const n = parseInt(count);
    const start = parseInt(options.from);
    
    if (isNaN(n) || n <= 0) {
      console.log(chalk.red('\nInvalid count\n'));
      return;
    }
    
    const primes: number[] = [];
    let current = Math.max(2, start);
    
    while (primes.length < n) {
      if (isPrime(current)) {
        primes.push(current);
      }
      current++;
    }
    
    console.log(`\n${chalk.bold('Generated Primes')} (${n} from ${start})\n`);
    
    // Format in rows of 10
    for (let i = 0; i < primes.length; i += 10) {
      const row = primes.slice(i, i + 10).map(p => p.toString().padStart(6)).join(' ');
      console.log(chalk.cyan(row));
    }
    console.log();
  });
