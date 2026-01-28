import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Database, AlertCircle, CheckCircle2, ChevronDown, ChevronRight, 
  X, Loader2, Layers, GitBranch, Circle 
} from 'lucide-react';
import { 
  parseICMDatabase, 
  validateICMFile, 
  getImportableItems,
  type ICMParsedData,
  type ICMImportableItem
} from '@/lib/icm-sqlite-parser';
import { Badge } from '@/components/ui/badge';

interface ImportedChannelData {
  itemName: string;
  itemType: 'river_reach' | 'conduit' | 'cross_section';
  bottomWidth: number;
  sideSlope: number;
  manningN: number;
  bedSlope: number;
  length?: number;
  shape?: string;
}

interface Props {
  onImport?: (data: ImportedChannelData) => void;
}

export const ICMDatabaseImport = ({ onImport }: Props) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ICMParsedData | null>(null);
  const [importableItems, setImportableItems] = useState<ICMImportableItem[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'river_reach' | 'conduit' | 'cross_section'>('all');

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
    setLoadingStatus('Validating file...');
    setError(null);
    setParsedData(null);
    setImportableItems([]);
    setSelectedItem(null);

    try {
      // Validate file
      const validation = await validateICMFile(file);
      if (!validation.valid) {
        throw new Error(validation.errors.join('. '));
      }

      setLoadingStatus('Loading SQL.js engine...');
      
      // Parse the database
      setLoadingStatus('Parsing database tables...');
      const data = await parseICMDatabase(file);
      
      const totalElements = data.riverReaches.length + data.conduits.length + data.crossSections.length;
      if (totalElements === 0) {
        throw new Error('No river reaches, conduits, or cross-sections found in the database');
      }

      setLoadingStatus('Extracting geometry data...');
      const items = getImportableItems(data);
      
      setParsedData(data);
      setImportableItems(items);
      setExpandedSections({ reaches: true, conduits: true, sections: true });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse database');
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
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

  const handleImportItem = useCallback((item: ICMImportableItem) => {
    const importData: ImportedChannelData = {
      itemName: item.name,
      itemType: item.type,
      bottomWidth: item.bottomWidth || 5,
      sideSlope: item.sideSlope || 2,
      manningN: item.manningN || 0.035,
      bedSlope: item.bedSlope || 0.001,
      length: item.length,
      shape: item.shape
    };

    setSelectedItem(item.id);
    onImport?.(importData);
  }, [onImport]);

  const clearData = () => {
    setParsedData(null);
    setImportableItems([]);
    setError(null);
    setSelectedItem(null);
  };

  const getTypeIcon = (type: ICMImportableItem['type']) => {
    switch (type) {
      case 'river_reach': return <GitBranch className="w-4 h-4 text-blue-500" />;
      case 'conduit': return <Circle className="w-4 h-4 text-orange-500" />;
      case 'cross_section': return <Layers className="w-4 h-4 text-green-500" />;
    }
  };

  const getTypeBadge = (type: ICMImportableItem['type']) => {
    switch (type) {
      case 'river_reach': return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">River Reach</Badge>;
      case 'conduit': return <Badge variant="secondary" className="bg-orange-500/10 text-orange-600">Conduit</Badge>;
      case 'cross_section': return <Badge variant="secondary" className="bg-green-500/10 text-green-600">Cross-Section</Badge>;
    }
  };

  const filteredItems = filterType === 'all' 
    ? importableItems 
    : importableItems.filter(item => item.type === filterType);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            ICM Database Import
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Upload an Autodesk InfoWorks ICM .sqlite database to import model data
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
            accept=".sqlite,.icmm,.icmt,.db"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
          />
          
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">{loadingStatus}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-secondary">
                <Database className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Drop your ICM database file here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Supports .sqlite, .icmm, and .icmt files
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
                  Database Loaded Successfully
                </p>
                {parsedData.metadata.modelName && (
                  <p className="text-xs text-primary/70 mt-1">
                    Model: {parsedData.metadata.modelName}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-600 rounded-full">
                    {parsedData.riverReaches.length} River Reaches
                  </span>
                  <span className="text-xs px-2 py-1 bg-orange-500/10 text-orange-600 rounded-full">
                    {parsedData.conduits.length} Conduits
                  </span>
                  <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 rounded-full">
                    {parsedData.crossSections.length} Cross-Sections
                  </span>
                  <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                    {parsedData.nodes.length} Nodes
                  </span>
                </div>
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'river_reach', 'conduit', 'cross_section'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {type === 'all' ? 'All' : type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  {type !== 'all' && (
                    <span className="ml-1">
                      ({importableItems.filter(i => i.type === type).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Items List */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-secondary/50 p-3 font-medium text-sm">
                Importable Items ({filteredItems.length})
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {filteredItems.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">
                    No items found for the selected filter
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/30 sticky top-0">
                      <tr>
                        <th className="text-left p-2 font-medium">Name</th>
                        <th className="text-left p-2 font-medium">Type</th>
                        <th className="text-right p-2 font-medium">Length</th>
                        <th className="text-right p-2 font-medium">Width</th>
                        <th className="text-right p-2 font-medium">n</th>
                        <th className="text-center p-2 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map(item => {
                        const isSelected = selectedItem === item.id;
                        
                        return (
                          <tr 
                            key={item.id}
                            className={`border-t border-border ${isSelected ? 'bg-primary/10' : 'hover:bg-secondary/30'}`}
                          >
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                {getTypeIcon(item.type)}
                                <span className="font-mono text-xs">{item.name}</span>
                              </div>
                            </td>
                            <td className="p-2">
                              {getTypeBadge(item.type)}
                            </td>
                            <td className="p-2 text-right font-mono text-xs">
                              {item.length ? `${item.length.toFixed(1)}m` : '-'}
                            </td>
                            <td className="p-2 text-right font-mono text-xs">
                              {item.bottomWidth?.toFixed(2)}m
                            </td>
                            <td className="p-2 text-right font-mono text-xs">
                              {item.manningN?.toFixed(3)}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                onClick={() => handleImportItem(item)}
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
            </div>

            {/* Selected Item Details */}
            {selectedItem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-primary/5 border border-primary/20 rounded-lg"
              >
                {(() => {
                  const item = importableItems.find(i => i.id === selectedItem);
                  if (!item) return null;
                  
                  return (
                    <>
                      <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        Imported: {item.name}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">Shape:</span>
                          <span className="ml-1 font-mono">{item.shape || 'IRREGULAR'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Bottom Width:</span>
                          <span className="ml-1 font-mono">{item.bottomWidth?.toFixed(2)}m</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Side Slope:</span>
                          <span className="ml-1 font-mono">{item.sideSlope?.toFixed(2)}:1</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Bed Slope:</span>
                          <span className="ml-1 font-mono">{item.bedSlope?.toFixed(4)}</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}

            {/* Help Text */}
            <p className="text-xs text-muted-foreground">
              Click "Import" to load geometry into the calculators. River reaches and irregular sections 
              are approximated as trapezoidal channels for calculator compatibility.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ICMDatabaseImport;
