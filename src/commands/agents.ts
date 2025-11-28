import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { api, requireAuth } from '../lib/api.js';
import { startSpinner, succeedSpinner, failSpinner } from '../ui/spinner.js';
import { createTable, formatDate, formatStatus, truncate } from '../ui/table.js';
import { STATUS } from '../config/constants.js';
import type { Agent, AgentRun } from '../types/index.js';

export const agentsCommand = new Command('agents')
  .description('Manage workflow agents');

// List agents
agentsCommand
  .command('list')
  .alias('ls')
  .description('List all agents')
  .option('--active', 'Show only active agents')
  .action(async (options) => {
    if (!requireAuth()) return;
    
    startSpinner('Fetching agents...');
    
    const response = await api.get<{ agents: Agent[] }>(api.endpoints.agents);
    
    if (response.error) {
      failSpinner('Failed to fetch agents');
      console.log(chalk.red(`\n${response.error.error}`));
      return;
    }
    
    succeedSpinner('Agents retrieved');
    
    let agents = response.data?.agents || [];
    
    if (options.active) {
      agents = agents.filter(a => a.is_active);
    }
    
    if (agents.length === 0) {
      console.log(chalk.dim('\nNo agents found.'));
      console.log(chalk.dim('Create one with: aleph agents create\n'));
      return;
    }
    
    const table = createTable({
      head: ['Name', 'Type', 'Status', 'Runs', 'Last Run'],
    });
    
    for (const agent of agents) {
      table.push([
        truncate(agent.name, 25),
        chalk.dim(agent.trigger_type),
        formatStatus(agent.is_active ? 'active' : 'inactive'),
        agent.run_count.toString(),
        formatDate(agent.last_triggered_at),
      ]);
    }
    
    console.log('\n' + table.toString() + '\n');
  });

// Show agent details
agentsCommand
  .command('show <id>')
  .description('Show agent details')
  .action(async (id) => {
    if (!requireAuth()) return;
    
    startSpinner('Fetching agent...');
    
    const response = await api.get<Agent>(`${api.endpoints.agents}/${id}`);
    
    if (response.error) {
      failSpinner('Failed to fetch agent');
      console.log(chalk.red(`\n${response.error.error}`));
      return;
    }
    
    succeedSpinner('Agent retrieved');
    
    const agent = response.data!;
    
    console.log(`
${chalk.bold(agent.name)}
${chalk.dim(agent.description || 'No description')}

${chalk.dim('ID:')}           ${agent.id}
${chalk.dim('Type:')}         ${agent.trigger_type}
${chalk.dim('Status:')}       ${formatStatus(agent.is_active ? 'active' : 'inactive')}
${chalk.dim('Runs:')}         ${agent.run_count}
${chalk.dim('Last Run:')}     ${formatDate(agent.last_triggered_at)}
${chalk.dim('Created:')}      ${formatDate(agent.created_at)}

${chalk.dim('Steps:')} ${agent.task_config?.steps?.length || 0}
${(agent.task_config?.steps || []).map((step: any, i: number) => 
  `  ${i + 1}. ${step.name} (${step.type})`
).join('\n')}
`);
  });

// Run agent
agentsCommand
  .command('run <id>')
  .description('Execute an agent')
  .option('-i, --input <json>', 'Input data as JSON')
  .option('-w, --wait', 'Wait for completion')
  .action(async (id, options) => {
    if (!requireAuth()) return;
    
    let inputData = {};
    if (options.input) {
      try {
        inputData = JSON.parse(options.input);
      } catch {
        console.log(chalk.red(`${STATUS.error} Invalid JSON input`));
        return;
      }
    }
    
    startSpinner('Starting agent run...');
    
    const response = await api.post<AgentRun>(
      `${api.endpoints.agents}/${id}/runs`,
      { input_data: inputData }
    );
    
    if (response.error) {
      failSpinner('Failed to start agent');
      console.log(chalk.red(`\n${response.error.error}`));
      return;
    }
    
    succeedSpinner('Agent run started');
    
    const run = response.data!;
    console.log(chalk.dim(`\nRun ID: ${run.id}`));
    console.log(chalk.dim(`Status: ${formatStatus(run.status)}`));
    
    if (options.wait) {
      console.log(chalk.dim('\nWaiting for completion...'));
      await pollRunStatus(id, run.id);
    } else {
      console.log(chalk.dim(`\nCheck status: aleph agents logs ${id} --run ${run.id}\n`));
    }
  });

// Show agent logs/runs
agentsCommand
  .command('logs <id>')
  .description('Show agent run history')
  .option('--run <runId>', 'Show specific run details')
  .option('-n, --limit <number>', 'Number of runs to show', '10')
  .action(async (id, options) => {
    if (!requireAuth()) return;
    
    if (options.run) {
      // Show specific run
      startSpinner('Fetching run details...');
      
      const response = await api.get<AgentRun & { steps: any[] }>(
        `${api.endpoints.agents}/${id}/runs/${options.run}`
      );
      
      if (response.error) {
        failSpinner('Failed to fetch run');
        console.log(chalk.red(`\n${response.error.error}`));
        return;
      }
      
      succeedSpinner('Run details retrieved');
      
      const run = response.data!;
      
      console.log(`
${chalk.bold('Run Details')}

${chalk.dim('ID:')}       ${run.id}
${chalk.dim('Status:')}   ${formatStatus(run.status)}
${chalk.dim('Progress:')} ${run.current_step}/${run.total_steps} steps
${chalk.dim('Started:')}  ${formatDate(run.started_at)}
${chalk.dim('Completed:')} ${formatDate(run.completed_at)}
${run.error_message ? chalk.red(`\nError: ${run.error_message}`) : ''}

${chalk.bold('Steps:')}
${(run.steps || []).map((step: any, i: number) => {
  const status = step.status === 'completed' ? STATUS.success :
                 step.status === 'failed' ? STATUS.error :
                 step.status === 'running' ? STATUS.running :
                 STATUS.pending;
  const duration = step.duration_ms ? chalk.dim(` (${step.duration_ms}ms)`) : '';
  return `  ${status} ${step.step_name}${duration}`;
}).join('\n')}
`);
    } else {
      // Show run history
      startSpinner('Fetching run history...');
      
      const response = await api.get<{ runs: AgentRun[] }>(
        `${api.endpoints.agents}/${id}/runs?limit=${options.limit}`
      );
      
      if (response.error) {
        failSpinner('Failed to fetch runs');
        console.log(chalk.red(`\n${response.error.error}`));
        return;
      }
      
      succeedSpinner('Run history retrieved');
      
      const runs = response.data?.runs || [];
      
      if (runs.length === 0) {
        console.log(chalk.dim('\nNo runs found for this agent.\n'));
        return;
      }
      
      const table = createTable({
        head: ['Run ID', 'Status', 'Progress', 'Triggered', 'Started'],
      });
      
      for (const run of runs) {
        table.push([
          run.id.slice(0, 8),
          formatStatus(run.status),
          `${run.current_step}/${run.total_steps}`,
          run.triggered_by,
          formatDate(run.started_at),
        ]);
      }
      
      console.log('\n' + table.toString() + '\n');
    }
  });

// Delete agent
agentsCommand
  .command('delete <id>')
  .description('Delete an agent')
  .option('-f, --force', 'Skip confirmation')
  .action(async (id, options) => {
    if (!requireAuth()) return;
    
    if (!options.force) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to delete agent ${id}?`,
          default: false,
        },
      ]);
      
      if (!confirm) {
        console.log(chalk.dim('Cancelled'));
        return;
      }
    }
    
    startSpinner('Deleting agent...');
    
    const response = await api.delete(`${api.endpoints.agents}/${id}`);
    
    if (response.error) {
      failSpinner('Failed to delete agent');
      console.log(chalk.red(`\n${response.error.error}`));
      return;
    }
    
    succeedSpinner('Agent deleted');
  });

// Helper to poll run status
async function pollRunStatus(agentId: string, runId: string): Promise<void> {
  const maxAttempts = 60;
  const interval = 2000;
  
  for (let i = 0; i < maxAttempts; i++) {
    const response = await api.get<AgentRun>(
      `${api.endpoints.agents}/${agentId}/runs/${runId}`
    );
    
    if (response.error) {
      console.log(chalk.red(`\n${STATUS.error} ${response.error.error}`));
      return;
    }
    
    const run = response.data!;
    
    process.stdout.write(`\r${STATUS.running} ${run.current_step}/${run.total_steps} steps...`);
    
    if (run.status === 'completed') {
      console.log(`\r${STATUS.success} Completed successfully!          `);
      return;
    }
    
    if (run.status === 'failed') {
      console.log(`\r${STATUS.error} Failed: ${run.error_message}          `);
      return;
    }
    
    if (run.status === 'cancelled') {
      console.log(`\r${STATUS.warning} Cancelled          `);
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  console.log(chalk.yellow(`\n${STATUS.warning} Timed out waiting for completion`));
}
