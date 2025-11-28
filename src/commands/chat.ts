import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import boxen from 'boxen';
import { Marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import { isAuthenticated, getConfig } from '../config/index.js';
import { api, requireAuth } from '../lib/api.js';
import { startSpinner, stopSpinner, failSpinner } from '../ui/spinner.js';
import { textToPrimes, visualizePrimes } from '../lib/prime.js';
import { STATUS, DEFAULTS } from '../config/constants.js';
import type { ChatMessage } from '../types/index.js';

// Setup marked with terminal renderer
const marked = new Marked(markedTerminal() as any);

export const chatCommand = new Command('chat')
  .description('Interactive chat with Aleph')
  .argument('[message]', 'Single message to send (or enter interactive mode)')
  .option('-m, --model <model>', 'Model to use', DEFAULTS.model)
  .option('-s, --system <prompt>', 'Custom system prompt')
  .option('--no-stream', 'Disable streaming output')
  .option('--show-primes', 'Show prime factorization of responses')
  .action(async (message, options) => {
    if (!requireAuth()) {
      process.exit(1);
    }
    
    const model = options.model || getConfig('defaultModel') || DEFAULTS.model;
    const stream = options.stream !== false && getConfig('streamEnabled') !== false;
    
    if (message) {
      // Single message mode
      await sendSingleMessage(message, { model, stream, systemPrompt: options.system, showPrimes: options.showPrimes });
    } else {
      // Interactive REPL mode
      await startInteractiveChat({ model, stream, systemPrompt: options.system, showPrimes: options.showPrimes });
    }
  });

interface ChatOptions {
  model: string;
  stream: boolean;
  systemPrompt?: string;
  showPrimes?: boolean;
}

async function sendSingleMessage(message: string, options: ChatOptions): Promise<void> {
  const messages: ChatMessage[] = [
    { role: 'user', content: message },
  ];
  
  console.log(chalk.dim('\nYou: ') + message + '\n');
  
  if (options.stream) {
    process.stdout.write(chalk.cyan('ℵ: '));
    
    let fullResponse = '';
    
    await api.stream(
      api.endpoints.chat,
      {
        messages,
        model: options.model,
        system_prompt: options.systemPrompt,
      },
      (chunk) => {
        process.stdout.write(chunk);
        fullResponse += chunk;
      },
      () => {
        console.log('\n');
        
        if (options.showPrimes) {
          showPrimeFactors(fullResponse);
        }
      },
      (error) => {
        console.log(chalk.red(`\n\n${STATUS.error} ${error.message}`));
      }
    );
  } else {
    startSpinner('Thinking...');
    
    const response = await api.post<{
      choices: Array<{ message: { content: string } }>;
    }>(api.endpoints.chat, {
      messages,
      model: options.model,
      system_prompt: options.systemPrompt,
      stream: false,
    });
    
    stopSpinner();
    
    if (response.error) {
      console.log(chalk.red(`${STATUS.error} ${response.error.error}`));
      return;
    }
    
    const content = response.data?.choices?.[0]?.message?.content || '';
    console.log(chalk.cyan('ℵ: ') + await marked.parse(content));
    
    if (options.showPrimes) {
      showPrimeFactors(content);
    }
  }
}

async function startInteractiveChat(options: ChatOptions): Promise<void> {
  const messages: ChatMessage[] = [];
  
  console.log(boxen(
    `${chalk.cyan('ℵ')} ${chalk.bold('Aleph Chat')}\n\n` +
    `${chalk.dim('Model:')} ${options.model}\n` +
    `${chalk.dim('Stream:')} ${options.stream ? 'enabled' : 'disabled'}\n\n` +
    `${chalk.dim('Commands:')}\n` +
    `  ${chalk.cyan('/clear')}   Clear conversation\n` +
    `  ${chalk.cyan('/model')}   Change model\n` +
    `  ${chalk.cyan('/primes')} Toggle prime display\n` +
    `  ${chalk.cyan('/exit')}    Exit chat`,
    {
      padding: 1,
      margin: { top: 1, bottom: 1, left: 0, right: 0 },
      borderStyle: 'round',
      borderColor: 'cyan',
    }
  ));
  
  let showPrimes = options.showPrimes || false;
  let currentModel = options.model;
  
  while (true) {
    const { input } = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: chalk.green('You:'),
        prefix: '',
      },
    ]);
    
    const trimmed = input.trim();
    
    if (!trimmed) continue;
    
    // Handle commands
    if (trimmed.startsWith('/')) {
      const [cmd, ...args] = trimmed.slice(1).split(' ');
      
      switch (cmd.toLowerCase()) {
        case 'exit':
        case 'quit':
        case 'q':
          console.log(chalk.dim('\nGoodbye!\n'));
          return;
          
        case 'clear':
          messages.length = 0;
          console.log(chalk.dim('Conversation cleared\n'));
          continue;
          
        case 'model':
          if (args.length > 0) {
            currentModel = args.join(' ');
            console.log(chalk.dim(`Model changed to: ${currentModel}\n`));
          } else {
            console.log(chalk.dim(`Current model: ${currentModel}\n`));
          }
          continue;
          
        case 'primes':
          showPrimes = !showPrimes;
          console.log(chalk.dim(`Prime display: ${showPrimes ? 'enabled' : 'disabled'}\n`));
          continue;
          
        case 'help':
          console.log(chalk.dim(`
Commands:
  /clear    Clear conversation history
  /model    Show or change model (/model <name>)
  /primes   Toggle prime factorization display
  /exit     Exit chat
`));
          continue;
          
        default:
          console.log(chalk.yellow(`Unknown command: ${cmd}\n`));
          continue;
      }
    }
    
    // Add user message
    messages.push({ role: 'user', content: trimmed });
    
    if (options.stream) {
      process.stdout.write(chalk.cyan('\nℵ: '));
      
      let fullResponse = '';
      
      await api.stream(
        api.endpoints.chat,
        {
          messages,
          model: currentModel,
          system_prompt: options.systemPrompt,
        },
        (chunk) => {
          process.stdout.write(chunk);
          fullResponse += chunk;
        },
        () => {
          console.log('\n');
          messages.push({ role: 'assistant', content: fullResponse });
          
          if (showPrimes) {
            showPrimeFactors(fullResponse);
          }
        },
        (error) => {
          console.log(chalk.red(`\n\n${STATUS.error} ${error.message}\n`));
          // Remove failed user message
          messages.pop();
        }
      );
    } else {
      startSpinner('Thinking...');
      
      const response = await api.post<{
        choices: Array<{ message: { content: string } }>;
      }>(api.endpoints.chat, {
        messages,
        model: currentModel,
        system_prompt: options.systemPrompt,
        stream: false,
      });
      
      stopSpinner();
      
      if (response.error) {
        console.log(chalk.red(`${STATUS.error} ${response.error.error}\n`));
        messages.pop();
        continue;
      }
      
      const content = response.data?.choices?.[0]?.message?.content || '';
      messages.push({ role: 'assistant', content });
      
      console.log(chalk.cyan('\nℵ: ') + await marked.parse(content));
      
      if (showPrimes) {
        showPrimeFactors(content);
      }
    }
  }
}

function showPrimeFactors(text: string): void {
  const { primes, resonanceSignature } = textToPrimes(text);
  
  console.log(boxen(
    `${chalk.dim('Prime Factors')}\n\n` +
    `${chalk.dim('Signature:')} ${chalk.cyan(resonanceSignature)}\n\n` +
    visualizePrimes(primes.slice(0, 10), 40),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'dim',
      dimBorder: true,
    }
  ));
}
