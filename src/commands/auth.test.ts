import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authCommand } from './auth.js';

describe('auth command', () => {
  describe('command structure', () => {
    it('has correct name', () => {
      expect(authCommand.name()).toBe('auth');
    });

    it('has description', () => {
      expect(authCommand.description()).toBe('Authentication & API token management');
    });

    it('has subcommands', () => {
      const subcommands = authCommand.commands.map((cmd) => cmd.name());
      expect(subcommands).toContain('login');
      expect(subcommands).toContain('logout');
      expect(subcommands).toContain('whoami');
      expect(subcommands).toContain('token');
    });
  });

  describe('login subcommand', () => {
    it('exists and has description', () => {
      const loginCmd = authCommand.commands.find((c) => c.name() === 'login');
      expect(loginCmd).toBeDefined();
      expect(loginCmd?.description()).toContain('Authenticate');
    });

    it('has token option', () => {
      const loginCmd = authCommand.commands.find((c) => c.name() === 'login');
      const options = loginCmd?.options || [];
      const tokenOpt = options.find((o) => o.long === '--token');
      expect(tokenOpt).toBeDefined();
    });
  });

  describe('logout subcommand', () => {
    it('exists and has description', () => {
      const logoutCmd = authCommand.commands.find((c) => c.name() === 'logout');
      expect(logoutCmd).toBeDefined();
      expect(logoutCmd?.description()).toContain('Clear');
    });
  });

  describe('whoami subcommand', () => {
    it('exists and has description', () => {
      const whoamiCmd = authCommand.commands.find((c) => c.name() === 'whoami');
      expect(whoamiCmd).toBeDefined();
      expect(whoamiCmd?.description()).toContain('authentication status');
    });
  });

  describe('token subcommand', () => {
    it('exists and has description', () => {
      const tokenCmd = authCommand.commands.find((c) => c.name() === 'token');
      expect(tokenCmd).toBeDefined();
      expect(tokenCmd?.description()).toContain('token');
    });

    it('has show option', () => {
      const tokenCmd = authCommand.commands.find((c) => c.name() === 'token');
      const options = tokenCmd?.options || [];
      const showOpt = options.find((o) => o.long === '--show');
      expect(showOpt).toBeDefined();
    });

    it('has copy option', () => {
      const tokenCmd = authCommand.commands.find((c) => c.name() === 'token');
      const options = tokenCmd?.options || [];
      const copyOpt = options.find((o) => o.long === '--copy');
      expect(copyOpt).toBeDefined();
    });
  });
});