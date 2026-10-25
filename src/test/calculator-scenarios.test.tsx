import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScenarioComparison } from '@/components/ChannelVisualizer/ScenarioComparison';
import { captureScenario, readScenarios, replaceScenario, scenarioDifference, scenarioStorageKey, type ScenarioPair } from '@/lib/calculator-scenarios';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('calculator scenarios', () => {
  it('retains exactly two independent input sets when one is replaced', () => {
    const a = captureScenario('A', { depth: 0.3 }, [], []);
    const b = captureScenario('B', { depth: 0.1 }, [], []);
    const pair: ScenarioPair<{ depth: number }> = [a, b];
    const updated = replaceScenario(pair, 0, captureScenario('A2', { depth: 0.5 }, [], []));
    expect(updated).toHaveLength(2);
    expect(updated[0]?.state.depth).toBe(0.5);
    expect(updated[1]?.state.depth).toBe(0.1);
    expect(pair[0]?.state.depth).toBe(0.3);
  });

  it('captures a detached copy including nested and observed inputs', () => {
    const state = { params: { width: 5 }, observed: [{ stage: 1, discharge: 8 }] };
    const scenario = captureScenario('A', state, [{ label: 'Width', value: 5 }], []);
    state.params.width = 9;
    state.observed[0].discharge = 20;
    expect(scenario.state).toEqual({ params: { width: 5 }, observed: [{ stage: 1, discharge: 8 }] });
  });

  it('persists each calculator independently and tolerates corrupt storage', () => {
    localStorage.setItem(scenarioStorageKey('gvf'), JSON.stringify([captureScenario('A', { depth: 2 }, [], []), null]));
    expect(readScenarios<{ depth: number }>('gvf')[0]?.state.depth).toBe(2);
    expect(readScenarios('culvert')).toEqual([null, null]);
    localStorage.setItem(scenarioStorageKey('gvf'), '{broken');
    expect(readScenarios('gvf')).toEqual([null, null]);
  });

  it('computes B minus A only for matching numeric units', () => {
    expect(scenarioDifference({ label: 'Depth', value: 2, unit: 'm' }, { label: 'Depth', value: 3.5, unit: 'm' })).toBe('+1.5 m');
    expect(scenarioDifference({ label: 'Depth', value: 2, unit: 'm' }, { label: 'Depth', value: 3, unit: 'ft' })).toBe('—');
  });

  it('saves two changed inputs and restores either snapshot after remount', () => {
    const restore = vi.fn();
    const props = { calculatorId: 'jump', state: { depth: 0.3 }, inputs: [{ label: 'Depth', value: 0.3, unit: 'm' }], results: [{ label: 'Energy loss', value: 2, unit: 'm' }], onRestore: restore };
    const view = render(<ScenarioComparison {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Compare Scenarios' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save A' }));
    view.rerender(<ScenarioComparison {...props} state={{ depth: 0.1 }} inputs={[{ label: 'Depth', value: 0.1, unit: 'm' }]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save B' }));
    view.unmount();
    render(<ScenarioComparison {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Compare Scenarios' }));
    fireEvent.click(screen.getByRole('button', { name: 'Load B' }));
    expect(restore).toHaveBeenLastCalledWith({ depth: 0.1 });
    fireEvent.click(screen.getByRole('button', { name: 'Load A' }));
    expect(restore).toHaveBeenLastCalledWith({ depth: 0.3 });
    fireEvent.click(screen.getByRole('button', { name: 'Delete scenario A' }));
    expect(readScenarios('jump')[0]).toBeNull();
    expect(readScenarios<{ depth: number }>('jump')[1]?.state.depth).toBe(0.1);
  });
});