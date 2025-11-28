import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { api, requireAuth } from '../lib/api.js';
import { startSpinner, succeedSpinner, failSpinner } from '../ui/spinner.js';
import { createTable, formatDate, formatStatus, truncate } from '../ui/table.js';
import { textToPrimes } from '../lib/prime.js';
import { STATUS } from '../config/constants.js';
import type { MemoryField, MemoryContribution } from '../types/index.js';

export const memoryCommand = new Command('memory')
  .description('Memory field operations');

// List memory fields
memoryCommand
  .command('list')
  .alias('ls')
  .description('List accessible memory fields')
  .option('--public', 'Show only public fields')
  .action(async (options) => {
    if (!requireAuth()) return;
    
    startSpinner('Fetching memory fields...');
    
    const response = await api.get<{ fields: MemoryField[] }>(api.endpoints.memory);
    
    if (response.error) {
      failSpinner('Failed to fetch fields');
      console.log(chalk.red(`\n${response.error.error}`));
      return;
    }
    
    succeedSpinner('Fields retrieved');
    
    let fields = response.data?.fields || [];
    
    if (options.public) {
      fields = fields.filter(f => f.is_public);
    }
    
    if (fields.length === 0) {
      console.log(chalk.dim('\nNo memory fields found.'));
      console.log(chalk.dim('Create one with: aleph memory create\n'));
      return;
    }
    
    const table = createTable({
      head: ['Name', 'Type', 'Public', 'Consensus', 'Locked'],
    });
    
    for (const field of fields) {
      table.push([
        truncate(field.name, 25),
        chalk.dim(field.field_type),
        field.is_public ? chalk.green('yes') : chalk.dim('no'),
        field.consensus_score ? `${(field.consensus_score * 100).toFixed(0)}%` : chalk.dim('—'),
        field.is_locked ? chalk.yellow('🔒') : chalk.dim('—'),
      ]);
    }
    
    console.log('\n' + table.toString() + '\n');
  });

// Show field details
memoryCommand
  .command('show <id>')
  .description('Show memory field details')
  .action(async (id) => {
    if (!requireAuth()) return;
    
    startSpinner('Fetching field...');
    
    const response = await api.get<MemoryField>(`${api.endpoints.memory}/${id}`);
    
    if (response.error) {
      failSpinner('Failed to fetch field');
      console.log(chalk.red(`\n${response.error.error}`));
      return;
    }
    
    succeedSpinner('Field retrieved');
    
    const field = response.data!;
    
    console.log(`
${chalk.bold(field.name)} ${field.is_locked ? chalk.yellow('🔒 LOCKED') : ''}
${chalk.dim(field.description || 'No description')}

${chalk.dim('ID:')}          ${field.id}
${chalk.dim('Type:')}        ${field.field_type}
${chalk.dim('Public:')}      ${field.is_public ? chalk.green('yes') : 'no'}
${chalk.dim('Members:')}     ${field.member_count || 0}
${chalk.dim('Entropy:')}     ${field.entropy_threshold}
${chalk.dim('Consensus:')}   ${field.consensus_score ? `${(field.consensus_score * 100).toFixed(1)}%` : 'N/A'}
${chalk.dim('Created:')}     ${formatDate(field.created_at)}
`);
  });

// Create memory field
memoryCommand
  .command('create')
  .description('Create a new memory field')
  .option('-n, --name <name>', 'Field name')
  .option('-d, --description <desc>', 'Field description')
  .option('--public', 'Make field public')
  .action(async (options) => {
    if (!requireAuth()) return;
    
    let name = options.name;
    let description = options.description;
    let isPublic = options.public || false;
    
    if (!name) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Field name:',
          validate: (input) => input.length > 0 || 'Name is required',
        },
        {
          type: 'input',
          name: 'description',
          message: 'Description (optional):',
        },
        {
          type: 'confirm',
          name: 'isPublic',
          message: 'Make this field public?',
          default: false,
        },
      ]);
      
      name = answers.name;
      description = answers.description;
      isPublic = answers.isPublic;
    }
    
    startSpinner('Creating field...');
    
    const response = await api.post<MemoryField>(api.endpoints.memory, {
      name,
      description: description || null,
      is_public: isPublic,
    });
    
    if (response.error) {
      failSpinner('Failed to create field');
      console.log(chalk.red(`\n${response.error.error}`));
      return;
    }
    
    succeedSpinner('Field created');
    
    console.log(chalk.dim(`\nField ID: ${response.data!.id}\n`));
  });

// Contribute to field
memoryCommand
  .command('contribute <fieldId>')
  .description('Submit a contribution to a memory field')
  .option('-c, --content <text>', 'Contribution content')
  .action(async (fieldId, options) => {
    if (!requireAuth()) return;
    
    let content = options.content;
    
    if (!content) {
      const answers = await inquirer.prompt([
        {
          type: 'editor',
          name: 'content',
          message: 'Enter your contribution:',
          validate: (input) => input.length > 0 || 'Content is required',
        },
      ]);
      content = answers.content;
    }
    
    // Calculate prime factors
    const { primes } = textToPrimes(content);
    const uniquePrimes = [...new Set(primes)].slice(0, 10);
    
    startSpinner('Submitting contribution...');
    
    const response = await api.post<MemoryContribution>(
      `${api.endpoints.memory}/${fieldId}/contributions`,
      {
        content,
        prime_factors: uniquePrimes,
      }
    );
    
    if (response.error) {
      failSpinner('Failed to submit contribution');
      console.log(chalk.red(`\n${response.error.error}`));
      return;
    }
    
    succeedSpinner('Contribution submitted');
    
    console.log(chalk.dim(`\nContribution ID: ${response.data!.id}`));
    console.log(chalk.dim(`Prime factors: ${uniquePrimes.join(' · ')}\n`));
  });

// List contributions
memoryCommand
  .command('contributions <fieldId>')
  .description('List contributions for a memory field')
  .option('-s, --status <status>', 'Filter by status (pending, accepted, rejected)', 'accepted')
  .option('-n, --limit <number>', 'Number of contributions', '20')
  .action(async (fieldId, options) => {
    if (!requireAuth()) return;
    
    startSpinner('Fetching contributions...');
    
    const response = await api.get<{ contributions: MemoryContribution[] }>(
      `${api.endpoints.memory}/${fieldId}/contributions?status=${options.status}&limit=${options.limit}`
    );
    
    if (response.error) {
      failSpinner('Failed to fetch contributions');
      console.log(chalk.red(`\n${response.error.error}`));
      return;
    }
    
    succeedSpinner('Contributions retrieved');
    
    const contributions = response.data?.contributions || [];
    
    if (contributions.length === 0) {
      console.log(chalk.dim(`\nNo ${options.status} contributions found.\n`));
      return;
    }
    
    const table = createTable({
      head: ['Content', 'Status', 'Primes', 'Created'],
    });
    
    for (const contrib of contributions) {
      table.push([
        truncate(contrib.content, 40),
        formatStatus(contrib.status),
        contrib.prime_factors?.slice(0, 3).join('·') || chalk.dim('—'),
        formatDate(contrib.created_at),
      ]);
    }
    
    console.log('\n' + table.toString() + '\n');
  });

// Join public field
memoryCommand
  .command('join <fieldId>')
  .description('Join a public memory field')
  .action(async (fieldId) => {
    if (!requireAuth()) return;
    
    startSpinner('Joining field...');
    
    const response = await api.post<{ success: boolean }>(
      `${api.endpoints.memory}/${fieldId}/join`
    );
    
    if (response.error) {
      failSpinner('Failed to join field');
      console.log(chalk.red(`\n${response.error.error}`));
      return;
    }
    
    succeedSpinner('Joined field successfully');
  });

// Delete field
memoryCommand
  .command('delete <fieldId>')
  .description('Delete a memory field (owner only)')
  .option('-f, --force', 'Skip confirmation')
  .action(async (fieldId, options) => {
    if (!requireAuth()) return;
    
    if (!options.force) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to delete field ${fieldId}? This cannot be undone.`,
          default: false,
        },
      ]);
      
      if (!confirm) {
        console.log(chalk.dim('Cancelled'));
        return;
      }
    }
    
    startSpinner('Deleting field...');
    
    const response = await api.delete(`${api.endpoints.memory}/${fieldId}`);
    
    if (response.error) {
      failSpinner('Failed to delete field');
      console.log(chalk.red(`\n${response.error.error}`));
      return;
    }
    
    succeedSpinner('Field deleted');
  });
