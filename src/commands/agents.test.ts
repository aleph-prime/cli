import { describe, it, expect, vi, beforeEach } from 'vitest';
import { agentsCommand } from './agents.js';

describe('agents command', () => {
  describe('command structure', () => {
    it('has correct name', () => {
      expect(agentsCommand.name()).toBe('agents');
    });

    it('has description', () => {
      expect(agentsCommand.description()).toContain('Manage workflow agents');
    });

    it('has subcommands', () => {
      const subcommands = agentsCommand.commands.map((cmd) => cmd.name());
      expect(subcommands).toContain('list');
      expect(subcommands).toContain('show');
      expect(subcommands).toContain('run');
      expect(subcommands).toContain('logs');
      expect(subcommands).toContain('delete');
    });
  });

  describe('list subcommand', () => {
    it('exists and has description', () => {
      const listCmd = agentsCommand.commands.find((c) => c.name() === 'list');
      expect(listCmd).toBeDefined();
      expect(listCmd?.description()).toContain('List');
    });

    it('has ls alias', () => {
      const listCmd = agentsCommand.commands.find((c) => c.name() === 'list');
      expect(listCmd?.aliases()).toContain('ls');
    });

    it('has active filter option', () => {
      const listCmd = agentsCommand.commands.find((c) => c.name() === 'list');
      const options = listCmd?.options || [];
      const activeOpt = options.find((o) => o.long === '--active');
      expect(activeOpt).toBeDefined();
    });
  });

  describe('show subcommand', () => {
    it('exists and has description', () => {
      const showCmd = agentsCommand.commands.find((c) => c.name() === 'show');
      expect(showCmd).toBeDefined();
      expect(showCmd?.description()).toContain('details');
    });

    it('requires id argument', () => {
      const showCmd = agentsCommand.commands.find((c) => c.name() === 'show');
      const args = showCmd?.registeredArguments || [];
      expect(args.length).toBe(1);
      expect(args[0].name()).toBe('id');
      expect(args[0].required).toBe(true);
    });
  });

  describe('run subcommand', () => {
    it('exists and has description', () => {
      const runCmd = agentsCommand.commands.find((c) => c.name() === 'run');
      expect(runCmd).toBeDefined();
      expect(runCmd?.description()).toContain('Execute');
    });

    it('requires id argument', () => {
      const runCmd = agentsCommand.commands.find((c) => c.name() === 'run');
      const args = runCmd?.registeredArguments || [];
      expect(args.length).toBe(1);
      expect(args[0].name()).toBe('id');
    });

    it('has input option', () => {
      const runCmd = agentsCommand.commands.find((c) => c.name() === 'run');
      const options = runCmd?.options || [];
      const inputOpt = options.find((o) => o.long === '--input');
      expect(inputOpt).toBeDefined();
    });

    it('has wait option', () => {
      const runCmd = agentsCommand.commands.find((c) => c.name() === 'run');
      const options = runCmd?.options || [];
      const waitOpt = options.find((o) => o.long === '--wait');
      expect(waitOpt).toBeDefined();
    });
  });

  describe('logs subcommand', () => {
    it('exists and has description', () => {
      const logsCmd = agentsCommand.commands.find((c) => c.name() === 'logs');
      expect(logsCmd).toBeDefined();
      expect(logsCmd?.description()).toContain('run history');
    });

    it('requires id argument', () => {
      const logsCmd = agentsCommand.commands.find((c) => c.name() === 'logs');
      const args = logsCmd?.registeredArguments || [];
      expect(args.length).toBe(1);
    });

    it('has run option for specific run', () => {
      const logsCmd = agentsCommand.commands.find((c) => c.name() === 'logs');
      const options = logsCmd?.options || [];
      const runOpt = options.find((o) => o.long === '--run');
      expect(runOpt).toBeDefined();
    });

    it('has limit option', () => {
      const logsCmd = agentsCommand.commands.find((c) => c.name() === 'logs');
      const options = logsCmd?.options || [];
      const limitOpt = options.find((o) => o.long === '--limit');
      expect(limitOpt).toBeDefined();
    });
  });

  describe('delete subcommand', () => {
    it('exists and has description', () => {
      const deleteCmd = agentsCommand.commands.find((c) => c.name() === 'delete');
      expect(deleteCmd).toBeDefined();
      expect(deleteCmd?.description()).toContain('Delete');
    });

    it('requires id argument', () => {
      const deleteCmd = agentsCommand.commands.find((c) => c.name() === 'delete');
      const args = deleteCmd?.registeredArguments || [];
      expect(args.length).toBe(1);
    });

    it('has force option', () => {
      const deleteCmd = agentsCommand.commands.find((c) => c.name() === 'delete');
      const options = deleteCmd?.options || [];
      const forceOpt = options.find((o) => o.long === '--force');
      expect(forceOpt).toBeDefined();
    });
  });
});