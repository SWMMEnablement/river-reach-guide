import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Waves, ChevronDown, ChevronUp, Info, Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalculatorInsights, generateWeirInsights, generateOrificeInsights } from './CalculatorInsights';
import { CalculatorQuiz, weirOrificeQuizQuestions } from './CalculatorQuiz';

interface WeirType {
  id: string;
  name: string;
  formula: string;
  defaultCd: number;
  description: string;
  coefficients: { condition: string; Cd: number }[];
}

const weirTypes: WeirType[] = [
  {
    id: 'sharp-crested',
    name: 'Sharp-Crested Weir',
    formula: 'Q = Cd × (2/3) × √(2g) × L × H^(3/2)',
    defaultCd: 0.62,
    description: 'Thin plate weir with sharp upstream edge. Flow separates at crest.',
    coefficients: [
      { condition: 'Fully contracted (L < 0.3W)', Cd: 0.59 },
      { condition: 'Partially contracted', Cd: 0.62 },
      { condition: 'Suppressed (L = W)', Cd: 0.65 },
      { condition: 'Rehbock formula correction', Cd: 0.602 },
    ]
  },
  {
    id: 'broad-crested',
    name: 'Broad-Crested Weir',
    formula: 'Q = Cd × L × H × √(2gH)',
    defaultCd: 0.544,
    description: 'Horizontal crest with length > 2-3× head. Flow becomes parallel over crest.',
    coefficients: [
      { condition: 'Square upstream edge', Cd: 0.46 },
      { condition: 'Rounded upstream (r/H > 0.1)', Cd: 0.54 },
      { condition: 'Well-rounded (r/H > 0.2)', Cd: 0.56 },
      { condition: 'Long crest (L/H > 10)', Cd: 0.50 },
    ]
  },
  {
    id: 'ogee',
    name: 'Ogee (Overflow) Weir',
    formula: 'Q = C × L × H^(3/2)',
    defaultCd: 2.18,
    description: 'Curved spillway shape following nappe profile. Used in dam spillways.',
    coefficients: [
      { condition: 'Design head (H = Hd)', Cd: 2.18 },
      { condition: 'H/Hd = 0.5', Cd: 2.03 },
      { condition: 'H/Hd = 1.5', Cd: 2.26 },
      { condition: 'H/Hd = 2.0', Cd: 2.32 },
    ]
  },
  {
    id: 'v-notch',
    name: 'V-Notch (Triangular) Weir',
    formula: 'Q = Cd × (8/15) × √(2g) × tan(θ/2) × H^(5/2)',
    defaultCd: 0.58,
    description: 'Triangular opening, ideal for measuring small flows with high accuracy.',
    coefficients: [
      { condition: '90° notch angle', Cd: 0.578 },
      { condition: '60° notch angle', Cd: 0.576 },
      { condition: '45° notch angle', Cd: 0.574 },
      { condition: '30° notch angle', Cd: 0.572 },
    ]
  },
  {
    id: 'cipoletti',
    name: 'Cipoletti (Trapezoidal) Weir',
    formula: 'Q = 1.859 × L × H^(3/2)',
    defaultCd: 0.63,
    description: 'Trapezoidal shape with 1:4 side slopes to compensate for end contractions.',
    coefficients: [
      { condition: 'Standard 1:4 side slopes', Cd: 0.63 },
      { condition: 'With full aeration', Cd: 0.62 },
      { condition: 'Suppressed contractions', Cd: 0.65 },
    ]
  },
];

interface OrificeType {
  id: string;
  name: string;
  formula: string;
  defaultCd: number;
  description: string;
  coefficients: { condition: string; Cd: number }[];
}

const orificeTypes: OrificeType[] = [
  {
    id: 'sharp-circular',
    name: 'Sharp-Edged Circular',
    formula: 'Q = Cd × A × √(2gH)',
    defaultCd: 0.61,
    description: 'Circular opening with sharp edge. Most common orifice type.',
    coefficients: [
      { condition: 'Free discharge', Cd: 0.61 },
      { condition: 'Submerged discharge', Cd: 0.61 },
      { condition: 'Short tube (L/D < 2)', Cd: 0.82 },
      { condition: 'Long tube (L/D > 5)', Cd: 0.98 },
    ]
  },
  {
    id: 'sharp-rectangular',
    name: 'Sharp-Edged Rectangular',
    formula: 'Q = Cd × A × √(2gH)',
    defaultCd: 0.61,
    description: 'Rectangular opening with sharp edges. Common in sluice gates.',
    coefficients: [
      { condition: 'Free discharge', Cd: 0.60 },
      { condition: 'Submerged discharge', Cd: 0.61 },
      { condition: 'Bottom contraction only', Cd: 0.63 },
      { condition: 'Full contraction', Cd: 0.59 },
    ]
  },
  {
    id: 'rounded',
    name: 'Rounded/Bell-Mouth',
    formula: 'Q = Cd × A × √(2gH)',
    defaultCd: 0.98,
    description: 'Smooth entry reduces contraction losses. Used in intake structures.',
    coefficients: [
      { condition: 'Well-rounded entry', Cd: 0.98 },
      { condition: 'Slightly rounded (r/D = 0.05)', Cd: 0.92 },
      { condition: 'Moderately rounded (r/D = 0.1)', Cd: 0.95 },
      { condition: 'Bell-mouth entry', Cd: 0.99 },
    ]
  },
  {
    id: 'sluice-gate',
    name: 'Sluice Gate',
    formula: 'Q = Cd × b × a × √(2g × y₁)',
    defaultCd: 0.60,
    description: 'Vertical gate controlling flow under. Free or submerged conditions.',
    coefficients: [
      { condition: 'Free flow (y₂/a < 0.67)', Cd: 0.60 },
      { condition: 'Submerged flow', Cd: 0.55 },
      { condition: 'Sharp-edged gate', Cd: 0.58 },
      { condition: 'Rounded gate lip', Cd: 0.65 },
    ]
  },
];

export const WeirOrificeCalculator = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('weir');
  
  // Weir inputs
  const [weirType, setWeirType] = useState('sharp-crested');
  const [weirLength, setWeirLength] = useState(2);
  const [weirHead, setWeirHead] = useState(0.3);
  const [weirCd, setWeirCd] = useState(0.62);
  const [vNotchAngle, setVNotchAngle] = useState(90);
  
  // Orifice inputs
  const [orificeType, setOrificeType] = useState('sharp-circular');
  const [orificeDiameter, setOrificeDiameter] = useState(0.3);
  const [orificeWidth, setOrificeWidth] = useState(0.5);
  const [orificeHeight, setOrificeHeight] = useState(0.3);
  const [orificeHead, setOrificeHead] = useState(2);
  const [orificeCd, setOrificeCd] = useState(0.61);

  const g = 9.81;

  const weirCalc = useMemo(() => {
    const L = weirLength;
    const H = weirHead;
    const Cd = weirCd;
    const theta = (vNotchAngle * Math.PI) / 180;

    let Q = 0;
    let formula = '';
    let velocity = 0;

    switch (weirType) {
      case 'sharp-crested':
        Q = Cd * (2/3) * Math.sqrt(2 * g) * L * Math.pow(H, 1.5);
        formula = `Q = ${Cd.toFixed(3)} × (2/3) × √(2×${g}) × ${L} × ${H}^1.5`;
        velocity = Q / (L * H);
        break;
      case 'broad-crested':
        Q = Cd * L * H * Math.sqrt(2 * g * H);
        formula = `Q = ${Cd.toFixed(3)} × ${L} × ${H} × √(2×${g}×${H})`;
        velocity = Q / (L * H);
        break;
      case 'ogee':
        Q = Cd * L * Math.pow(H, 1.5);
        formula = `Q = ${Cd.toFixed(3)} × ${L} × ${H}^1.5`;
        velocity = Q / (L * H);
        break;
      case 'v-notch':
        Q = Cd * (8/15) * Math.sqrt(2 * g) * Math.tan(theta/2) * Math.pow(H, 2.5);
        formula = `Q = ${Cd.toFixed(3)} × (8/15) × √(2×${g}) × tan(${vNotchAngle/2}°) × ${H}^2.5`;
        const topWidth = 2 * H * Math.tan(theta/2);
        velocity = Q / (0.5 * topWidth * H);
        break;
      case 'cipoletti':
        Q = 1.859 * L * Math.pow(H, 1.5);
        formula = `Q = 1.859 × ${L} × ${H}^1.5`;
        velocity = Q / (L * H);
        break;
    }

    const froudeApproach = velocity / Math.sqrt(g * H);

    return { Q, formula, velocity, froudeApproach };
  }, [weirType, weirLength, weirHead, weirCd, vNotchAngle]);

  const orificeCalc = useMemo(() => {
    const H = orificeHead;
    const Cd = orificeCd;
    
    let A = 0;
    let Q = 0;
    let formula = '';

    if (orificeType === 'sharp-circular' || orificeType === 'rounded') {
      A = Math.PI * Math.pow(orificeDiameter, 2) / 4;
      Q = Cd * A * Math.sqrt(2 * g * H);
      formula = `Q = ${Cd.toFixed(3)} × π×(${orificeDiameter})²/4 × √(2×${g}×${H})`;
    } else if (orificeType === 'sharp-rectangular' || orificeType === 'sluice-gate') {
      A = orificeWidth * orificeHeight;
      Q = Cd * A * Math.sqrt(2 * g * H);
      formula = `Q = ${Cd.toFixed(3)} × ${orificeWidth}×${orificeHeight} × √(2×${g}×${H})`;
    }

    const velocity = Q / A;
    const velocityHead = velocity * velocity / (2 * g);
    const Cc = Cd / 0.99; // Approximate contraction coefficient

    return { Q, A, formula, velocity, velocityHead, Cc };
  }, [orificeType, orificeDiameter, orificeWidth, orificeHeight, orificeHead, orificeCd]);

  const selectedWeir = weirTypes.find(w => w.id === weirType);
  const selectedOrifice = orificeTypes.find(o => o.id === orificeType);

  return (
    <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <Waves className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">Weir & Orifice Calculator</h3>
            <p className="text-xs text-muted-foreground">Discharge calculations with coefficient lookup tables</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 border-t border-border"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="weir">Weir Flow</TabsTrigger>
              <TabsTrigger value="orifice">Orifice Flow</TabsTrigger>
            </TabsList>

            <TabsContent value="weir" className="space-y-4">
              {/* Weir Type Selection */}
              <div className="space-y-2">
                <Label>Weir Type</Label>
                <Select value={weirType} onValueChange={(v) => {
                  setWeirType(v);
                  const weir = weirTypes.find(w => w.id === v);
                  if (weir) setWeirCd(weir.defaultCd);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {weirTypes.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Weir Description */}
              <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-lg">
                <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-muted-foreground">{selectedWeir?.description}</p>
                  <p className="font-mono text-xs mt-1 text-foreground">{selectedWeir?.formula}</p>
                </div>
              </div>

              {/* Weir Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {weirType !== 'v-notch' && (
                  <div className="space-y-1">
                    <Label className="text-xs">Crest Length L (m)</Label>
                    <Input
                      type="number"
                      value={weirLength}
                      onChange={e => setWeirLength(parseFloat(e.target.value) || 0.1)}
                      step={0.1}
                      min={0.1}
                      className="h-9"
                    />
                  </div>
                )}
                {weirType === 'v-notch' && (
                  <div className="space-y-1">
                    <Label className="text-xs">Notch Angle θ (°)</Label>
                    <Input
                      type="number"
                      value={vNotchAngle}
                      onChange={e => setVNotchAngle(parseFloat(e.target.value) || 90)}
                      step={15}
                      min={15}
                      max={120}
                      className="h-9"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-xs">Head H (m)</Label>
                  <Input
                    type="number"
                    value={weirHead}
                    onChange={e => setWeirHead(parseFloat(e.target.value) || 0.01)}
                    step={0.05}
                    min={0.01}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Discharge Coef. Cd</Label>
                  <Input
                    type="number"
                    value={weirCd}
                    onChange={e => setWeirCd(parseFloat(e.target.value) || 0.5)}
                    step={0.01}
                    min={0.1}
                    max={3}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Coefficient Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="p-2 text-left">Condition</th>
                      <th className="p-2 text-left">Cd</th>
                      <th className="p-2 text-left">Use</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedWeir?.coefficients.map((c, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="p-2">{c.condition}</td>
                        <td className="p-2 font-mono font-medium">{c.Cd.toFixed(3)}</td>
                        <td className="p-2">
                          <button
                            onClick={() => setWeirCd(c.Cd)}
                            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20"
                          >
                            Apply
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Weir Results */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
                  <div className="text-xs text-muted-foreground">Discharge Q</div>
                  <div className="text-xl font-bold text-primary">{weirCalc.Q.toFixed(4)} m³/s</div>
                  <div className="text-xs text-muted-foreground">{(weirCalc.Q * 1000).toFixed(1)} L/s</div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Approach Velocity</div>
                  <div className="text-lg font-bold text-foreground">{weirCalc.velocity.toFixed(3)} m/s</div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Froude (approach)</div>
                  <div className={`text-lg font-bold ${weirCalc.froudeApproach > 1 ? 'text-orange-500' : 'text-green-500'}`}>
                    {weirCalc.froudeApproach.toFixed(3)}
                  </div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Cd Used</div>
                  <div className="text-lg font-bold text-foreground">{weirCd.toFixed(3)}</div>
                </div>
              </div>

              {/* Weir Diagram */}
              <div className="bg-gradient-to-b from-sky-50 to-blue-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4">
                <svg viewBox="0 0 400 200" className="w-full">
                  {/* Weir structure */}
                  <rect x="160" y="80" width="80" height="100" fill="#6b7280" stroke="#374151" strokeWidth="2" />
                  
                  {/* Water upstream */}
                  <path
                    d="M 20 60 L 160 60 L 160 80 L 20 80 Z"
                    fill="#0ea5e9"
                    fillOpacity={0.5}
                  />
                  <rect x="20" y="80" width="140" height="100" fill="#0ea5e9" fillOpacity={0.3} />
                  
                  {/* Nappe over weir */}
                  <path
                    d="M 160 60 Q 200 55 240 100 Q 260 140 280 160"
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="3"
                  />
                  
                  {/* Dimensions */}
                  <line x1="160" y1="60" x2="160" y2="80" stroke="#dc2626" strokeWidth="2" />
                  <line x1="150" y1="60" x2="170" y2="60" stroke="#dc2626" strokeWidth="1" />
                  <line x1="150" y1="80" x2="170" y2="80" stroke="#dc2626" strokeWidth="1" />
                  <text x="140" y="73" className="text-xs fill-red-500 font-medium">H</text>
                  
                  {/* Labels */}
                  <text x="80" y="95" className="text-xs fill-blue-600 font-medium">Upstream</text>
                  <text x="300" y="140" className="text-xs fill-blue-600 font-medium">Nappe</text>
                  <text x="185" y="140" className="text-xs fill-gray-600 font-medium">Weir</text>
                  
                  {/* Flow arrow */}
                  <path d="M 100 70 L 130 70 L 125 65 M 130 70 L 125 75" stroke="#0ea5e9" strokeWidth="2" fill="none" />
                </svg>
              </div>

              {/* Weir Interpretive Insights */}
              <CalculatorInsights 
                insights={generateWeirInsights(weirType, weirCalc.Q, weirHead, weirCalc.froudeApproach, weirCd)}
              />
            </TabsContent>

            <TabsContent value="orifice" className="space-y-4">
              {/* Orifice Type Selection */}
              <div className="space-y-2">
                <Label>Orifice Type</Label>
                <Select value={orificeType} onValueChange={(v) => {
                  setOrificeType(v);
                  const orifice = orificeTypes.find(o => o.id === v);
                  if (orifice) setOrificeCd(orifice.defaultCd);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orificeTypes.map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Orifice Description */}
              <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-lg">
                <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-muted-foreground">{selectedOrifice?.description}</p>
                  <p className="font-mono text-xs mt-1 text-foreground">{selectedOrifice?.formula}</p>
                </div>
              </div>

              {/* Orifice Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(orificeType === 'sharp-circular' || orificeType === 'rounded') && (
                  <div className="space-y-1">
                    <Label className="text-xs">Diameter D (m)</Label>
                    <Input
                      type="number"
                      value={orificeDiameter}
                      onChange={e => setOrificeDiameter(parseFloat(e.target.value) || 0.1)}
                      step={0.05}
                      min={0.01}
                      className="h-9"
                    />
                  </div>
                )}
                {(orificeType === 'sharp-rectangular' || orificeType === 'sluice-gate') && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs">Width b (m)</Label>
                      <Input
                        type="number"
                        value={orificeWidth}
                        onChange={e => setOrificeWidth(parseFloat(e.target.value) || 0.1)}
                        step={0.1}
                        min={0.01}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Height a (m)</Label>
                      <Input
                        type="number"
                        value={orificeHeight}
                        onChange={e => setOrificeHeight(parseFloat(e.target.value) || 0.1)}
                        step={0.05}
                        min={0.01}
                        className="h-9"
                      />
                    </div>
                  </>
                )}
                <div className="space-y-1">
                  <Label className="text-xs">Head H (m)</Label>
                  <Input
                    type="number"
                    value={orificeHead}
                    onChange={e => setOrificeHead(parseFloat(e.target.value) || 0.1)}
                    step={0.5}
                    min={0.1}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Discharge Coef. Cd</Label>
                  <Input
                    type="number"
                    value={orificeCd}
                    onChange={e => setOrificeCd(parseFloat(e.target.value) || 0.5)}
                    step={0.01}
                    min={0.1}
                    max={1}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Coefficient Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="p-2 text-left">Condition</th>
                      <th className="p-2 text-left">Cd</th>
                      <th className="p-2 text-left">Use</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrifice?.coefficients.map((c, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="p-2">{c.condition}</td>
                        <td className="p-2 font-mono font-medium">{c.Cd.toFixed(2)}</td>
                        <td className="p-2">
                          <button
                            onClick={() => setOrificeCd(c.Cd)}
                            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20"
                          >
                            Apply
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Orifice Results */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
                  <div className="text-xs text-muted-foreground">Discharge Q</div>
                  <div className="text-xl font-bold text-primary">{orificeCalc.Q.toFixed(4)} m³/s</div>
                  <div className="text-xs text-muted-foreground">{(orificeCalc.Q * 1000).toFixed(1)} L/s</div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Jet Velocity</div>
                  <div className="text-lg font-bold text-foreground">{orificeCalc.velocity.toFixed(3)} m/s</div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Velocity Head</div>
                  <div className="text-lg font-bold text-foreground">{orificeCalc.velocityHead.toFixed(3)} m</div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Orifice Area</div>
                  <div className="text-lg font-bold text-foreground">{orificeCalc.A.toFixed(4)} m²</div>
                </div>
              </div>

              {/* Orifice Diagram */}
              <div className="bg-gradient-to-b from-sky-50 to-blue-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4">
                <svg viewBox="0 0 400 200" className="w-full">
                  {/* Tank */}
                  <rect x="60" y="40" width="120" height="140" fill="none" stroke="#6b7280" strokeWidth="3" />
                  
                  {/* Water in tank */}
                  <rect x="63" y="50" width="114" height="127" fill="#0ea5e9" fillOpacity={0.3} />
                  
                  {/* Orifice opening */}
                  <rect x="177" y="130" width="6" height="30" fill="#374151" />
                  
                  {/* Water jet */}
                  <path
                    d="M 183 145 Q 240 145 300 180"
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="8"
                    strokeLinecap="round"
                    opacity={0.6}
                  />
                  
                  {/* Vena contracta */}
                  <ellipse cx="210" cy="145" rx="5" ry="8" fill="#0ea5e9" opacity={0.8} />
                  
                  {/* Head dimension */}
                  <line x1="40" y1="50" x2="40" y2="145" stroke="#dc2626" strokeWidth="2" />
                  <line x1="35" y1="50" x2="55" y2="50" stroke="#dc2626" strokeWidth="1" />
                  <line x1="35" y1="145" x2="55" y2="145" stroke="#dc2626" strokeWidth="1" />
                  <text x="25" y="100" className="text-xs fill-red-500 font-medium">H</text>
                  
                  {/* Labels */}
                  <text x="100" y="30" className="text-xs fill-gray-600 font-medium">Tank</text>
                  <text x="250" y="130" className="text-xs fill-blue-600 font-medium">Jet</text>
                  <text x="200" y="130" className="text-[10px] fill-blue-800">Vena contracta</text>
                  
                  {/* Flow arrow */}
                  <path d="M 220 145 L 250 155 L 245 150 M 250 155 L 245 160" stroke="#0ea5e9" strokeWidth="2" fill="none" />
                </svg>
              </div>

              {/* Orifice Interpretive Insights */}
              <CalculatorInsights 
                insights={generateOrificeInsights(orificeType, orificeCalc.Q, orificeCalc.velocity, orificeCd, orificeHead)}
              />
            </TabsContent>
          </Tabs>

          {/* Interactive Quiz (shared for both tabs) */}
          <CalculatorQuiz 
            title="Weir & Orifice Quiz"
            questions={weirOrificeQuizQuestions}
          />
        </motion.div>
      )}
    </div>
  );
};
