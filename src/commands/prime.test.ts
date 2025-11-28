import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { primeCommand } from './prime.js';

// Test command parsing and structure
describe('prime command', () => {
  describe('command structure', () => {
    it('has correct name', () => {
      expect(primeCommand.name()).toBe('prime');
    });

    it('has description', () => {
      expect(primeCommand.description()).toBe('Prime resonance utilities');
    });

    it('has subcommands', () => {
      const subcommands = primeCommand.commands.map((cmd) => cmd.name());
      expect(subcommands).toContain('factor');
      expect(subcommands).toContain('resonance');
      expect(subcommands).toContain('visualize');
      expect(subcommands).toContain('ontology');
      expect(subcommands).toContain('check');
      expect(subcommands).toContain('generate');
    });
  });

  describe('factor subcommand', () => {
    it('exists and has description', () => {
      const factorCmd = primeCommand.commands.find((c) => c.name() === 'factor');
      expect(factorCmd).toBeDefined();
      expect(factorCmd?.description()).toContain('Factor');
    });

    it('accepts input argument', () => {
      const factorCmd = primeCommand.commands.find((c) => c.name() === 'factor');
      const args = factorCmd?.registeredArguments || [];
      expect(args.length).toBeGreaterThan(0);
      expect(args[0].name()).toBe('input');
    });

    it('has verbose option', () => {
      const factorCmd = primeCommand.commands.find((c) => c.name() === 'factor');
      const options = factorCmd?.options || [];
      const verboseOpt = options.find((o) => o.long === '--verbose');
      expect(verboseOpt).toBeDefined();
    });
  });

  describe('resonance subcommand', () => {
    it('exists and has description', () => {
      const resonanceCmd = primeCommand.commands.find((c) => c.name() === 'resonance');
      expect(resonanceCmd).toBeDefined();
      expect(resonanceCmd?.description()).toContain('resonance');
    });

    it('accepts two text arguments', () => {
      const resonanceCmd = primeCommand.commands.find((c) => c.name() === 'resonance');
      const args = resonanceCmd?.registeredArguments || [];
      expect(args.length).toBe(2);
    });
  });

  describe('visualize subcommand', () => {
    it('exists and has description', () => {
      const visualizeCmd = primeCommand.commands.find((c) => c.name() === 'visualize');
      expect(visualizeCmd).toBeDefined();
    });

    it('accepts optional numbers argument', () => {
      const visualizeCmd = primeCommand.commands.find((c) => c.name() === 'visualize');
      const args = visualizeCmd?.registeredArguments || [];
      expect(args.length).toBe(1);
      expect(args[0].variadic).toBe(true);
    });
  });

  describe('ontology subcommand', () => {
    it('exists and has description', () => {
      const ontologyCmd = primeCommand.commands.find((c) => c.name() === 'ontology');
      expect(ontologyCmd).toBeDefined();
      expect(ontologyCmd?.description()).toContain('ontology');
    });
  });

  describe('check subcommand', () => {
    it('exists and has description', () => {
      const checkCmd = primeCommand.commands.find((c) => c.name() === 'check');
      expect(checkCmd).toBeDefined();
      expect(checkCmd?.description()).toContain('prime');
    });

    it('accepts number argument', () => {
      const checkCmd = primeCommand.commands.find((c) => c.name() === 'check');
      const args = checkCmd?.registeredArguments || [];
      expect(args.length).toBe(1);
    });
  });

  describe('generate subcommand', () => {
    it('exists and has description', () => {
      const generateCmd = primeCommand.commands.find((c) => c.name() === 'generate');
      expect(generateCmd).toBeDefined();
      expect(generateCmd?.description()).toContain('Generate');
    });

    it('accepts count argument', () => {
      const generateCmd = primeCommand.commands.find((c) => c.name() === 'generate');
      const args = generateCmd?.registeredArguments || [];
      expect(args.length).toBe(1);
      expect(args[0].name()).toBe('count');
    });

    it('has from option', () => {
      const generateCmd = primeCommand.commands.find((c) => c.name() === 'generate');
      const options = generateCmd?.options || [];
      const fromOpt = options.find((o) => o.long === '--from');
      expect(fromOpt).toBeDefined();
    });
  });
});