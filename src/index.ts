import { Command } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import { authCommand } from './commands/auth.js';
import { chatCommand } from './commands/chat.js';
import { agentsCommand } from './commands/agents.js';
import { memoryCommand } from './commands/memory.js';
import { primeCommand } from './commands/prime.js';
import { configCommand } from './commands/config.js';
import { VERSION, BANNER } from './config/constants.js';

const program = new Command();

program
  .name('aleph')
  .description('Command-line companion for the Aleph PRNSA platform')
  .version(VERSION, '-v, --version', 'Display version number')
  .hook('preAction', () => {
    // Show banner on first command (except version/help)
    const args = process.argv.slice(2);
    if (!args.includes('-v') && !args.includes('--version') && 
        !args.includes('-h') && !args.includes('--help') &&
        args.length === 0) {
      console.log(boxen(BANNER, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
      }));
    }
  });

// Register commands
program.addCommand(authCommand);
program.addCommand(chatCommand);
program.addCommand(agentsCommand);
program.addCommand(memoryCommand);
program.addCommand(primeCommand);
program.addCommand(configCommand);

// Default action (no command)
program.action(() => {
  console.log(boxen(BANNER, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
  }));
  
  console.log(chalk.dim('\nAvailable commands:\n'));
  console.log(`  ${chalk.cyan('auth')}      Authentication & API tokens`);
  console.log(`  ${chalk.cyan('chat')}      Interactive chat with Aleph`);
  console.log(`  ${chalk.cyan('agents')}    Manage workflow agents`);
  console.log(`  ${chalk.cyan('memory')}    Memory field operations`);
  console.log(`  ${chalk.cyan('prime')}     Prime resonance utilities`);
  console.log(`  ${chalk.cyan('config')}    Configuration management`);
  console.log(chalk.dim('\nRun `aleph <command> --help` for more information.\n'));
});

export function run(argv: string[]) {
  program.parse(argv);
}

export { program };
