import { useId, useState } from 'react';
import { Columns2, Save, RotateCcw, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { captureScenario, formatScenarioValue, readScenarios, replaceScenario, scenarioDifference, scenarioStorageKey, type ScenarioPair, type ScenarioRow } from '@/lib/calculator-scenarios';

interface Props<T> {
  calculatorId: string;
  state: T;
  inputs: ScenarioRow[];
  results: ScenarioRow[];
  onRestore: (state: T) => void;
  canSave?: boolean;
}

export function ScenarioComparison<T>({ calculatorId, state, inputs, results, onRestore, canSave = true }: Props<T>) {
  const id = useId();
  const [pair, setPair] = useState<ScenarioPair<T>>(() => readScenarios<T>(calculatorId));
  const [open, setOpen] = useState(false);
  const [names, setNames] = useState(() => [pair[0]?.name || 'Scenario A', pair[1]?.name || 'Scenario B']);
  const [status, setStatus] = useState('');

  const update = (next: ScenarioPair<T>) => {
    setPair(next);
    try {
      localStorage.setItem(scenarioStorageKey(calculatorId), JSON.stringify(next));
      return true;
    } catch {
      setStatus('Browser storage is unavailable; scenarios will remain available until you leave this page.');
      return false;
    }
  };

  const table = (group: 'inputs' | 'results', title: string) => {
    const labels = Array.from(new Set(pair.flatMap(item => item?.[group].map(row => row.label) || [])));
    if (!labels.length) return null;
    return <div className="space-y-2">
      <h4 className="text-sm font-semibold">{title}</h4>
      <div className="max-w-full overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[440px] text-xs sm:text-sm">
          <thead className="bg-muted"><tr>
            <th scope="col" className="p-3 text-left">Parameter</th>
            {pair.map((item, index) => <th scope="col" key={index} className="max-w-40 break-words p-3 text-right">{item?.name || `Scenario ${index === 0 ? 'A' : 'B'}`}</th>)}
            <th scope="col" className="p-3 text-right">Δ (B − A)</th>
          </tr></thead>
          <tbody>{labels.map(label => {
            const a = pair[0]?.[group].find(row => row.label === label);
            const b = pair[1]?.[group].find(row => row.label === label);
            const changed = a && b && (a.value !== b.value || a.unit !== b.unit);
            return <tr key={label} className={`border-t border-border ${changed ? 'bg-accent/10' : ''}`}>
              <th scope="row" className="p-3 text-left font-medium">{label}</th>
              <td className="max-w-48 break-words p-3 text-right font-mono">{formatScenarioValue(a)}</td>
              <td className="max-w-48 break-words p-3 text-right font-mono">{formatScenarioValue(b)}</td>
              <td className="p-3 text-right font-mono text-muted-foreground">{scenarioDifference(a, b)}</td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    </div>;
  };

  return <section aria-label="Compare Scenarios" className="min-w-0 space-y-4 border-y border-border py-4">
    <Button variant="outline" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={`${id}-comparison`}>
      <Columns2 className="mr-2 h-4 w-4" /> Compare Scenarios
      {open ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
    </Button>
    {open && <div id={`${id}-comparison`} className="min-w-0 space-y-4">
      <TooltipProvider><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {([0, 1] as const).map(slot => {
          const item = pair[slot];
          const letter = slot === 0 ? 'A' : 'B';
          return <div key={slot} className="min-w-0 space-y-2">
            <Label htmlFor={`${id}-name-${slot}`}>Scenario {letter} name</Label>
            <Input id={`${id}-name-${slot}`} maxLength={60} value={names[slot]} onChange={event => setNames(names.map((name, i) => i === slot ? event.target.value : name))} />
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant={slot === 0 ? 'default' : 'secondary'} disabled={!canSave} onClick={() => {
                const saved = captureScenario(names[slot].trim() || `Scenario ${letter}`, state, inputs, results);
                if (update(replaceScenario(pair, slot, saved))) setStatus(`${saved.name} saved on this device.`);
              }}><Save className="mr-2 h-4 w-4" />{item ? 'Update' : 'Save'} {letter}</Button>
              <Button size="sm" variant="outline" disabled={!item} onClick={() => {
                if (!item) return;
                onRestore(JSON.parse(JSON.stringify(item.state)) as T);
                setStatus(`${item.name} loaded into calculator.`);
              }}><RotateCcw className="mr-2 h-4 w-4" />Load {letter}</Button>
              <Tooltip><TooltipTrigger asChild>
                <Button size="icon" variant="ghost" disabled={!item} aria-label={`Delete scenario ${letter}`} onClick={() => {
                  if (update(replaceScenario(pair, slot, null))) setStatus(`Scenario ${letter} deleted.`);
                }}><Trash2 className="h-4 w-4" /></Button>
              </TooltipTrigger><TooltipContent>Delete scenario {letter}</TooltipContent></Tooltip>
            </div>
            <p className="text-xs text-muted-foreground">{item ? `Saved ${new Date(item.savedAt).toLocaleString()}` : 'Not saved'}</p>
          </div>;
        })}
      </div></TooltipProvider>
      {!canSave && <p className="text-sm text-destructive">A valid calculation is required before saving.</p>}
      <p role="status" className="text-xs text-muted-foreground">{status}</p>
      {table('inputs', 'Inputs')}
      {table('results', 'Results')}
    </div>}
  </section>;
}