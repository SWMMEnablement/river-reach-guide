import JSZip from 'jszip';
import { knowledgeBase } from '@/components/ConceptFinder/knowledgeBase';
import { learningPathways, sectionTargets } from '@/components/LearningPathways/pathwayData';
import { storyScenarios } from '@/components/StoryMode/storyScenarios';
import { gvfQuizQuestions, froudeQuizQuestions, culvertQuizQuestions, weirOrificeQuizQuestions, compoundChannelQuizQuestions } from '@/components/ChannelVisualizer/CalculatorQuiz';
import { scenarioStorageKey, type CalculatorScenario, type ScenarioRow } from './calculator-scenarios';

export const exportCalculatorIds = ['rating-curve', 'culvert', 'froude', 'gvf', 'weir', 'compound', 'hydraulic-jump'] as const;
export const exportStorageKeys = ['learning-progress', 'hydraulics-beginner-mode', ...exportCalculatorIds.map(scenarioStorageKey)] as const;

// These educational source files retain tables, scripts and examples that are not standalone datasets.
const referenceSources = import.meta.glob([
  '../components/ChannelVisualizer/AdvancedConceptsSection.tsx',
  '../components/ChannelVisualizer/QuickReferenceCard.tsx',
  '../components/ChannelVisualizer/RubyScriptsSection.tsx',
  '../components/ChannelVisualizer/SWMM5ChannelsSection.tsx',
  '../components/ChannelVisualizer/SWMM5ConduitsSection.tsx',
  '../components/ChannelVisualizer/SuDSSection.tsx',
  '../components/ChannelVisualizer/LIDControlsSection.tsx',
  '../components/ChannelVisualizer/TroubleshootingSection.tsx',
  '../components/ChannelVisualizer/TwoDModelingSection.tsx',
  '../components/ChannelVisualizer/CalculatorInsights.tsx',
  '../components/KnowledgeQuiz.tsx',
  '../components/GuidedDiagram/tutorialSteps.ts',
  './pdf-report-generator.ts',
  '../components/ChannelVisualizer/useHydraulicCalculations.ts',
  '../components/ChannelVisualizer/*Calculator.tsx',
  '../components/ChannelVisualizer/RatingCurveGenerator.tsx',
], { query: '?raw', import: 'default' });

const json = (value: unknown) => JSON.stringify(value, null, 2);
const csvCell = (value: unknown) => {
  const text = value === null || value === undefined ? '' : String(value);
  // Spreadsheet formula injection protection, including user-supplied scenario names.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

export function collectAppStorage(storage: Pick<Storage, 'getItem'>) {
  const data: Record<string, unknown> = {};
  const warnings: string[] = [];
  for (const key of exportStorageKeys) {
    try {
      const raw = storage.getItem(key);
      if (raw !== null) {
        try { data[key] = JSON.parse(raw); }
        catch { warnings.push(`Skipped invalid saved data: ${key}`); }
      }
    } catch { warnings.push(`Could not read saved data: ${key}`); }
  }
  return { data, warnings };
}

export function scenariosCSV(pair: unknown): string {
  const rows: unknown[][] = [['Slot', 'Scenario', 'Saved at (ISO)', 'Group', 'Parameter', 'Value', 'Unit']];
  if (Array.isArray(pair)) pair.slice(0, 2).forEach((item: CalculatorScenario<unknown> | null, index) => {
    if (!item || typeof item.name !== 'string') return;
    for (const group of ['inputs', 'results'] as const) {
      if (!Array.isArray(item[group])) continue;
      item[group].forEach((row: ScenarioRow) => rows.push([index === 0 ? 'A' : 'B', item.name, item.savedAt, group, row.label, row.value, row.unit || '']));
    }
  });
  return '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
}

export async function generateAppDataZip(storage: Pick<Storage, 'getItem'> = localStorage) {
  const exportedAt = new Date().toISOString();
  const { data, warnings } = collectAppStorage(storage);
  const files: Record<string, string> = {};
  const addJSON = (path: string, value: unknown) => { files[path] = json(value); };
  addJSON('user-data/browser-app-data.json', data);
  addJSON('user-data/learning-progress.json', { completedStepIds: data['learning-progress'] || [] });
  addJSON('user-data/preferences.json', { beginnerMode: data['hydraulics-beginner-mode'] ?? null });
  for (const calculator of exportCalculatorIds) {
    const pair = data[scenarioStorageKey(calculator)] || [null, null];
    addJSON(`user-data/calculators/${calculator}/scenarios.json`, pair);
    files[`user-data/calculators/${calculator}/comparison.csv`] = scenariosCSV(pair);
  }
  addJSON('reference/knowledge-base.json', knowledgeBase);
  addJSON('reference/learning-pathways.json', learningPathways.map(({ icon, ...pathway }) => pathway));
  addJSON('reference/section-targets.json', sectionTargets);
  addJSON('reference/story-scenarios.json', storyScenarios);
  addJSON('reference/calculator-quizzes.json', {
    gvf: gvfQuizQuestions, froude: froudeQuizQuestions, culvert: culvertQuizQuestions,
    weirOrifice: weirOrificeQuizQuestions, compound: compoundChannelQuizQuestions,
  });
  await Promise.all(Object.entries(referenceSources).map(async ([path, load]) => {
    files[`reference/source/${path.replace(/^\.\.\//, '').replace(/^\.\//, 'lib/')}`] = String(await load());
  }));
  files['README.md'] = `# ICM River Reach Modeler — Detailed data export

Exported at: ${exportedAt} (UTC)
Archive format: 1

## Contents
- user-data/browser-app-data.json: all explicitly supported browser-saved application records, using their original keys.
- user-data/calculators/: both saved A/B scenarios for each of the seven calculators, including full input state, observed measurements when saved, result snapshots, names and save timestamps; CSV summaries for spreadsheet review.
- user-data/learning-progress.json: completed learning-step IDs.
- user-data/preferences.json: beginner-mode preference (null means not saved).
- reference/: complete knowledge base, learning pathways, story scenarios, calculator question banks and answers.
- reference/source/: educational tables, Ruby scripts, tutorials, equations, calculator methods and references retained as readable TypeScript/React source, where the app has no separate structured dataset.
- manifest.json: export scope, warnings, counts, and file inventory with byte sizes and SHA-256 checksums.

## Scope and limitations
This is a browser-local app-data export, not a hosted database backup or an installable app source archive. It includes only saved data on this browser and origin, not other devices. Empty scenario slots are null. Save calculator inputs as Scenario A or B before export to retain them.
Unsaved calculator/editor inputs, original uploaded SWMM/ICM files, quiz responses, story progress, and AI chat history are not persisted and are not included. Saved imported geometry and observed measurements are included in scenario state. Previously downloaded PDFs and CSVs are not retained by the app and are not included.
Authentication sessions, tokens, API keys, unrelated browser storage, and private service configuration are deliberately excluded. No automatic restore/import is provided. CSV cells beginning with spreadsheet formula characters are prefixed with an apostrophe for safe opening; JSON preserves original values.

## Reviewing the export
Unzip locally. Read JSON with a text editor and CSV with a spreadsheet. The knowledge base lists formulas, details and related concept IDs; learning progress IDs match pathway steps. Use manifest checksums to verify file integrity. Scenario results are saved snapshots, not newly recalculated results. Protect this archive if your scenario names or measurements contain project-sensitive information.
`;
  const inventory = await Promise.all(Object.entries(files).sort(([a], [b]) => a.localeCompare(b)).map(async ([path, content]) => {
    const bytes = new TextEncoder().encode(content);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return { path, bytes: bytes.byteLength, sha256: Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('') };
  }));
  addJSON('manifest.json', {
    app: 'ICM River Reach Modeler', formatVersion: 1, exportedAt,
    scope: 'Browser-saved app data and bundled educational reference content',
    storageKeysIncluded: Object.keys(data), warnings,
    counts: { calculators: exportCalculatorIds.length, concepts: knowledgeBase.length, pathways: learningPathways.length, stories: storyScenarios.length, files: inventory.length + 1 },
    excluded: ['Authentication data and secrets', 'Remote database records', 'Unsaved inputs and session-only progress', 'Original uploads and previous downloads'],
    files: inventory,
  });
  const zip = new JSZip();
  Object.entries(files).forEach(([path, content]) => zip.file(path, content));
  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/zip', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  return { blob, filename: `river-reach-data-${exportedAt.replace(/[:.]/g, '-')}.zip`, fileCount: Object.keys(files).length, warnings };
}