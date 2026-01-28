import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle2, ChevronDown, ChevronRight, X, Download, Loader2 } from 'lucide-react';
import { 
  parseSWMMFile, 
  validateSWMMFile, 
  getShapeDescription,
  xsectionToGeometry,
  type SWMMParsedData,
  type SWMMConduit,
  type SWMMXSection
} from '@/lib/swmm-parser';

interface ImportedChannelData {
  conduitName: string;
  conduit: SWMMConduit;
  xsection: SWMMXSection;
  bottomWidth: number;
  sideSlope: number;
  manningN: number;
  bedSlope: number;
  length: number;
  shape: string;
}

interface Props {
  onImport?: (data: ImportedChannelData) => void;
}

export const SWMMFileImport = ({ onImport }: Props) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<SWMMParsedData | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedConduit, setSelectedConduit] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setParsedData(null);
    setSelectedConduit(null);

    try {
      // Validate file type
      if (!file.name.endsWith('.inp') && !file.name.endsWith('.txt')) {
        throw new Error('Please upload a SWMM .inp file');
      }

      // Read file content
      const content = await file.text();
      
      // Validate content
      const validation = validateSWMMFile(content);
      if (!validation.valid) {
        throw new Error(validation.errors.join('. '));
      }

      // Parse the file
      const data = parseSWMMFile(content);
      
      if (data.conduits.length === 0 && data.xsections.length === 0) {
        throw new Error('No conduits or cross-sections found in the file');
      }

      setParsedData(data);
      setExpandedSections({ conduits: true, xsections: true });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleImportConduit = useCallback((conduitName: string) => {
    if (!parsedData) return;

    const conduit = parsedData.conduits.find(c => c.name === conduitName);
    const xsection = parsedData.xsections.find(x => x.link === conduitName);

    if (!conduit || !xsection) {
      setError(`Could not find complete data for conduit ${conduitName}`);
      return;
    }

    // Calculate bed slope from connected nodes
    const fromJunction = parsedData.junctions.find(j => j.name === conduit.fromNode);
    const toJunction = parsedData.junctions.find(j => j.name === conduit.toNode);
    const toOutfall = parsedData.outfalls.find(o => o.name === conduit.toNode);
    
    let bedSlope = 0.001; // default
    const fromElev = fromJunction?.elevation || 0;
    const toElev = toJunction?.elevation || toOutfall?.elevation || 0;
    
    if (conduit.length > 0 && (fromElev !== 0 || toElev !== 0)) {
      const elevDiff = (fromElev + conduit.inOffset) - (toElev + conduit.outOffset);
      bedSlope = Math.max(0.0001, elevDiff / conduit.length);
    }

    const geometry = xsectionToGeometry(xsection, conduit, parsedData.transects);

    const importData: ImportedChannelData = {
      conduitName,
      conduit,
      xsection,
      bottomWidth: geometry.bottomWidth,
      sideSlope: geometry.sideSlope,
      manningN: geometry.manningN,
      bedSlope,
      length: conduit.length,
      shape: xsection.shape,
    };

    setSelectedConduit(conduitName);
    onImport?.(importData);
  }, [parsedData, onImport]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const clearData = () => {
    setParsedData(null);
    setError(null);
    setSelectedConduit(null);
  };

  // Get matched conduits with xsections
  const matchedConduits = parsedData?.conduits.filter(c => 
    parsedData.xsections.some(x => x.link === c.name)
  ) || [];

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            SWMM File Import
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Upload an EPA SWMM5 .inp file to import cross-section data into the calculators
          </p>
        </div>
        {parsedData && (
          <button
            onClick={clearData}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            title="Clear imported data"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Drop Zone */}
      {!parsedData && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-secondary/30'
          }`}
        >
          <input
            type="file"
            accept=".inp,.txt"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
          />
          
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Parsing SWMM file...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-secondary">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Drop your SWMM .inp file here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Supports EPA SWMM5 input files (.inp)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Import Error</p>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parsed Data Display */}
      <AnimatePresence>
        {parsedData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 space-y-4"
          >
            {/* Summary */}
            <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-primary">
                  File Parsed Successfully
                </p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                    {parsedData.junctions.length} Junctions
                  </span>
                  <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                    {parsedData.conduits.length} Conduits
                  </span>
                  <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                    {parsedData.xsections.length} Cross-Sections
                  </span>
                  <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                    {parsedData.transects.length} Transects
                  </span>
                </div>
              </div>
            </div>

            {/* Conduits List */}
            <div className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('conduits')}
                className="w-full flex items-center justify-between p-3 bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <span className="font-medium text-sm">
                  Importable Conduits ({matchedConduits.length})
                </span>
                {expandedSections.conduits ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections.conduits && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="max-h-60 overflow-y-auto">
                      {matchedConduits.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground text-center">
                          No conduits with matching cross-sections found
                        </p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead className="bg-secondary/30 sticky top-0">
                            <tr>
                              <th className="text-left p-2 font-medium">Name</th>
                              <th className="text-left p-2 font-medium">Shape</th>
                              <th className="text-right p-2 font-medium">Length</th>
                              <th className="text-right p-2 font-medium">n</th>
                              <th className="text-center p-2 font-medium">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {matchedConduits.map(conduit => {
                              const xsection = parsedData.xsections.find(x => x.link === conduit.name);
                              const isSelected = selectedConduit === conduit.name;
                              
                              return (
                                <tr 
                                  key={conduit.name}
                                  className={`border-t border-border ${isSelected ? 'bg-primary/10' : 'hover:bg-secondary/30'}`}
                                >
                                  <td className="p-2 font-mono text-xs">{conduit.name}</td>
                                  <td className="p-2 text-xs">
                                    {xsection ? getShapeDescription(xsection.shape) : '-'}
                                  </td>
                                  <td className="p-2 text-right font-mono text-xs">
                                    {conduit.length.toFixed(1)}m
                                  </td>
                                  <td className="p-2 text-right font-mono text-xs">
                                    {conduit.roughness.toFixed(3)}
                                  </td>
                                  <td className="p-2 text-center">
                                    <button
                                      onClick={() => handleImportConduit(conduit.name)}
                                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                        isSelected 
                                          ? 'bg-primary text-primary-foreground' 
                                          : 'bg-primary/10 text-primary hover:bg-primary/20'
                                      }`}
                                    >
                                      {isSelected ? 'Selected' : 'Import'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Selected Conduit Details */}
            {selectedConduit && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-primary/5 border border-primary/20 rounded-lg"
              >
                <h4 className="font-semibold text-sm text-foreground mb-2">
                  Imported: {selectedConduit}
                </h4>
                {(() => {
                  const conduit = parsedData.conduits.find(c => c.name === selectedConduit);
                  const xsection = parsedData.xsections.find(x => x.link === selectedConduit);
                  if (!conduit || !xsection) return null;
                  
                  const geometry = xsectionToGeometry(xsection, conduit, parsedData.transects);
                  
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Shape:</span>
                        <span className="ml-1 font-mono">{xsection.shape}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bottom Width:</span>
                        <span className="ml-1 font-mono">{geometry.bottomWidth.toFixed(2)}m</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Side Slope:</span>
                        <span className="ml-1 font-mono">{geometry.sideSlope.toFixed(2)}:1</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Manning's n:</span>
                        <span className="ml-1 font-mono">{geometry.manningN.toFixed(3)}</span>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* Help Text */}
            <p className="text-xs text-muted-foreground">
              Click "Import" on any conduit to load its geometry into the Rating Curve Generator and other calculators.
              Trapezoidal, rectangular, and irregular (transect) sections are fully supported.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SWMMFileImport;
