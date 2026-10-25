export interface ScenarioRow {
  label: string;
  value: number | string | boolean | null;
  unit?: string;
}

export interface CalculatorScenario<T> {
  name: string;
  savedAt: string;
  state: T;
  inputs: ScenarioRow[];
  results: ScenarioRow[];
}

export type ScenarioPair<T> = [CalculatorScenario<T> | null, CalculatorScenario<T> | null];

export const scenarioStorageKey = (calculatorId: string) => `hydraulics-scenarios-v1:${calculatorId}`;

export function captureScenario<T>(name: string, state: T, inputs: ScenarioRow[], results: ScenarioRow[]): CalculatorScenario<T> {
  return JSON.parse(JSON.stringify({ name, savedAt: new Date().toISOString(), state, inputs, results }));
}

export function replaceScenario<T>(pair: ScenarioPair<T>, slot: 0 | 1, scenario: CalculatorScenario<T> | null): ScenarioPair<T> {
  return slot === 0 ? [scenario, pair[1]] : [pair[0], scenario];
}

export function readScenarios<T>(calculatorId: string): ScenarioPair<T> {
  try {
    const value = JSON.parse(localStorage.getItem(scenarioStorageKey(calculatorId)) || 'null');
    if (!Array.isArray(value) || value.length !== 2) return [null, null];
    return value.map(item => {
      if (item === null) return null;
      const validRows = (rows: unknown) => Array.isArray(rows) && rows.every(row =>
        row && typeof row.label === 'string' && ['number', 'string', 'boolean', 'object'].includes(typeof row.value) &&
        (typeof row.value !== 'object' || row.value === null));
      return item && typeof item.name === 'string' && typeof item.savedAt === 'string' && item.state &&
        validRows(item.inputs) && validRows(item.results) ? item : null;
    }) as ScenarioPair<T>;
  } catch {
    return [null, null];
  }
}

export function formatScenarioValue(row?: ScenarioRow): string {
  if (!row || row.value === null) return '—';
  const value = typeof row.value === 'number'
    ? Number.isFinite(row.value) ? Number(row.value.toPrecision(6)).toString() : '—'
    : typeof row.value === 'boolean' ? row.value ? 'Yes' : 'No' : row.value;
  return `${value}${row.unit ? ` ${row.unit}` : ''}`;
}

export function scenarioDifference(a?: ScenarioRow, b?: ScenarioRow): string {
  if (!a || !b || a.unit !== b.unit || typeof a.value !== 'number' || typeof b.value !== 'number' ||
    !Number.isFinite(a.value) || !Number.isFinite(b.value)) return '—';
  const difference = b.value - a.value;
  return `${difference > 0 ? '+' : ''}${formatScenarioValue({ label: '', value: difference, unit: b.unit })}`;
}