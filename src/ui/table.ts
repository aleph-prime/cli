import Table from 'cli-table3';
import chalk from 'chalk';

interface TableOptions {
  head: string[];
  colWidths?: number[];
  style?: {
    head?: string[];
    border?: string[];
  };
}

export function createTable(options: TableOptions): Table.Table {
  return new Table({
    head: options.head.map(h => chalk.cyan(h)),
    colWidths: options.colWidths,
    style: {
      head: options.style?.head || [],
      border: options.style?.border || ['dim'],
    },
    chars: {
      'top': '─',
      'top-mid': '┬',
      'top-left': '┌',
      'top-right': '┐',
      'bottom': '─',
      'bottom-mid': '┴',
      'bottom-left': '└',
      'bottom-right': '┘',
      'left': '│',
      'left-mid': '├',
      'mid': '─',
      'mid-mid': '┼',
      'right': '│',
      'right-mid': '┤',
      'middle': '│',
    },
  });
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return chalk.dim('—');
  
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Less than 1 minute
  if (diff < 60000) {
    return chalk.green('just now');
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return chalk.yellow(`${mins}m ago`);
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }
  
  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }
  
  // Format as date
  return date.toLocaleDateString();
}

export function formatStatus(status: string): string {
  const statusColors: Record<string, (s: string) => string> = {
    active: chalk.green,
    completed: chalk.green,
    running: chalk.cyan,
    pending: chalk.yellow,
    failed: chalk.red,
    cancelled: chalk.dim,
    inactive: chalk.dim,
    accepted: chalk.green,
    rejected: chalk.red,
  };
  
  const colorFn = statusColors[status.toLowerCase()] || chalk.white;
  return colorFn(status);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
