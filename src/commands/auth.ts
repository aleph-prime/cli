import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import boxen from 'boxen';
import { 
  setApiToken, 
  clearAuth, 
  getApiToken, 
  getAllConfig,
  setConfig,
  getConfigPath 
} from '../config/index.js';
import { api } from '../lib/api.js';
import { startSpinner, succeedSpinner, failSpinner } from '../ui/spinner.js';
import { STATUS } from '../config/constants.js';
import type { UserInfo } from '../types/index.js';

export const authCommand = new Command('auth')
  .description('Authentication & API token management');

// Login command
authCommand
  .command('login')
  .description('Authenticate with your API token')
  .option('-t, --token <token>', 'API token (or enter interactively)')
  .action(async (options) => {
    let token = options.token;
    
    if (!token) {
      console.log(chalk.dim('\nYou can create an API token at: https://aleph.dev/console → API Tokens\n'));
      
      const answers = await inquirer.prompt([
        {
          type: 'password',
          name: 'token',
          message: 'Enter your API token:',
          mask: '*',
          validate: (input) => input.length > 0 || 'Token is required',
        },
      ]);
      token = answers.token;
    }
    
    startSpinner('Validating token...');
    
    // Temporarily set token to test it
    setApiToken(token);
    
    const response = await api.get<{ credits_remaining: number; subscription_tier: string }>(
      api.endpoints.usage
    );
    
    if (response.error) {
      clearAuth();
      failSpinner('Invalid token');
      console.log(chalk.red(`\n${STATUS.error} Authentication failed: ${response.error.error}`));
      process.exit(1);
    }
    
    // Token is valid, save user info
    if (response.data) {
      setConfig('subscriptionTier', response.data.subscription_tier);
    }
    
    succeedSpinner('Authenticated successfully');
    
    console.log(boxen(
      `${chalk.green(STATUS.success)} Logged in successfully\n\n` +
      `${chalk.dim('Tier:')} ${response.data?.subscription_tier || 'free'}\n` +
      `${chalk.dim('Credits:')} ${response.data?.credits_remaining || 0}`,
      {
        padding: 1,
        margin: { top: 1, bottom: 1, left: 0, right: 0 },
        borderStyle: 'round',
        borderColor: 'green',
      }
    ));
  });

// Logout command
authCommand
  .command('logout')
  .description('Clear stored credentials')
  .action(async () => {
    const token = getApiToken();
    
    if (!token) {
      console.log(chalk.yellow(`${STATUS.warning} Not currently logged in`));
      return;
    }
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to log out?',
        default: false,
      },
    ]);
    
    if (confirm) {
      clearAuth();
      console.log(chalk.green(`${STATUS.success} Logged out successfully`));
    } else {
      console.log(chalk.dim('Cancelled'));
    }
  });

// Whoami command
authCommand
  .command('whoami')
  .description('Display current authentication status')
  .action(async () => {
    const token = getApiToken();
    
    if (!token) {
      console.log(chalk.yellow(`${STATUS.warning} Not logged in`));
      console.log(chalk.dim('\nRun `aleph auth login` to authenticate'));
      return;
    }
    
    startSpinner('Fetching account info...');
    
    const response = await api.get<{
      credits_remaining: number;
      subscription_tier: string;
      today_requests?: number;
      today_tokens?: number;
    }>(api.endpoints.usage);
    
    if (response.error) {
      failSpinner('Failed to fetch account info');
      console.log(chalk.red(`\n${response.error.error}`));
      return;
    }
    
    succeedSpinner('Account info retrieved');
    
    const config = getAllConfig();
    const data = response.data!;
    
    console.log(boxen(
      `${chalk.cyan('ℵ')} ${chalk.bold('Account Status')}\n\n` +
      `${chalk.dim('Token:')} ${token.slice(0, 11)}${'*'.repeat(20)}\n` +
      `${chalk.dim('Tier:')} ${chalk.cyan(data.subscription_tier)}\n` +
      `${chalk.dim('Credits:')} ${data.credits_remaining}\n` +
      `${chalk.dim('Today:')} ${data.today_requests || 0} requests, ${data.today_tokens || 0} tokens\n\n` +
      `${chalk.dim('Config:')} ${getConfigPath()}`,
      {
        padding: 1,
        margin: { top: 1, bottom: 1, left: 0, right: 0 },
        borderStyle: 'round',
        borderColor: 'cyan',
      }
    ));
  });

// Token command
authCommand
  .command('token')
  .description('Display or manage API token')
  .option('--show', 'Show full token (use with caution)')
  .option('--copy', 'Copy token to clipboard')
  .action(async (options) => {
    const token = getApiToken();
    
    if (!token) {
      console.log(chalk.yellow(`${STATUS.warning} No token stored`));
      console.log(chalk.dim('\nRun `aleph auth login` to authenticate'));
      return;
    }
    
    if (options.show) {
      console.log(chalk.yellow(`\n${STATUS.warning} Token (keep this secret!):\n`));
      console.log(chalk.cyan(token));
      console.log();
    } else if (options.copy) {
      // Note: clipboard functionality would need additional dependency
      console.log(chalk.dim('\nToken prefix: ') + chalk.cyan(token.slice(0, 11)));
      console.log(chalk.dim('Use --show to display full token'));
    } else {
      console.log(chalk.dim('\nToken prefix: ') + chalk.cyan(token.slice(0, 11)) + chalk.dim('*'.repeat(20)));
      console.log(chalk.dim('\nOptions:'));
      console.log(chalk.dim('  --show    Display full token'));
      console.log(chalk.dim('  --copy    Copy token to clipboard'));
    }
  });
