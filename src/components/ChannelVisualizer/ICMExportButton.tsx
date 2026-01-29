import { useState } from 'react';
import { FileDown, Database, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateICMFilename } from '@/lib/icm-csv-exporter';

export type ICMExportType = 
  | 'cross_section' 
  | 'rating_curve' 
  | 'channel_properties' 
  | 'water_level_profile'
  | 'culvert_design'
  | 'froude_analysis';

interface ICMExportButtonProps {
  exportType: ICMExportType;
  onExport: (options: { filename: string; sectionId: string }) => void;
  disabled?: boolean;
  label?: string;
}

const exportTypeLabels: Record<ICMExportType, { title: string; description: string; prefix: string }> = {
  cross_section: {
    title: 'Cross-Section Survey Data',
    description: 'Export point coordinates with roughness values in ICM hw_cross_section_point format.',
    prefix: 'CrossSection',
  },
  rating_curve: {
    title: 'Rating Curve',
    description: 'Export stage-discharge relationship for ICM rating curve import.',
    prefix: 'RatingCurve',
  },
  channel_properties: {
    title: 'Channel Properties',
    description: 'Export conduit/river reach parameters in ICM format.',
    prefix: 'ChannelProps',
  },
  water_level_profile: {
    title: 'Water Level Profile',
    description: 'Export GVF water surface profile for ICM initial conditions.',
    prefix: 'WaterLevel',
  },
  culvert_design: {
    title: 'Culvert Design',
    description: 'Export culvert geometry and hydraulic results for ICM conduit import.',
    prefix: 'CulvertDesign',
  },
  froude_analysis: {
    title: 'Froude Number Analysis',
    description: 'Export flow regime analysis along the channel reach.',
    prefix: 'FroudeAnalysis',
  },
};

export const ICMExportButton = ({
  exportType,
  onExport,
  disabled = false,
  label,
}: ICMExportButtonProps) => {
  const [open, setOpen] = useState(false);
  const [sectionId, setSectionId] = useState('Section_001');
  const [filename, setFilename] = useState('');
  const [exported, setExported] = useState(false);

  const typeInfo = exportTypeLabels[exportType];

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setFilename(generateICMFilename(typeInfo.prefix));
      setExported(false);
    }
  };

  const handleExport = () => {
    onExport({ filename, sectionId });
    setExported(true);
    setTimeout(() => setOpen(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="gap-2"
        >
          <Database className="w-4 h-4" />
          {label || 'Export ICM CSV'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5 text-primary" />
            Export to ICM Format
          </DialogTitle>
          <DialogDescription>
            {typeInfo.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sectionId">Section/Element ID</Label>
            <Input
              id="sectionId"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              placeholder="e.g., Section_001 or Reach_Main"
            />
            <p className="text-xs text-muted-foreground">
              This ID will be used to identify the element in ICM after import.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="export.csv"
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">ICM Import Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open InfoWorks ICM and select your network</li>
              <li>Go to File → Import → Open Data Import Centre</li>
              <li>Select the appropriate import configuration</li>
              <li>Choose this CSV file and map the columns</li>
            </ol>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exported} className="gap-2">
            {exported ? (
              <>
                <Check className="w-4 h-4" />
                Exported!
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                Export CSV
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
