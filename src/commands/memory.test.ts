import { describe, it, expect, vi, beforeEach } from 'vitest';
import { memoryCommand } from './memory.js';

describe('memory command', () => {
  describe('command structure', () => {
    it('has correct name', () => {
      expect(memoryCommand.name()).toBe('memory');
    });

    it('has description', () => {
      expect(memoryCommand.description()).toContain('Memory field operations');
    });

    it('has subcommands', () => {
      const subcommands = memoryCommand.commands.map((cmd) => cmd.name());
      expect(subcommands).toContain('list');
      expect(subcommands).toContain('show');
      expect(subcommands).toContain('create');
      expect(subcommands).toContain('contribute');
      expect(subcommands).toContain('contributions');
      expect(subcommands).toContain('join');
      expect(subcommands).toContain('delete');
    });
  });

  describe('list subcommand', () => {
    it('exists and has description', () => {
      const listCmd = memoryCommand.commands.find((c) => c.name() === 'list');
      expect(listCmd).toBeDefined();
      expect(listCmd?.description()).toContain('List');
    });

    it('has ls alias', () => {
      const listCmd = memoryCommand.commands.find((c) => c.name() === 'list');
      expect(listCmd?.aliases()).toContain('ls');
    });

    it('has public filter option', () => {
      const listCmd = memoryCommand.commands.find((c) => c.name() === 'list');
      const options = listCmd?.options || [];
      const publicOpt = options.find((o) => o.long === '--public');
      expect(publicOpt).toBeDefined();
    });
  });

  describe('show subcommand', () => {
    it('exists and has description', () => {
      const showCmd = memoryCommand.commands.find((c) => c.name() === 'show');
      expect(showCmd).toBeDefined();
      expect(showCmd?.description()).toContain('details');
    });

    it('requires id argument', () => {
      const showCmd = memoryCommand.commands.find((c) => c.name() === 'show');
      const args = showCmd?.registeredArguments || [];
      expect(args.length).toBe(1);
      expect(args[0].name()).toBe('id');
    });
  });

  describe('create subcommand', () => {
    it('exists and has description', () => {
      const createCmd = memoryCommand.commands.find((c) => c.name() === 'create');
      expect(createCmd).toBeDefined();
      expect(createCmd?.description()).toContain('Create');
    });

    it('has name option', () => {
      const createCmd = memoryCommand.commands.find((c) => c.name() === 'create');
      const options = createCmd?.options || [];
      const nameOpt = options.find((o) => o.long === '--name');
      expect(nameOpt).toBeDefined();
    });

    it('has description option', () => {
      const createCmd = memoryCommand.commands.find((c) => c.name() === 'create');
      const options = createCmd?.options || [];
      const descOpt = options.find((o) => o.long === '--description');
      expect(descOpt).toBeDefined();
    });

    it('has public option', () => {
      const createCmd = memoryCommand.commands.find((c) => c.name() === 'create');
      const options = createCmd?.options || [];
      const publicOpt = options.find((o) => o.long === '--public');
      expect(publicOpt).toBeDefined();
    });
  });

  describe('contribute subcommand', () => {
    it('exists and has description', () => {
      const contributeCmd = memoryCommand.commands.find((c) => c.name() === 'contribute');
      expect(contributeCmd).toBeDefined();
      expect(contributeCmd?.description()).toContain('contribution');
    });

    it('requires fieldId argument', () => {
      const contributeCmd = memoryCommand.commands.find((c) => c.name() === 'contribute');
      const args = contributeCmd?.registeredArguments || [];
      expect(args.length).toBe(1);
      expect(args[0].name()).toBe('fieldId');
    });

    it('has content option', () => {
      const contributeCmd = memoryCommand.commands.find((c) => c.name() === 'contribute');
      const options = contributeCmd?.options || [];
      const contentOpt = options.find((o) => o.long === '--content');
      expect(contentOpt).toBeDefined();
    });
  });

  describe('contributions subcommand', () => {
    it('exists and has description', () => {
      const contribsCmd = memoryCommand.commands.find((c) => c.name() === 'contributions');
      expect(contribsCmd).toBeDefined();
      expect(contribsCmd?.description()).toContain('contributions');
    });

    it('requires fieldId argument', () => {
      const contribsCmd = memoryCommand.commands.find((c) => c.name() === 'contributions');
      const args = contribsCmd?.registeredArguments || [];
      expect(args.length).toBe(1);
    });

    it('has status filter option', () => {
      const contribsCmd = memoryCommand.commands.find((c) => c.name() === 'contributions');
      const options = contribsCmd?.options || [];
      const statusOpt = options.find((o) => o.long === '--status');
      expect(statusOpt).toBeDefined();
    });

    it('has limit option', () => {
      const contribsCmd = memoryCommand.commands.find((c) => c.name() === 'contributions');
      const options = contribsCmd?.options || [];
      const limitOpt = options.find((o) => o.long === '--limit');
      expect(limitOpt).toBeDefined();
    });
  });

  describe('join subcommand', () => {
    it('exists and has description', () => {
      const joinCmd = memoryCommand.commands.find((c) => c.name() === 'join');
      expect(joinCmd).toBeDefined();
      expect(joinCmd?.description()).toContain('Join');
    });

    it('requires fieldId argument', () => {
      const joinCmd = memoryCommand.commands.find((c) => c.name() === 'join');
      const args = joinCmd?.registeredArguments || [];
      expect(args.length).toBe(1);
    });
  });

  describe('delete subcommand', () => {
    it('exists and has description', () => {
      const deleteCmd = memoryCommand.commands.find((c) => c.name() === 'delete');
      expect(deleteCmd).toBeDefined();
      expect(deleteCmd?.description()).toContain('Delete');
    });

    it('requires fieldId argument', () => {
      const deleteCmd = memoryCommand.commands.find((c) => c.name() === 'delete');
      const args = deleteCmd?.registeredArguments || [];
      expect(args.length).toBe(1);
    });

    it('has force option', () => {
      const deleteCmd = memoryCommand.commands.find((c) => c.name() === 'delete');
      const options = deleteCmd?.options || [];
      const forceOpt = options.find((o) => o.long === '--force');
      expect(forceOpt).toBeDefined();
    });
  });
});