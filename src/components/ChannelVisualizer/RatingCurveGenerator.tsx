import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Download, Plus, Trash2, Upload, Database } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SWMMFileImport } from './SWMMFileImport';
import { ICMDatabaseImport } from './ICMDatabaseImport';
import { ReportGeneratorButton } from './ReportGeneratorButton';
import { ReportData, METHODOLOGY_REFERENCES } from '@/lib/pdf-report-generator';

interface ObservedPoint {
  stage: number;
  discharge: number;
}

interface ImportedChannelData {
  conduitName?: string;
  itemName?: string;
  bottomWidth: number;
  sideSlope: number;
  manningN: number;
  bedSlope: number;
  length?: number;
  shape?: string;
}

type ImportSource = 'none' | 'swmm' | 'icm';

export const RatingCurveGenerator = () => {
  // Cross-section geometry
  const [bottomWidth, setBottomWidth] = useState(10);
  const [sideSlope, setSideSlope] = useState(2);
  const [manningN, setManningN] = useState(0.035);
  const [bedSlope, setBedSlope] = useState(0.001);
  const [maxStage, setMaxStage] = useState(5);
  
  // Import state
  const [showImport, setShowImport] = useState<ImportSource>('none');
  const [importedFrom, setImportedFrom] = useState<string | null>(null);
  const [importSource, setImportSource] = useState<'SWMM' | 'ICM' | null>(null);
  
  // Observed data points
  const [observedPoints, setObservedPoints] = useState<ObservedPoint[]>([
    { stage: 0.5, discharge: 2.1 },
    { stage: 1.0, discharge: 8.5 },
    { stage: 1.5, discharge: 22.0 },
    { stage: 2.0, discharge: 45.0 },
    { stage: 2.5, discharge: 78.0 },
  ]);
  
  const [newStage, setNewStage] = useState('');
  const [newDischarge, setNewDischarge] = useState('');

  // Handle SWMM import
  const handleSWMMImport = useCallback((data: ImportedChannelData) => {
    setBottomWidth(data.bottomWidth || 10);
    setSideSlope(data.sideSlope || 2);
    setManningN(data.manningN || 0.035);
    setBedSlope(data.bedSlope || 0.001);
    setImportedFrom(data.conduitName || null);
    setImportSource('SWMM');
  }, []);

  // Handle ICM import
  const handleICMImport = useCallback((data: ImportedChannelData) => {
    setBottomWidth(data.bottomWidth || 10);
    setSideSlope(data.sideSlope || 2);
    setManningN(data.manningN || 0.035);
    setBedSlope(data.bedSlope || 0.001);
    setImportedFrom(data.itemName || null);
    setImportSource('ICM');
  }, []);

  // Calculate theoretical rating curve using Manning's equation
  const ratingCurveData = useMemo(() => {
    const data = [];
    const steps = 50;
    
    for (let i = 0; i <= steps; i++) {
      const stage = (maxStage / steps) * i;
      if (stage === 0) {
        data.push({ stage: 0, theoretical: 0, observed: null });
        continue;
      }
      
      // Trapezoidal channel geometry
      const topWidth = bottomWidth + 2 * sideSlope * stage;
      const area = (bottomWidth + topWidth) / 2 * stage;
      const wettedPerimeter = bottomWidth + 2 * stage * Math.sqrt(1 + sideSlope * sideSlope);
      const hydraulicRadius = area / wettedPerimeter;
      
      // Manning's equation: Q = (1/n) * A * R^(2/3) * S^(1/2)
      const discharge = (1 / manningN) * area * Math.pow(hydraulicRadius, 2/3) * Math.sqrt(bedSlope);
      
      // Find matching observed point
      const observedMatch = observedPoints.find(p => Math.abs(p.stage - stage) < 0.05);
      
      data.push({
        stage: parseFloat(stage.toFixed(2)),
        theoretical: parseFloat(discharge.toFixed(2)),
        observed: observedMatch ? observedMatch.discharge : null,
      });
    }
    
    // Add observed points that might not be on the theoretical curve
    observedPoints.forEach(point => {
      const exists = data.some(d => Math.abs(d.stage - point.stage) < 0.05);
      if (!exists) {
        // Calculate theoretical for this stage
        const stage = point.stage;
        const topWidth = bottomWidth + 2 * sideSlope * stage;
        const area = (bottomWidth + topWidth) / 2 * stage;
        const wettedPerimeter = bottomWidth + 2 * stage * Math.sqrt(1 + sideSlope * sideSlope);
        const hydraulicRadius = area / wettedPerimeter;
        const theoretical = (1 / manningN) * area * Math.pow(hydraulicRadius, 2/3) * Math.sqrt(bedSlope);
        
        data.push({
          stage: point.stage,
          theoretical: parseFloat(theoretical.toFixed(2)),
          observed: point.discharge,
        });
      }
    });
    
    return data.sort((a, b) => a.stage - b.stage);
  }, [bottomWidth, sideSlope, manningN, bedSlope, maxStage, observedPoints]);

  // Calculate R² value
  const rSquared = useMemo(() => {
    const validPoints = ratingCurveData.filter(d => d.observed !== null);
    if (validPoints.length < 2) return null;
    
    const meanObserved = validPoints.reduce((sum, p) => sum + (p.observed || 0), 0) / validPoints.length;
    
    let ssRes = 0;
    let ssTot = 0;
    
    validPoints.forEach(p => {
      if (p.observed !== null) {
        ssRes += Math.pow(p.observed - p.theoretical, 2);
        ssTot += Math.pow(p.observed - meanObserved, 2);
      }
    });
    
    return ssTot > 0 ? 1 - (ssRes / ssTot) : 0;
  }, [ratingCurveData]);

  // Report generator function
  const getReportData = useCallback((metadata: { projectName: string; preparedBy: string; notes: string }): ReportData => {
    const warnings: string[] = [];
    if (rSquared !== null && rSquared < 0.9) {
      warnings.push(`Low R² value (${rSquared.toFixed(3)}) - significant deviation between theoretical and observed data`);
    }
    
    // Get representative curve points
    const curvePoints = ratingCurveData.filter((_, i) => i % 10 === 0 || i === ratingCurveData.length - 1);
    
    return {
      metadata: {
        title: 'Rating Curve Analysis',
        projectName: metadata.projectName,
        preparedBy: metadata.preparedBy,
        date: new Date(),
        calculationType: 'Rating Curve Generator',
      },
      inputs: {
        title: 'Channel Geometry',
        items: [
          { label: 'Bottom Width (b)', value: bottomWidth.toString(), unit: 'm' },
          { label: 'Side Slope (z)', value: `${sideSlope}:1`, unit: 'H:V' },
          { label: "Manning's n", value: manningN.toFixed(3), unit: '-' },
          { label: 'Bed Slope (S₀)', value: bedSlope.toFixed(4), unit: 'm/m' },
          { label: 'Maximum Stage', value: maxStage.toString(), unit: 'm' },
          ...(importedFrom ? [{ label: 'Data Source', value: `SWMM: ${importedFrom}`, unit: '-' }] : []),
        ],
      },
      results: [
        {
          title: 'Curve Fit Statistics',
          items: [
            { label: 'Number of Observed Points', value: observedPoints.length.toString(), unit: 'points' },
            { label: 'R² Coefficient', value: rSquared !== null ? rSquared.toFixed(4) : 'N/A', unit: '-' },
            { label: 'Curve Points Generated', value: ratingCurveData.length.toString(), unit: 'points' },
          ],
        },
        {
          title: 'Stage-Discharge Summary',
          items: curvePoints.slice(0, 6).map(p => ({
            label: `Stage ${p.stage.toFixed(1)} m`,
            value: p.theoretical.toFixed(2),
            unit: 'm³/s',
          })),
        },
      ],
      methodology: [
        METHODOLOGY_REFERENCES.ratingCurve,
        METHODOLOGY_REFERENCES.manning,
      ],
      notes: metadata.notes + (observedPoints.length > 0 ? `\n\nObserved Data Points:\n${observedPoints.map(p => `Stage: ${p.stage}m, Q: ${p.discharge} m³/s`).join('\n')}` : ''),
      warnings,
    };
  }, [bottomWidth, sideSlope, manningN, bedSlope, maxStage, observedPoints, ratingCurveData, rSquared, importedFrom]);

  const addObservedPoint = () => {
    const stage = parseFloat(newStage);
    const discharge = parseFloat(newDischarge);
    if (!isNaN(stage) && !isNaN(discharge) && stage > 0 && discharge > 0) {
      setObservedPoints([...observedPoints, { stage, discharge }].sort((a, b) => a.stage - b.stage));
      setNewStage('');
      setNewDischarge('');
    }
  };

  const removeObservedPoint = (index: number) => {
    setObservedPoints(observedPoints.filter((_, i) => i !== index));
  };

  const exportCSV = () => {
    const headers = 'Stage (m),Theoretical Q (m³/s),Observed Q (m³/s)\n';
    const rows = ratingCurveData.map(d => 
      `${d.stage},${d.theoretical},${d.observed !== null ? d.observed : ''}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rating_curve.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Rating Curve Generator</h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Generate stage-discharge relationships from cross-section geometry using Manning's equation 
          and compare with observed field measurements.
        </p>
        <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
          {/* SWMM Import Button */}
          <button
            onClick={() => setShowImport(showImport === 'swmm' ? 'none' : 'swmm')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showImport === 'swmm'
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
            }`}
          >
            <Upload className="w-4 h-4" />
            {showImport === 'swmm' ? 'Hide SWMM Import' : 'Import SWMM .inp'}
          </button>
          {/* ICM Import Button */}
          <button
            onClick={() => setShowImport(showImport === 'icm' ? 'none' : 'icm')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showImport === 'icm'
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
            }`}
          >
            <Database className="w-4 h-4" />
            {showImport === 'icm' ? 'Hide ICM Import' : 'Import ICM .sqlite'}
          </button>
          <ReportGeneratorButton 
            calculatorType="Rating Curve Generator" 
            getReportData={getReportData} 
          />
        </div>
        {importedFrom && (
          <p className="text-xs text-primary mt-2">
            ✓ Loaded from {importSource}: {importedFrom}
          </p>
        )}
      </div>

      {/* SWMM Import Section */}
      {showImport === 'swmm' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <SWMMFileImport onImport={handleSWMMImport} />
        </motion.div>
      )}

      {/* ICM Import Section */}
      {showImport === 'icm' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <ICMDatabaseImport onImport={handleICMImport} />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Geometry Parameters */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              Cross-Section Geometry
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Bottom Width (m)</label>
                <input
                  type="number"
                  value={bottomWidth}
                  onChange={(e) => setBottomWidth(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  step="0.5"
                  min="0.5"
                />
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Side Slope (H:V)</label>
                <input
                  type="number"
                  value={sideSlope}
                  onChange={(e) => setSideSlope(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  step="0.5"
                  min="0"
                />
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Manning's n</label>
                <input
                  type="number"
                  value={manningN}
                  onChange={(e) => setManningN(parseFloat(e.target.value) || 0.01)}
                  className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  step="0.005"
                  min="0.01"
                  max="0.2"
                />
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Bed Slope (m/m)</label>
                <input
                  type="number"
                  value={bedSlope}
                  onChange={(e) => setBedSlope(parseFloat(e.target.value) || 0.0001)}
                  className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  step="0.0001"
                  min="0.0001"
                />
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Max Stage (m)</label>
                <input
                  type="number"
                  value={maxStage}
                  onChange={(e) => setMaxStage(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  step="0.5"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Observed Data */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h4 className="font-semibold text-foreground mb-3">Observed Data Points</h4>
            
            <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
              {observedPoints.map((point, index) => (
                <div key={index} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
                  <span className="text-xs font-mono">
                    {point.stage}m → {point.discharge} m³/s
                  </span>
                  <button
                    onClick={() => removeObservedPoint(index)}
                    className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Stage"
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                className="flex-1 px-2 py-1.5 text-xs bg-secondary rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary/50"
                step="0.1"
              />
              <input
                type="number"
                placeholder="Q (m³/s)"
                value={newDischarge}
                onChange={(e) => setNewDischarge(e.target.value)}
                className="flex-1 px-2 py-1.5 text-xs bg-secondary rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary/50"
                step="0.1"
              />
              <button
                onClick={addObservedPoint}
                className="p-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Statistics */}
          {rSquared !== null && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h4 className="font-semibold text-foreground mb-2">Curve Fit Statistics</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">R² Value:</span>
                <span className={`text-lg font-mono font-bold ${rSquared > 0.9 ? 'text-green-600' : rSquared > 0.7 ? 'text-yellow-600' : 'text-red-500'}`}>
                  {rSquared.toFixed(4)}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {rSquared > 0.9 ? 'Excellent fit' : rSquared > 0.7 ? 'Good fit - consider adjusting n' : 'Poor fit - check geometry or roughness'}
              </p>
            </div>
          )}

          <button
            onClick={exportCSV}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Chart Panel */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
          <h4 className="font-semibold text-foreground mb-4">Stage-Discharge Rating Curve</h4>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratingCurveData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="stage" 
                  label={{ value: 'Stage (m)', position: 'bottom', offset: 10 }}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  label={{ value: 'Discharge (m³/s)', angle: -90, position: 'insideLeft', offset: 0 }}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(2)} m³/s`,
                    name === 'theoretical' ? 'Theoretical (Manning)' : 'Observed'
                  ]}
                  labelFormatter={(label) => `Stage: ${label} m`}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  formatter={(value) => value === 'theoretical' ? 'Theoretical (Manning)' : 'Observed Measurements'}
                />
                <Line 
                  type="monotone" 
                  dataKey="theoretical" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                  name="theoretical"
                />
                <Line 
                  type="monotone" 
                  dataKey="observed" 
                  stroke="hsl(30, 90%, 50%)" 
                  strokeWidth={0}
                  dot={{ fill: 'hsl(30, 90%, 50%)', r: 5 }}
                  name="observed"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cross-section preview */}
          <div className="mt-4 pt-4 border-t border-border">
            <h5 className="text-xs font-semibold text-foreground mb-2">Cross-Section Preview</h5>
            <svg viewBox="0 0 300 80" className="w-full h-20 bg-secondary/30 rounded-lg">
              {/* Trapezoidal channel */}
              <polygon
                points={`
                  ${150 - bottomWidth * 5 - sideSlope * 50},10
                  ${150 - bottomWidth * 5},60
                  ${150 + bottomWidth * 5},60
                  ${150 + bottomWidth * 5 + sideSlope * 50},10
                `}
                fill="hsl(195, 90%, 55%)"
                fillOpacity="0.2"
                stroke="hsl(220, 10%, 50%)"
                strokeWidth="2"
              />
              
              {/* Water level indicator */}
              <line 
                x1="30" 
                y1={60 - (maxStage * 0.6) * 10} 
                x2="270" 
                y2={60 - (maxStage * 0.6) * 10} 
                stroke="hsl(195, 90%, 55%)" 
                strokeWidth="1.5" 
                strokeDasharray="4 2"
              />
              
              {/* Dimensions */}
              <text x="150" y="73" textAnchor="middle" className="text-[9px]" fill="hsl(210, 15%, 50%)">
                b = {bottomWidth}m, z = {sideSlope}:1
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Formula Reference */}
      <div className="bg-secondary/30 rounded-xl p-4">
        <h4 className="font-semibold text-foreground mb-2">Manning's Equation Reference</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-mono text-primary mb-1">Q = (1/n) × A × R^(2/3) × S^(1/2)</p>
            <p className="text-xs text-muted-foreground">Where Q = discharge, n = Manning's roughness, A = flow area, R = hydraulic radius, S = bed slope</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              <strong>Trapezoidal geometry:</strong><br/>
              A = (b + z×y) × y<br/>
              P = b + 2y√(1 + z²)<br/>
              R = A / P
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
