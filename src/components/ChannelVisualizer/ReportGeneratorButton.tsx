import { useState } from 'react';
import { FileText, Download, X, User, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { generateHydraulicReport, ReportData } from '@/lib/pdf-report-generator';

interface ReportGeneratorButtonProps {
  calculatorType: string;
  getReportData: (metadata: { projectName: string; preparedBy: string; notes: string }) => ReportData;
}

export const ReportGeneratorButton = ({ calculatorType, getReportData }: ReportGeneratorButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const reportData = getReportData({ projectName, preparedBy, notes });
      generateHydraulicReport(reportData);
      setIsOpen(false);
      
      // Reset form
      setProjectName('');
      setPreparedBy('');
      setNotes('');
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 border-primary/30 hover:bg-primary/10"
        >
          <FileText className="w-4 h-4" />
          Export PDF Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Generate Calculation Report
          </DialogTitle>
          <DialogDescription>
            Create an auditable PDF report with inputs, results, methodology citations, and QA/QC signature blocks.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="projectName" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
              Project Name
            </Label>
            <Input
              id="projectName"
              placeholder="e.g., Main Street Culvert Replacement"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="preparedBy" className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Prepared By
            </Label>
            <Input
              id="preparedBy"
              placeholder="Engineer name or initials"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes & Assumptions (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Enter any assumptions, limitations, or notes for this calculation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Report will include:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>All input parameters with units</li>
              <li>Calculated results with methodology citations</li>
              <li>Reference equations and sources</li>
              <li>Timestamp and document ID</li>
              <li>QA/QC signature blocks</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generate PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
