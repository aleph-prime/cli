import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { 
  getConfig, 
  setConfig, 
  deleteConfig, 
  getAllConfig, 
  clearConfig,
  getConfigPath 
} from '../config/index.js';
import { STATUS, DEFAULTS } from '../config/constants.js';

export const configCommand = new Command('config')
  .description('Configuration management');

// List all config
configCommand
  .command('list')
  .alias('ls')
  .description('Show all configuration values')
  .option('--path', 'Show config file path')
  .action((options) => {
    if (options.path) {
      console.log(chalk.dim('\nConfig file: ') + getConfigPath() + '\n');
      return;
    }
    
    const config = getAllConfig();
    
    console.log(chalk.bold('\nConfiguration\n'));
    
    // Hide sensitive values
    const safeConfig = { ...config };
    if (safeConfig.apiToken) {
      safeConfig.apiToken = safeConfig.apiToken.slice(0, 11) + '***';
    }
    
    for (const [key, value] of Object.entries(safeConfig)) {
      const displayValue = value === undefined || value === null 
        ? chalk.dim('(not set)') 
        : typeof value === 'boolean'
        ? (value ? chalk.green('true') : chalk.red('false'))
        : chalk.cyan(String(value));
      
      console.log(`  ${chalk.dim(key.padEnd(20))} ${displayValue}`);
    }
    
    console.log(chalk.dim(`\nConfig file: ${getConfigPath()}\n`));
  });

// Get specific config value
configCommand
  .command('get <key>')
  .description('Get a configuration value')
  .action((key) => {
    const value = getConfig(key as any);
    
    if (value === undefined) {
      console.log(chalk.dim(`\n${key}: (not set)\n`));
    } else if (key === 'apiToken' && value) {
      console.log(chalk.dim(`\n${key}: `) + chalk.cyan(String(value).slice(0, 11) + '***') + '\n');
    } else {
      console.log(chalk.dim(`\n${key}: `) + chalk.cyan(String(value)) + '\n');
    }
  });

// Set config value
configCommand
  .command('set <key> <value>')
  .description('Set a configuration value')
  .action((key, value) => {
    const validKeys = [
      'defaultModel',
      'streamEnabled', 
      'theme',
      'historyEnabled',
      'maxHistoryItems',
    ];
    
    if (!validKeys.includes(key)) {
      console.log(chalk.red(`\n${STATUS.error} Invalid config key: ${key}`));
      console.log(chalk.dim(`Valid keys: ${validKeys.join(', ')}\n`));
      return;
    }
    
    // Parse boolean values
    let parsedValue: any = value;
    if (value === 'true') parsedValue = true;
    else if (value === 'false') parsedValue = false;
    else if (!isNaN(Number(value))) parsedValue = Number(value);
    
    setConfig(key as any, parsedValue);
    console.log(chalk.green(`\n${STATUS.success} Set ${key} = ${parsedValue}\n`));
  });

// Unset config value
configCommand
  .command('unset <key>')
  .description('Remove a configuration value')
  .action((key) => {
    const protectedKeys = ['apiToken', 'userId', 'email'];
    
    if (protectedKeys.includes(key)) {
      console.log(chalk.red(`\n${STATUS.error} Cannot unset ${key} - use 'aleph auth logout' instead\n`));
      return;
    }
    
    deleteConfig(key as any);
    console.log(chalk.green(`\n${STATUS.success} Removed ${key}\n`));
  });

// Reset all config
configCommand
  .command('reset')
  .description('Reset configuration to defaults')
  .option('-f, --force', 'Skip confirmation')
  .action(async (options) => {
    if (!options.force) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Reset all configuration to defaults? (This will also log you out)',
          default: false,
        },
      ]);
      
      if (!confirm) {
        console.log(chalk.dim('Cancelled'));
        return;
      }
    }
    
    clearConfig();
    console.log(chalk.green(`\n${STATUS.success} Configuration reset to defaults\n`));
  });

// Show defaults
configCommand
  .command('defaults')
  .description('Show default configuration values')
  .action(() => {
    console.log(chalk.bold('\nDefault Configuration\n'));
    
    console.log(`  ${chalk.dim('defaultModel'.padEnd(20))} ${chalk.cyan(DEFAULTS.model)}`);
    console.log(`  ${chalk.dim('streamEnabled'.padEnd(20))} ${chalk.green('true')}`);
    console.log(`  ${chalk.dim('theme'.padEnd(20))} ${chalk.cyan('auto')}`);
    console.log(`  ${chalk.dim('historyEnabled'.padEnd(20))} ${chalk.green('true')}`);
    console.log(`  ${chalk.dim('maxHistoryItems'.padEnd(20))} ${chalk.cyan('100')}`);
    console.log();
  });

// Interactive config editor
configCommand
  .command('edit')
  .description('Interactively edit configuration')
  .action(async () => {
    const current = getAllConfig();
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'defaultModel',
        message: 'Default model:',
        default: current.defaultModel || DEFAULTS.model,
      },
      {
        type: 'confirm',
        name: 'streamEnabled',
        message: 'Enable streaming responses?',
        default: current.streamEnabled !== false,
      },
      {
        type: 'list',
        name: 'theme',
        message: 'Color theme:',
        choices: ['auto', 'dark', 'light'],
        default: current.theme || 'auto',
      },
      {
        type: 'confirm',
        name: 'historyEnabled',
        message: 'Save conversation history?',
        default: current.historyEnabled !== false,
      },
      {
        type: 'number',
        name: 'maxHistoryItems',
        message: 'Max history items:',
        default: current.maxHistoryItems || 100,
      },
    ]);
    
    for (const [key, value] of Object.entries(answers)) {
      setConfig(key as any, value);
    }
    
    console.log(chalk.green(`\n${STATUS.success} Configuration updated\n`));
  });
