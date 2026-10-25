import { describe, expect, it } from 'vitest';
import { collectAppStorage, exportCalculatorIds, scenariosCSV } from '@/lib/app-data-export';
import { scenarioStorageKey } from '@/lib/calculator-scenarios';

describe('app data export', () => {
  it('exports all seven calculator records and supported progress/preferences but never auth or unrelated storage', () => {
    const values: Record<string, string> = {
      'learning-progress': '["gs-1"]', 'hydraulics-beginner-mode': 'true',
      'sb-project-auth-token': '{"access_token":"test-secret"}', 'unrelated': '"private"',
    };
    for (const id of exportCalculatorIds) values[scenarioStorageKey(id)] = '[null,null]';
    const result = collectAppStorage({ getItem: key => values[key] ?? null });
    expect(exportCalculatorIds).toHaveLength(7);
    expect(Object.keys(result.data)).toHaveLength(9);
    expect(result.data['learning-progress']).toEqual(['gs-1']);
    expect(result.data['hydraulics-beginner-mode']).toBe(true);
    expect(JSON.stringify(result)).not.toContain('test-secret');
    expect(result.data).not.toHaveProperty('unrelated');
  });

  it('reports unreadable saved data rather than silently omitting it', () => {
    const result = collectAppStorage({ getItem: key => key === 'learning-progress' ? '{broken' : null });
    expect(result.warnings).toEqual(['Skipped invalid saved data: learning-progress']);
    expect(result.data).not.toHaveProperty('learning-progress');
  });

  it('exports input/result values with timestamps, escaped CSV cells and formula protection', () => {
    const csv = scenariosCSV([{ name: '=SUM(A1)', savedAt: '2026-10-25T17:00:00Z', inputs: [{ label: 'Width, "main"', value: 5, unit: 'm' }], results: [{ label: 'Velocity', value: 2, unit: 'm/s' }] }, null]);
    expect(csv).toContain('"\'=SUM(A1)"');
    expect(csv).toContain('"Width, ""main"""');
    expect(csv).toContain('"inputs","Width, ""main""","5","m"');
    expect(csv).toContain('"results","Velocity","2","m/s"');
    expect(csv).toContain('2026-10-25T17:00:00Z');
  });
});