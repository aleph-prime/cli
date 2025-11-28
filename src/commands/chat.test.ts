import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatCommand } from './chat.js';

describe('chat command', () => {
  describe('command structure', () => {
    it('has correct name', () => {
      expect(chatCommand.name()).toBe('chat');
    });

    it('has description', () => {
      expect(chatCommand.description()).toContain('Interactive chat');
    });

    it('has optional message argument', () => {
      const args = chatCommand.registeredArguments || [];
      expect(args.length).toBe(1);
      expect(args[0].name()).toBe('message');
      expect(args[0].required).toBe(false);
    });
  });

  describe('options', () => {
    it('has model option', () => {
      const options = chatCommand.options || [];
      const modelOpt = options.find((o) => o.long === '--model');
      expect(modelOpt).toBeDefined();
      expect(modelOpt?.short).toBe('-m');
    });

    it('has system prompt option', () => {
      const options = chatCommand.options || [];
      const systemOpt = options.find((o) => o.long === '--system');
      expect(systemOpt).toBeDefined();
      expect(systemOpt?.short).toBe('-s');
    });

    it('has no-stream option', () => {
      const options = chatCommand.options || [];
      const streamOpt = options.find((o) => o.long === '--no-stream');
      expect(streamOpt).toBeDefined();
    });

    it('has show-primes option', () => {
      const options = chatCommand.options || [];
      const primesOpt = options.find((o) => o.long === '--show-primes');
      expect(primesOpt).toBeDefined();
    });
  });
});