import { useState } from 'react';
import { Archive, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { deliverFile } from '@/lib/download-file';

export function AppDataExport() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [archive, setArchive] = useState<{ blob: Blob; filename: string; fileCount: number; warnings: string[] } | null>(null);
  const prepare = async () => {
    setBusy(true);
    setError('');
    setArchive(null);
    try {
      const { generateAppDataZip } = await import('@/lib/app-data-export');
      setArchive(await generateAppDataZip());
    } catch { setError('The export could not be prepared. Please try again.'); }
    finally { setBusy(false); }
  };
  return <Dialog onOpenChange={open => { if (!open) { setArchive(null); setError(''); } }}>
    <DialogTrigger asChild><Button variant="outline" size="sm"><Archive className="mr-2 h-4 w-4" />Export App Data</Button></DialogTrigger>
    <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Export all saved app data</DialogTitle>
        <DialogDescription>Detailed ZIP archive for this browser, with readable JSON, spreadsheet summaries, and reference content.</DialogDescription>
      </DialogHeader>
      <ul className="list-disc space-y-2 pl-5 text-sm text-foreground">
        <li>Saved A/B scenarios for all seven calculators, including inputs and results</li>
        <li>Learning progress and beginner-mode preference</li>
        <li>Knowledge base, stories, pathways, quizzes, scripts, equations, and reference tables</li>
        <li>Timestamped inventory, file checksums, and a detailed README</li>
      </ul>
      <p className="text-sm text-muted-foreground">Unsaved inputs, chat history, original uploads, and data from other devices are not included. Save your current calculator values as a scenario first. Sign-in credentials are always excluded.</p>
      <div role="status" className="text-sm text-muted-foreground">
        {archive && `${archive.fileCount} files ready · ${(archive.blob.size / 1024).toFixed(1)} KB`}
        {archive?.warnings.map(warning => <p key={warning}>{warning}</p>)}
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant={archive ? 'outline' : 'default'} disabled={busy} onClick={prepare}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4" />}
          {busy ? 'Preparing ZIP…' : archive ? 'Refresh export' : 'Prepare ZIP'}
        </Button>
        {archive && <Button onClick={() => { void deliverFile(archive.blob, archive.filename).catch(() => setError('The download could not be started. Please try again.')); }}><Download className="mr-2 h-4 w-4" />Download ZIP</Button>}
      </div>
    </DialogContent>
  </Dialog>;
}