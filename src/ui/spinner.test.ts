import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  startSpinner,
  succeedSpinner,
  failSpinner,
  warnSpinner,
  updateSpinner,
  stopSpinner,
  ProgressIndicator,
} from './spinner.js';

// We can't fully mock ora in tests, so we'll test the behavior patterns
describe('spinner functions', () => {
  beforeEach(() => {
    // Reset any active spinners between tests
    stopSpinner();
  });

  afterEach(() => {
    stopSpinner();
  });

  describe('startSpinner', () => {
    it('returns a spinner instance', () => {
      const spinner = startSpinner('Loading...');
      expect(spinner).toBeDefined();
      expect(spinner.text).toBe('Loading...');
      spinner.stop();
    });

    it('stops previous spinner when starting a new one', () => {
      const spinner1 = startSpinner('First');
      const spinner2 = startSpinner('Second');
      
      // The second call should have stopped the first spinner
      expect(spinner2.text).toBe('Second');
      spinner2.stop();
    });
  });

  describe('succeedSpinner', () => {
    it('does nothing if no spinner is active', () => {
      // Should not throw
      expect(() => succeedSpinner('Done')).not.toThrow();
    });

    it('succeeds active spinner with message', () => {
      startSpinner('Loading...');
      // Should not throw
      expect(() => succeedSpinner('Completed!')).not.toThrow();
    });
  });

  describe('failSpinner', () => {
    it('does nothing if no spinner is active', () => {
      expect(() => failSpinner('Error')).not.toThrow();
    });

    it('fails active spinner with message', () => {
      startSpinner('Loading...');
      expect(() => failSpinner('Failed!')).not.toThrow();
    });
  });

  describe('warnSpinner', () => {
    it('does nothing if no spinner is active', () => {
      expect(() => warnSpinner('Warning')).not.toThrow();
    });

    it('warns active spinner with message', () => {
      startSpinner('Loading...');
      expect(() => warnSpinner('Caution!')).not.toThrow();
    });
  });

  describe('updateSpinner', () => {
    it('does nothing if no spinner is active', () => {
      expect(() => updateSpinner('New text')).not.toThrow();
    });

    it('updates active spinner text', () => {
      const spinner = startSpinner('Loading...');
      updateSpinner('Still loading...');
      expect(spinner.text).toBe('Still loading...');
      spinner.stop();
    });
  });

  describe('stopSpinner', () => {
    it('does nothing if no spinner is active', () => {
      expect(() => stopSpinner()).not.toThrow();
    });

    it('stops active spinner', () => {
      startSpinner('Loading...');
      expect(() => stopSpinner()).not.toThrow();
    });
  });
});

describe('ProgressIndicator', () => {
  describe('constructor', () => {
    it('creates indicator with steps', () => {
      const indicator = new ProgressIndicator(['Step 1', 'Step 2', 'Step 3']);
      expect(indicator).toBeDefined();
    });
  });

  describe('start', () => {
    it('starts the progress indicator', () => {
      const indicator = new ProgressIndicator(['Step 1', 'Step 2']);
      expect(() => indicator.start()).not.toThrow();
      indicator.fail(); // Clean up
    });
  });

  describe('next', () => {
    it('advances to next step on success', () => {
      const indicator = new ProgressIndicator(['Step 1', 'Step 2', 'Step 3']);
      indicator.start();
      expect(() => indicator.next(true)).not.toThrow();
      indicator.fail(); // Clean up
    });

    it('handles failure on current step', () => {
      const indicator = new ProgressIndicator(['Step 1', 'Step 2']);
      indicator.start();
      expect(() => indicator.next(false)).not.toThrow();
      indicator.fail(); // Clean up
    });
  });

  describe('complete', () => {
    it('completes the progress indicator', () => {
      const indicator = new ProgressIndicator(['Step 1']);
      indicator.start();
      expect(() => indicator.complete('All done!')).not.toThrow();
    });

    it('completes with default message', () => {
      const indicator = new ProgressIndicator(['Step 1']);
      indicator.start();
      expect(() => indicator.complete()).not.toThrow();
    });
  });

  describe('fail', () => {
    it('fails the progress indicator', () => {
      const indicator = new ProgressIndicator(['Step 1']);
      indicator.start();
      expect(() => indicator.fail('Something went wrong')).not.toThrow();
    });

    it('fails with default message', () => {
      const indicator = new ProgressIndicator(['Step 1']);
      indicator.start();
      expect(() => indicator.fail()).not.toThrow();
    });
  });
});