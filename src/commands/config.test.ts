import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configCommand } from './config.js';

describe('config command', () => {
  describe('command structure', () => {
    it('has correct name', () => {
      expect(configCommand.name()).toBe('config');
    });

    it('has description', () => {
      expect(configCommand.description()).toContain('Configuration management');
    });

    it('has subcommands', () => {
      const subcommands = configCommand.commands.map((cmd) => cmd.name());
      expect(subcommands).toContain('list');
      expect(subcommands).toContain('get');
      expect(subcommands).toContain('set');
      expect(subcommands).toContain('unset');
      expect(subcommands).toContain('reset');
      expect(subcommands).toContain('defaults');
      expect(subcommands).toContain('edit');
    });
  });

  describe('list subcommand', () => {
    it('exists and has description', () => {
      const listCmd = configCommand.commands.find((c) => c.name() === 'list');
      expect(listCmd).toBeDefined();
      expect(listCmd?.description()).toContain('configuration values');
    });

    it('has ls alias', () => {
      const listCmd = configCommand.commands.find((c) => c.name() === 'list');
      expect(listCmd?.aliases()).toContain('ls');
    });

    it('has path option', () => {
      const listCmd = configCommand.commands.find((c) => c.name() === 'list');
      const options = listCmd?.options || [];
      const pathOpt = options.find((o) => o.long === '--path');
      expect(pathOpt).toBeDefined();
    });
  });

  describe('get subcommand', () => {
    it('exists and has description', () => {
      const getCmd = configCommand.commands.find((c) => c.name() === 'get');
      expect(getCmd).toBeDefined();
      expect(getCmd?.description()).toContain('Get a configuration value');
    });

    it('requires key argument', () => {
      const getCmd = configCommand.commands.find((c) => c.name() === 'get');
      const args = getCmd?.registeredArguments || [];
      expect(args.length).toBe(1);
      expect(args[0].name()).toBe('key');
      expect(args[0].required).toBe(true);
    });
  });

  describe('set subcommand', () => {
    it('exists and has description', () => {
      const setCmd = configCommand.commands.find((c) => c.name() === 'set');
      expect(setCmd).toBeDefined();
      expect(setCmd?.description()).toContain('Set a configuration value');
    });

    it('requires key and value arguments', () => {
      const setCmd = configCommand.commands.find((c) => c.name() === 'set');
      const args = setCmd?.registeredArguments || [];
      expect(args.length).toBe(2);
      expect(args[0].name()).toBe('key');
      expect(args[1].name()).toBe('value');
    });
  });

  describe('unset subcommand', () => {
    it('exists and has description', () => {
      const unsetCmd = configCommand.commands.find((c) => c.name() === 'unset');
      expect(unsetCmd).toBeDefined();
      expect(unsetCmd?.description()).toContain('Remove');
    });

    it('requires key argument', () => {
      const unsetCmd = configCommand.commands.find((c) => c.name() === 'unset');
      const args = unsetCmd?.registeredArguments || [];
      expect(args.length).toBe(1);
      expect(args[0].name()).toBe('key');
    });
  });

  describe('reset subcommand', () => {
    it('exists and has description', () => {
      const resetCmd = configCommand.commands.find((c) => c.name() === 'reset');
      expect(resetCmd).toBeDefined();
      expect(resetCmd?.description()).toContain('Reset');
    });

    it('has force option', () => {
      const resetCmd = configCommand.commands.find((c) => c.name() === 'reset');
      const options = resetCmd?.options || [];
      const forceOpt = options.find((o) => o.long === '--force');
      expect(forceOpt).toBeDefined();
    });
  });

  describe('defaults subcommand', () => {
    it('exists and has description', () => {
      const defaultsCmd = configCommand.commands.find((c) => c.name() === 'defaults');
      expect(defaultsCmd).toBeDefined();
      expect(defaultsCmd?.description()).toContain('default');
    });
  });

  describe('edit subcommand', () => {
    it('exists and has description', () => {
      const editCmd = configCommand.commands.find((c) => c.name() === 'edit');
      expect(editCmd).toBeDefined();
      expect(editCmd?.description()).toContain('Interactively');
    });
  });
});