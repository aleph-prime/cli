import ora, { Ora } from 'ora';
import chalk from 'chalk';

let currentSpinner: Ora | null = null;

export function startSpinner(text: string): Ora {
  if (currentSpinner) {
    currentSpinner.stop();
  }
  currentSpinner = ora({
    text,
    spinner: 'dots',
    color: 'cyan',
  }).start();
  return currentSpinner;
}

export function succeedSpinner(text?: string): void {
  if (currentSpinner) {
    currentSpinner.succeed(text);
    currentSpinner = null;
  }
}

export function failSpinner(text?: string): void {
  if (currentSpinner) {
    currentSpinner.fail(text);
    currentSpinner = null;
  }
}

export function warnSpinner(text?: string): void {
  if (currentSpinner) {
    currentSpinner.warn(text);
    currentSpinner = null;
  }
}

export function updateSpinner(text: string): void {
  if (currentSpinner) {
    currentSpinner.text = text;
  }
}

export function stopSpinner(): void {
  if (currentSpinner) {
    currentSpinner.stop();
    currentSpinner = null;
  }
}

// Progress indicator for multi-step operations
export class ProgressIndicator {
  private steps: string[];
  private currentStep: number = 0;
  private spinner: Ora | null = null;

  constructor(steps: string[]) {
    this.steps = steps;
  }

  start(): void {
    this.currentStep = 0;
    this.showCurrentStep();
  }

  private showCurrentStep(): void {
    if (this.spinner) {
      this.spinner.stop();
    }
    
    const step = this.steps[this.currentStep];
    const progress = chalk.dim(`[${this.currentStep + 1}/${this.steps.length}]`);
    
    this.spinner = ora({
      text: `${progress} ${step}`,
      spinner: 'dots',
      color: 'cyan',
    }).start();
  }

  next(success: boolean = true): void {
    if (this.spinner) {
      if (success) {
        this.spinner.succeed();
      } else {
        this.spinner.fail();
      }
    }
    
    this.currentStep++;
    
    if (this.currentStep < this.steps.length) {
      this.showCurrentStep();
    }
  }

  complete(message?: string): void {
    if (this.spinner) {
      this.spinner.succeed(message || 'Complete');
      this.spinner = null;
    }
  }

  fail(message?: string): void {
    if (this.spinner) {
      this.spinner.fail(message || 'Failed');
      this.spinner = null;
    }
  }
}
