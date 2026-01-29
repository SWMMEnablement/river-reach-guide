import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calculator, Play, RotateCcw, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalculatorInsights, generateGVFInsights } from './CalculatorInsights';
import { CalculatorQuiz, gvfQuizQuestions } from './CalculatorQuiz';
import { ReportGeneratorButton } from './ReportGeneratorButton';
import { ICMExportButton } from './ICMExportButton';
import { ReportData, METHODOLOGY_REFERENCES } from '@/lib/pdf-report-generator';
import { exportWaterLevelProfileCSV, ICMWaterLevelExport } from '@/lib/icm-csv-exporter';
interface GVFPoint {
  x: number;
  y: number;
  depth: number;
  velocity: number;
  froude: number;
  specificEnergy: number;
}

interface ProfileType {
  id: string;
  name: string;
  description: string;
  slope: 'mild' | 'steep' | 'critical';
  zone: number;
  upstream: 'above' | 'below';
  downstream: 'above' | 'below';
}

const profileTypes: ProfileType[] = [
  { id: 'M1', name: 'M1 - Backwater', description: 'Mild slope, depth above normal depth', slope: 'mild', zone: 1, upstream: 'above', downstream: 'above' },
  { id: 'M2', name: 'M2 - Drawdown', description: 'Mild slope, depth between yn and yc', slope: 'mild', zone: 2, upstream: 'below', downstream: 'below' },
  { id: 'M3', name: 'M3 - Supercritical', description: 'Mild slope, depth below critical', slope: 'mild', zone: 3, upstream: 'below', downstream: 'above' },
  { id: 'S1', name: 'S1 - Backwater', description: 'Steep slope, depth above critical', slope: 'steep', zone: 1, upstream: 'above', downstream: 'above' },
  { id: 'S2', name: 'S2 - Drawdown', description: 'Steep slope, depth between yc and yn', slope: 'steep', zone: 2, upstream: 'above', downstream: 'below' },
  { id: 'S3', name: 'S3 - Supercritical', description: 'Steep slope, depth below normal', slope: 'steep', zone: 3, upstream: 'below', downstream: 'below' },
];

export const GVFProfileCalculator = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [bottomWidth, setBottomWidth] = useState(5);
  const [sideSlope, setSideSlope] = useState(2);
  const [discharge, setDischarge] = useState(15);
  const [bedSlope, setBedSlope] = useState(0.001);
  const [manningN, setManningN] = useState(0.03);
  const [channelLength, setChannelLength] = useState(500);
  const [boundaryDepth, setBoundaryDepth] = useState(2.5);
  const [numSteps, setNumSteps] = useState(50);
  const [selectedProfile, setSelectedProfile] = useState('M1');

  const calculations = useMemo(() => {
    const g = 9.81;
    const Q = discharge;
    const b = bottomWidth;
    const z = sideSlope;
    const S0 = bedSlope;
    const n = manningN;

    // Calculate area and hydraulic properties for a given depth
    const getHydraulics = (y: number) => {
      const A = y * (b + z * y);
      const P = b + 2 * y * Math.sqrt(1 + z * z);
      const R = A / P;
      const T = b + 2 * z * y;
      const V = Q / A;
      const Fr = V / Math.sqrt(g * A / T);
      const E = y + V * V / (2 * g);
      return { A, P, R, T, V, Fr, E };
    };

    // Calculate friction slope using Manning's equation
    const getFrictionSlope = (y: number) => {
      const { A, R } = getHydraulics(y);
      const V = Q / A;
      return (n * n * V * V) / Math.pow(R, 4/3);
    };

    // Find normal depth iteratively
    const findNormalDepth = () => {
      let yLow = 0.01;
      let yHigh = 20;
      for (let i = 0; i < 50; i++) {
        const yMid = (yLow + yHigh) / 2;
        const { A, R } = getHydraulics(yMid);
        const Qcalc = (1/n) * A * Math.pow(R, 2/3) * Math.sqrt(S0);
        if (Qcalc < Q) yLow = yMid;
        else yHigh = yMid;
      }
      return (yLow + yHigh) / 2;
    };

    // Find critical depth iteratively
    const findCriticalDepth = () => {
      let yLow = 0.01;
      let yHigh = 20;
      for (let i = 0; i < 50; i++) {
        const yMid = (yLow + yHigh) / 2;
        const { A, T } = getHydraulics(yMid);
        const criterion = Q * Q * T / (g * A * A * A);
        if (criterion > 1) yLow = yMid;
        else yHigh = yMid;
      }
      return (yLow + yHigh) / 2;
    };

    const yn = findNormalDepth();
    const yc = findCriticalDepth();
    const isMild = yn > yc;
    const criticalSlope = (n * n * Q * Q) / (getHydraulics(yc).A * getHydraulics(yc).A * Math.pow(getHydraulics(yc).R, 4/3));

    // Step-backwater calculation
    const dx = channelLength / numSteps;
    const profile: GVFPoint[] = [];
    
    let y = boundaryDepth;
    const profileInfo = profileTypes.find(p => p.id === selectedProfile);
    const computeUpstream = profileInfo?.slope === 'mild' || selectedProfile === 'S1';

    for (let i = 0; i <= numSteps; i++) {
      const x = computeUpstream ? channelLength - i * dx : i * dx;
      const hydro = getHydraulics(y);
      
      profile.push({
        x,
        y: y,
        depth: y,
        velocity: hydro.V,
        froude: hydro.Fr,
        specificEnergy: hydro.E,
      });

      if (i < numSteps) {
        // Standard step method
        const Sf1 = getFrictionSlope(y);
        const { E: E1 } = getHydraulics(y);

        // Predictor step
        const yPred = y + (S0 - Sf1) * dx;
        const Sf2 = getFrictionSlope(Math.max(0.01, yPred));
        const SfAvg = (Sf1 + Sf2) / 2;

        // Energy equation: E2 = E1 + (S0 - Sf_avg) * dx
        const dE = (S0 - SfAvg) * dx;
        const E2target = E1 + (computeUpstream ? -dE : dE);

        // Solve for y2 given E2
        let yLow = 0.01;
        let yHigh = 10;
        for (let j = 0; j < 30; j++) {
          const yMid = (yLow + yHigh) / 2;
          const { E } = getHydraulics(yMid);
          if (E < E2target) yLow = yMid;
          else yHigh = yMid;
        }
        y = Math.max(0.01, Math.min(10, (yLow + yHigh) / 2));
      }
    }

    // Sort by x for proper plotting
    profile.sort((a, b) => a.x - b.x);

    return {
      normalDepth: yn,
      criticalDepth: yc,
      isMild,
      criticalSlope,
      profile,
      normalHydro: getHydraulics(yn),
      criticalHydro: getHydraulics(yc),
    };
  }, [bottomWidth, sideSlope, discharge, bedSlope, manningN, channelLength, boundaryDepth, numSteps, selectedProfile]);

  const { normalDepth, criticalDepth, isMild, profile, normalHydro, criticalHydro } = calculations;

  // Report generator function
  const getReportData = useCallback((metadata: { projectName: string; preparedBy: string; notes: string }): ReportData => {
    const selectedProfileInfo = profileTypes.find(p => p.id === selectedProfile);
    const warnings: string[] = [];
    if (profile.some(p => p.froude > 1) && profile.some(p => p.froude < 1)) {
      warnings.push('Profile crosses critical depth - potential hydraulic jump location');
    }
    
    return {
      metadata: {
        title: `GVF Profile Analysis (${selectedProfile})`,
        projectName: metadata.projectName,
        preparedBy: metadata.preparedBy,
        date: new Date(),
        calculationType: 'GVF Profile Calculator',
      },
      inputs: {
        title: 'Channel Parameters',
        items: [
          { label: 'Bottom Width (b)', value: bottomWidth.toString(), unit: 'm' },
          { label: 'Side Slope (z)', value: `${sideSlope}:1`, unit: 'H:V' },
          { label: 'Design Discharge (Q)', value: discharge.toString(), unit: 'm³/s' },
          { label: 'Bed Slope (S₀)', value: bedSlope.toFixed(4), unit: 'm/m' },
          { label: "Manning's n", value: manningN.toFixed(3), unit: '-' },
          { label: 'Channel Length', value: channelLength.toString(), unit: 'm' },
          { label: 'Boundary Depth', value: boundaryDepth.toString(), unit: 'm' },
          { label: 'Profile Type', value: selectedProfile, unit: '-' },
        ],
      },
      results: [
        {
          title: 'Reference Depths',
          items: [
            { label: 'Normal Depth (yn)', value: normalDepth.toFixed(3), unit: 'm' },
            { label: 'Critical Depth (yc)', value: criticalDepth.toFixed(3), unit: 'm' },
            { label: 'Slope Classification', value: isMild ? 'Mild (M)' : 'Steep (S)', unit: '-' },
            { label: 'Profile Description', value: selectedProfileInfo?.description || '', unit: '-' },
          ],
        },
        {
          title: 'Hydraulic Properties at Normal Depth',
          items: [
            { label: 'Flow Area', value: normalHydro.A.toFixed(3), unit: 'm²' },
            { label: 'Velocity', value: normalHydro.V.toFixed(3), unit: 'm/s' },
            { label: 'Hydraulic Radius', value: normalHydro.R.toFixed(3), unit: 'm' },
            { label: 'Froude Number', value: normalHydro.Fr.toFixed(3), unit: '-' },
          ],
        },
      ],
      methodology: [
        METHODOLOGY_REFERENCES.gvf,
        METHODOLOGY_REFERENCES.manning,
        METHODOLOGY_REFERENCES.froude,
      ],
      notes: metadata.notes,
      warnings,
    };
  }, [bottomWidth, sideSlope, discharge, bedSlope, manningN, channelLength, boundaryDepth, selectedProfile, calculations]);

  // ICM Export: Water Level Profile
  const handleICMWaterLevelExport = useCallback((options: { filename: string; sectionId: string }) => {
    const profileData: ICMWaterLevelExport[] = profile.map(p => ({
      reachId: options.sectionId,
      chainage: p.x,
      waterLevel: p.depth,
      bedLevel: 0 - bedSlope * p.x,
      velocity: p.velocity,
      froudeNumber: p.froude,
    }));
    exportWaterLevelProfileCSV(profileData, { filename: options.filename });
  }, [profile, bedSlope]);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 350;
  const margin = { top: 30, right: 40, bottom: 50, left: 60 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  const xScale = (x: number) => margin.left + (x / channelLength) * plotWidth;
  const maxDepth = Math.max(normalDepth, criticalDepth, boundaryDepth, ...profile.map(p => p.depth)) * 1.2;
  const yScale = (y: number) => margin.top + plotHeight - (y / maxDepth) * plotHeight;

  const bedY = (x: number) => {
    const drop = bedSlope * x;
    return yScale(-drop);
  };

  const profilePath = profile.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.depth - bedSlope * p.x)}`
  ).join(' ');

  const bedPath = `M ${xScale(0)} ${bedY(0)} L ${xScale(channelLength)} ${bedY(channelLength)}`;

  return (
    <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">GVF Profile Calculator</h3>
            <p className="text-xs text-muted-foreground">Gradually Varied Flow with Step-Backwater Method</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 border-t border-border space-y-4"
        >
          {/* Export Buttons */}
          <div className="flex justify-end gap-2 flex-wrap">
            <ICMExportButton
              exportType="water_level_profile"
              onExport={handleICMWaterLevelExport}
              label="Export ICM Profile"
            />
            <ReportGeneratorButton 
              calculatorType="GVF Profile Calculator" 
              getReportData={getReportData} 
            />
          </div>
          {/* Profile Type Selection */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {profileTypes.map(pt => (
              <button
                key={pt.id}
                onClick={() => setSelectedProfile(pt.id)}
                className={`p-2 rounded-lg text-xs font-medium transition-all ${
                  selectedProfile === pt.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80 text-foreground'
                }`}
              >
                {pt.id}
              </button>
            ))}
          </div>

          {/* Profile Description */}
          <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-lg">
            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium">{profileTypes.find(p => p.id === selectedProfile)?.name}</span>
              <span className="text-muted-foreground"> - {profileTypes.find(p => p.id === selectedProfile)?.description}</span>
            </div>
          </div>

          {/* Input Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Bottom Width (m)</Label>
              <Input
                type="number"
                value={bottomWidth}
                onChange={e => setBottomWidth(parseFloat(e.target.value) || 1)}
                step={0.5}
                min={0.5}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Side Slope (H:V)</Label>
              <Input
                type="number"
                value={sideSlope}
                onChange={e => setSideSlope(parseFloat(e.target.value) || 0)}
                step={0.5}
                min={0}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Discharge Q (m³/s)</Label>
              <Input
                type="number"
                value={discharge}
                onChange={e => setDischarge(parseFloat(e.target.value) || 1)}
                step={1}
                min={0.1}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Bed Slope S₀</Label>
              <Input
                type="number"
                value={bedSlope}
                onChange={e => setBedSlope(parseFloat(e.target.value) || 0.0001)}
                step={0.0001}
                min={0.00001}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Manning's n</Label>
              <Input
                type="number"
                value={manningN}
                onChange={e => setManningN(parseFloat(e.target.value) || 0.01)}
                step={0.005}
                min={0.01}
                max={0.15}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Channel Length (m)</Label>
              <Input
                type="number"
                value={channelLength}
                onChange={e => setChannelLength(parseFloat(e.target.value) || 100)}
                step={50}
                min={50}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Boundary Depth (m)</Label>
              <Input
                type="number"
                value={boundaryDepth}
                onChange={e => setBoundaryDepth(parseFloat(e.target.value) || 0.5)}
                step={0.1}
                min={0.1}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Computation Steps</Label>
              <Input
                type="number"
                value={numSteps}
                onChange={e => setNumSteps(parseInt(e.target.value) || 20)}
                step={10}
                min={10}
                max={200}
                className="h-9"
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Normal Depth (yₙ)</div>
              <div className="text-lg font-bold text-foreground">{normalDepth.toFixed(3)} m</div>
              <div className="text-xs text-muted-foreground">Fr = {normalHydro.Fr.toFixed(3)}</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Critical Depth (yc)</div>
              <div className="text-lg font-bold text-foreground">{criticalDepth.toFixed(3)} m</div>
              <div className="text-xs text-muted-foreground">Fr = 1.000</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Slope Classification</div>
              <div className={`text-lg font-bold ${isMild ? 'text-green-500' : 'text-orange-500'}`}>
                {isMild ? 'Mild (M)' : 'Steep (S)'}
              </div>
              <div className="text-xs text-muted-foreground">yₙ {isMild ? '>' : '<'} yc</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Profile Type</div>
              <div className="text-lg font-bold text-primary">{selectedProfile}</div>
              <div className="text-xs text-muted-foreground">{profile.length} points</div>
            </div>
          </div>

          {/* Profile Visualization */}
          <div className="bg-gradient-to-b from-sky-50 to-blue-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map(frac => (
                <g key={frac}>
                  <line
                    x1={margin.left}
                    y1={margin.top + frac * plotHeight}
                    x2={svgWidth - margin.right}
                    y2={margin.top + frac * plotHeight}
                    stroke="currentColor"
                    strokeOpacity={0.1}
                    strokeDasharray="4,4"
                  />
                  <text
                    x={margin.left - 8}
                    y={margin.top + frac * plotHeight + 4}
                    textAnchor="end"
                    className="text-[10px] fill-muted-foreground"
                  >
                    {(maxDepth * (1 - frac)).toFixed(2)}
                  </text>
                </g>
              ))}

              {/* X-axis labels */}
              {[0, 0.25, 0.5, 0.75, 1].map(frac => (
                <text
                  key={frac}
                  x={margin.left + frac * plotWidth}
                  y={svgHeight - 15}
                  textAnchor="middle"
                  className="text-[10px] fill-muted-foreground"
                >
                  {(frac * channelLength).toFixed(0)}
                </text>
              ))}

              {/* Axis labels */}
              <text
                x={svgWidth / 2}
                y={svgHeight - 2}
                textAnchor="middle"
                className="text-xs fill-muted-foreground"
              >
                Distance (m)
              </text>
              <text
                x={15}
                y={svgHeight / 2}
                textAnchor="middle"
                transform={`rotate(-90, 15, ${svgHeight/2})`}
                className="text-xs fill-muted-foreground"
              >
                Depth (m)
              </text>

              {/* Channel bed */}
              <path
                d={bedPath}
                stroke="#8B4513"
                strokeWidth={3}
                fill="none"
              />

              {/* Normal depth line */}
              <line
                x1={margin.left}
                y1={yScale(normalDepth)}
                x2={svgWidth - margin.right}
                y2={yScale(normalDepth - bedSlope * channelLength)}
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="8,4"
              />
              <text
                x={svgWidth - margin.right + 5}
                y={yScale(normalDepth - bedSlope * channelLength)}
                className="text-[10px] fill-green-500 font-medium"
              >
                yₙ
              </text>

              {/* Critical depth line */}
              <line
                x1={margin.left}
                y1={yScale(criticalDepth)}
                x2={svgWidth - margin.right}
                y2={yScale(criticalDepth - bedSlope * channelLength)}
                stroke="#f97316"
                strokeWidth={2}
                strokeDasharray="4,4"
              />
              <text
                x={svgWidth - margin.right + 5}
                y={yScale(criticalDepth - bedSlope * channelLength)}
                className="text-[10px] fill-orange-500 font-medium"
              >
                yc
              </text>

              {/* Water surface profile */}
              <path
                d={profilePath}
                stroke="#0ea5e9"
                strokeWidth={3}
                fill="none"
              />

              {/* Profile points */}
              {profile.filter((_, i) => i % 5 === 0).map((p, i) => (
                <circle
                  key={i}
                  cx={xScale(p.x)}
                  cy={yScale(p.depth - bedSlope * p.x)}
                  r={4}
                  fill="#0ea5e9"
                  stroke="white"
                  strokeWidth={1.5}
                />
              ))}

              {/* Title */}
              <text
                x={svgWidth / 2}
                y={20}
                textAnchor="middle"
                className="text-sm fill-foreground font-semibold"
              >
                {selectedProfile} Water Surface Profile - Step Backwater Method
              </text>

              {/* Legend */}
              <g transform={`translate(${margin.left + 10}, ${margin.top + 10})`}>
                <rect x={0} y={0} width={140} height={60} fill="white" fillOpacity={0.8} rx={4} />
                <line x1={10} y1={15} x2={35} y2={15} stroke="#0ea5e9" strokeWidth={3} />
                <text x={42} y={18} className="text-[10px] fill-foreground">Water Surface</text>
                <line x1={10} y1={30} x2={35} y2={30} stroke="#22c55e" strokeWidth={2} strokeDasharray="8,4" />
                <text x={42} y={33} className="text-[10px] fill-foreground">Normal Depth (yₙ)</text>
                <line x1={10} y1={45} x2={35} y2={45} stroke="#f97316" strokeWidth={2} strokeDasharray="4,4" />
                <text x={42} y={48} className="text-[10px] fill-foreground">Critical Depth (yc)</text>
              </g>
            </svg>
          </div>

          {/* Profile Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-secondary">
                  <th className="p-2 text-left">Station (m)</th>
                  <th className="p-2 text-left">Depth (m)</th>
                  <th className="p-2 text-left">Velocity (m/s)</th>
                  <th className="p-2 text-left">Froude No.</th>
                  <th className="p-2 text-left">Specific Energy (m)</th>
                </tr>
              </thead>
              <tbody>
                {profile.filter((_, i) => i % Math.ceil(numSteps / 10) === 0).map((p, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-2 font-mono">{p.x.toFixed(1)}</td>
                    <td className="p-2 font-mono">{p.depth.toFixed(3)}</td>
                    <td className="p-2 font-mono">{p.velocity.toFixed(3)}</td>
                    <td className={`p-2 font-mono ${p.froude > 1 ? 'text-orange-500' : 'text-green-500'}`}>
                      {p.froude.toFixed(3)}
                    </td>
                    <td className="p-2 font-mono">{p.specificEnergy.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Interpretive Insights */}
          <CalculatorInsights 
            insights={generateGVFInsights(normalDepth, criticalDepth, isMild, selectedProfile, boundaryDepth)}
          />

          {/* Interactive Quiz */}
          <CalculatorQuiz 
            title="GVF Profile Quiz"
            questions={gvfQuizQuestions}
            calculatorValues={{
              normalDepth,
              criticalDepth,
              boundaryDepth,
              selectedProfile
            }}
          />
        </motion.div>
      )}
    </div>
  );
};
