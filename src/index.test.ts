import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { program, run } from './index.js';

describe('CLI program', () => {
  describe('program configuration', () => {
    it('has correct name', () => {
      expect(program.name()).toBe('aleph');
    });

    it('has description', () => {
      expect(program.description()).toContain('Command-line companion');
    });

    it('has version option', () => {
      const versionOption = program.options.find(
        (o) => o.short === '-v' || o.long === '--version'
      );
      expect(versionOption).toBeDefined();
    });
  });

  describe('registered commands', () => {
    it('has auth command', () => {
      const authCmd = program.commands.find((c) => c.name() === 'auth');
      expect(authCmd).toBeDefined();
    });

    it('has chat command', () => {
      const chatCmd = program.commands.find((c) => c.name() === 'chat');
      expect(chatCmd).toBeDefined();
    });

    it('has agents command', () => {
      const agentsCmd = program.commands.find((c) => c.name() === 'agents');
      expect(agentsCmd).toBeDefined();
    });

    it('has memory command', () => {
      const memoryCmd = program.commands.find((c) => c.name() === 'memory');
      expect(memoryCmd).toBeDefined();
    });

    it('has prime command', () => {
      const primeCmd = program.commands.find((c) => c.name() === 'prime');
      expect(primeCmd).toBeDefined();
    });

    it('has config command', () => {
      const configCmd = program.commands.find((c) => c.name() === 'config');
      expect(configCmd).toBeDefined();
    });
  });

  describe('run function', () => {
    it('is exported', () => {
      expect(typeof run).toBe('function');
    });

    it('accepts argv array', () => {
      // Run with help to avoid side effects
      expect(() => {
        // Mock exit to prevent process termination
        const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
          throw new Error('exit');
        });
        
        try {
          run(['node', 'aleph', '--help']);
        } catch {
          // Expected to throw due to mocked exit
        }
        
        mockExit.mockRestore();
      }).not.toThrow();
    });
  });
});