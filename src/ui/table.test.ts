import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTable, formatDate, formatStatus, truncate, formatNumber } from './table.js';

describe('createTable', () => {
  it('creates a table with headers', () => {
    const table = createTable({
      head: ['Name', 'Value'],
    });
    
    expect(table).toBeDefined();
    expect(typeof table.push).toBe('function');
    expect(typeof table.toString).toBe('function');
  });

  it('renders table with data', () => {
    const table = createTable({
      head: ['Name', 'Value'],
      colWidths: [15, 15],
    });
    
    table.push(['foo', 'bar']);
    table.push(['baz', 'qux']);
    
    const output = table.toString();
    expect(output).toContain('foo');
    expect(output).toContain('bar');
    expect(output).toContain('baz');
    expect(output).toContain('qux');
  });

  it('uses box-drawing characters', () => {
    const table = createTable({
      head: ['Col1'],
      colWidths: [10],
    });
    
    table.push(['data']);
    const output = table.toString();
    
    expect(output).toContain('─');
    expect(output).toContain('│');
  });
});

describe('formatDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns dash for null', () => {
    const result = formatDate(null);
    expect(result).toContain('—');
  });

  it('returns "just now" for very recent dates', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    vi.setSystemTime(now);
    
    const recent = new Date(now.getTime() - 30000).toISOString(); // 30 seconds ago
    const result = formatDate(recent);
    
    expect(result).toContain('just now');
  });

  it('returns minutes ago for dates within an hour', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    vi.setSystemTime(now);
    
    const fiveMinAgo = new Date(now.getTime() - 5 * 60000).toISOString();
    const result = formatDate(fiveMinAgo);
    
    expect(result).toContain('5m ago');
  });

  it('returns hours ago for dates within a day', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    vi.setSystemTime(now);
    
    const threeHoursAgo = new Date(now.getTime() - 3 * 3600000).toISOString();
    const result = formatDate(threeHoursAgo);
    
    expect(result).toContain('3h ago');
  });

  it('returns days ago for dates within a week', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    vi.setSystemTime(now);
    
    const twoDaysAgo = new Date(now.getTime() - 2 * 86400000).toISOString();
    const result = formatDate(twoDaysAgo);
    
    expect(result).toContain('2d ago');
  });

  it('returns formatted date for older dates', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    vi.setSystemTime(now);
    
    const oldDate = new Date('2024-01-01T12:00:00Z').toISOString();
    const result = formatDate(oldDate);
    
    // Should be a formatted date string (locale-dependent)
    expect(result).toBeTruthy();
    expect(result).not.toContain('ago');
    expect(result).not.toContain('just now');
  });
});

describe('formatStatus', () => {
  it('formats active status with green', () => {
    const result = formatStatus('active');
    expect(result).toContain('active');
  });

  it('formats completed status with green', () => {
    const result = formatStatus('completed');
    expect(result).toContain('completed');
  });

  it('formats running status with cyan', () => {
    const result = formatStatus('running');
    expect(result).toContain('running');
  });

  it('formats pending status with yellow', () => {
    const result = formatStatus('pending');
    expect(result).toContain('pending');
  });

  it('formats failed status with red', () => {
    const result = formatStatus('failed');
    expect(result).toContain('failed');
  });

  it('formats cancelled status with dim', () => {
    const result = formatStatus('cancelled');
    expect(result).toContain('cancelled');
  });

  it('formats inactive status with dim', () => {
    const result = formatStatus('inactive');
    expect(result).toContain('inactive');
  });

  it('formats unknown status without crashing', () => {
    const result = formatStatus('unknown');
    expect(result).toContain('unknown');
  });

  it('is case insensitive', () => {
    const result = formatStatus('ACTIVE');
    expect(result.toLowerCase()).toContain('active');
  });
});

describe('truncate', () => {
  it('returns original string if shorter than maxLength', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('returns original string if equal to maxLength', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('truncates and adds ellipsis for longer strings', () => {
    const result = truncate('hello world', 8);
    expect(result).toHaveLength(8);
    expect(result.endsWith('…')).toBe(true);
    expect(result).toBe('hello w…');
  });

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('');
  });

  it('handles maxLength of 1', () => {
    const result = truncate('hello', 1);
    expect(result).toBe('…');
  });
});

describe('formatNumber', () => {
  it('returns number as string for small numbers', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(1)).toBe('1');
    expect(formatNumber(999)).toBe('999');
  });

  it('formats thousands with K suffix', () => {
    expect(formatNumber(1000)).toBe('1.0K');
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(999999)).toBe('1000.0K');
  });

  it('formats millions with M suffix', () => {
    expect(formatNumber(1000000)).toBe('1.0M');
    expect(formatNumber(2500000)).toBe('2.5M');
  });
});