import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Waves, AlertTriangle, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

type JumpClassification = 'undular' | 'weak' | 'oscillating' | 'steady' | 'strong';

interface JumpResult {
  y2: number;
  energyLoss: number;
  efficiencyPercent: number;
  jumpLength: number;
  classification: JumpClassification;
  Fr1: number;
  V1: number;
  V2: number;
  E1: number;
  E2: number;
  momentumBefore: number;
  momentumAfter: number;
}

const classifyJump = (Fr1: number): JumpClassification => {
  if (Fr1 < 1.7) return 'undular';
  if (Fr1 < 2.5) return 'weak';
  if (Fr1 < 4.5) return 'oscillating';
  if (Fr1 < 9.0) return 'steady';
  return 'strong';
};

const jumpInfo: Record<JumpClassification, { label: string; color: string; description: string }> = {
  undular: {
    label: 'Undular Jump',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    description: 'Fr₁ = 1.0–1.7. Standing waves with little energy loss (~5%). Surface remains smooth.',
  },
  weak: {
    label: 'Weak Jump',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    description: 'Fr₁ = 1.7–2.5. Small rollers on the surface. Energy loss ~15–18%. Well-defined but low turbulence.',
  },
  oscillating: {
    label: 'Oscillating Jump',
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    description: 'Fr₁ = 2.5–4.5. Unstable, pulsating jet. Generates irregular waves downstream. Avoid in design if possible.',
  },
  steady: {
    label: 'Steady Jump',
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
    description: 'Fr₁ = 4.5–9.0. Well-balanced, stable jump with 45–70% energy dissipation. Best for stilling basin design.',
  },
  strong: {
    label: 'Strong Jump',
    color: 'bg-red-500/10 text-red-600 border-red-500/30',
    description: 'Fr₁ > 9.0. Rough, choppy jump with >70% energy dissipation. Requires robust stilling basin structure.',
  },
};

const HydraulicJumpCalculator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [bottomWidth, setBottomWidth] = useState(parseFloat(searchParams.get('b') || '') || 5.0);
  const [sideSlope, setSideSlope] = useState(parseFloat(searchParams.get('z') || '') || 0);
  const [discharge, setDischarge] = useState(parseFloat(searchParams.get('Q') || '') || 15.0);
  const [y1, setY1] = useState(parseFloat(searchParams.get('y1') || '') || 0.3);

  const result = useMemo<JumpResult | null>(() => {
    const g = 9.81;
    if (bottomWidth <= 0 || discharge <= 0 || y1 <= 0) return null;

    // Upstream area & velocity (trapezoidal)
    const A1 = (bottomWidth + sideSlope * y1) * y1;
    const T1 = bottomWidth + 2 * sideSlope * y1;
    const V1 = discharge / A1;
    const D1 = A1 / T1;
    const Fr1 = V1 / Math.sqrt(g * D1);

    if (Fr1 <= 1) return null; // no jump if subcritical

    // Sequent depth — Bélanger (exact for rectangular, approximate for trapezoidal)
    let y2: number;
    if (sideSlope === 0) {
      y2 = (y1 / 2) * (Math.sqrt(1 + 8 * Fr1 * Fr1) - 1);
    } else {
      // Iterative momentum balance for trapezoidal
      y2 = y1 * 2;
      for (let i = 0; i < 60; i++) {
        const A2 = (bottomWidth + sideSlope * y2) * y2;
        const T2 = bottomWidth + 2 * sideSlope * y2;
        const V2 = discharge / A2;
        // Momentum function: M = Q²/(gA) + Ā·ȳ  (ȳ = centroid depth)
        const yBar1 = ((bottomWidth * y1 * y1 / 2) + (sideSlope * y1 * y1 * y1 / 3)) / A1;
        const yBar2 = ((bottomWidth * y2 * y2 / 2) + (sideSlope * y2 * y2 * y2 / 3)) / A2;
        const M1 = (discharge * discharge) / (g * A1) + A1 * yBar1;
        const M2 = (discharge * discharge) / (g * A2) + A2 * yBar2;
        const err = M2 - M1;
        // Newton step
        const dA2 = bottomWidth + 2 * sideSlope * y2;
        const dM2 = -(discharge * discharge * dA2) / (g * A2 * A2) + dA2 * yBar2 + A2 * y2 * (bottomWidth + sideSlope * y2) / A2;
        if (Math.abs(dM2) < 1e-12) break;
        const y2New = y2 - err / dM2;
        if (Math.abs(y2New - y2) < 1e-6) break;
        y2 = Math.max(y1 * 1.01, y2New);
      }
    }

    const A2 = (bottomWidth + sideSlope * y2) * y2;
    const V2 = discharge / A2;

    const E1 = y1 + (V1 * V1) / (2 * g);
    const E2 = y2 + (V2 * V2) / (2 * g);
    const energyLoss = E1 - E2;
    const efficiencyPercent = ((E1 - E2) / E1) * 100;

    // Jump length approximation (USBR): L ≈ 6.1 × y2
    const jumpLength = 6.1 * y2;

    const yBar1 = ((bottomWidth * y1 * y1 / 2) + (sideSlope * y1 * y1 * y1 / 3)) / A1;
    const yBar2 = ((bottomWidth * y2 * y2 / 2) + (sideSlope * y2 * y2 * y2 / 3)) / A2;
    const momentumBefore = (discharge * discharge) / (g * A1) + A1 * yBar1;
    const momentumAfter = (discharge * discharge) / (g * A2) + A2 * yBar2;

    return {
      y2,
      energyLoss,
      efficiencyPercent,
      jumpLength,
      classification: classifyJump(Fr1),
      Fr1,
      V1,
      V2,
      E1,
      E2,
      momentumBefore,
      momentumAfter,
    };
  }, [bottomWidth, sideSlope, discharge, y1]);

  const renderJumpVisualization = () => {
    const w = 560;
    const h = 260;
    const m = { t: 30, r: 20, b: 30, l: 50 };
    const pw = w - m.l - m.r;
    const ph = h - m.t - m.b;

    if (!result) {
      return (
        <svg width={w} height={h} className="mx-auto">
          <rect x={m.l} y={m.t} width={pw} height={ph} fill="hsl(var(--muted) / 0.3)" rx={4} />
          <text x={w / 2} y={h / 2} textAnchor="middle" className="text-sm fill-muted-foreground">
            Enter supercritical upstream depth (Fr₁ {'>'} 1) to see the jump
          </text>
        </svg>
      );
    }

    const maxY = result.y2 * 1.5;
    const scaleY = (d: number) => m.t + ph - (d / maxY) * ph;
    const bedY = scaleY(0);
    const jumpX = m.l + pw * 0.4; // jump at 40%

    // Upstream water surface (flat, shallow)
    const upY = scaleY(y1);
    // Downstream water surface (flat, deep)
    const downY = scaleY(result.y2);

    // Animated turbulence circles
    const turbulenceCircles = Array.from({ length: 8 }, (_, i) => ({
      cx: jumpX + (i - 4) * 8 + Math.sin(i * 1.3) * 6,
      cy: scaleY(y1 + (result.y2 - y1) * (0.3 + Math.random() * 0.5)),
      r: 3 + Math.random() * 4,
      delay: i * 0.15,
    }));

    return (
      <svg width={w} height={h} className="mx-auto" viewBox={`0 0 ${w} ${h}`}>
        {/* Grid */}
        <defs>
          <pattern id="jumpgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--muted))" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="waterUp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="waterDown" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <rect x={m.l} y={m.t} width={pw} height={ph} fill="url(#jumpgrid)" />

        {/* Bed */}
        <line x1={m.l} y1={bedY} x2={m.l + pw} y2={bedY} stroke="hsl(var(--foreground))" strokeWidth="3" />

        {/* Upstream water fill */}
        <rect x={m.l} y={upY} width={jumpX - m.l} height={bedY - upY} fill="url(#waterUp)" />
        {/* Upstream surface */}
        <line x1={m.l} y1={upY} x2={jumpX} y2={upY} stroke="hsl(var(--primary))" strokeWidth="2.5" />

        {/* Downstream water fill */}
        <rect x={jumpX + 30} y={downY} width={m.l + pw - jumpX - 30} height={bedY - downY} fill="url(#waterDown)" />
        {/* Downstream surface */}
        <line x1={jumpX + 30} y1={downY} x2={m.l + pw} y2={downY} stroke="hsl(var(--primary))" strokeWidth="2.5" />

        {/* Jump transition (turbulent) */}
        <path
          d={`M ${jumpX},${upY} C ${jumpX + 8},${upY - 10} ${jumpX + 15},${downY - 8} ${jumpX + 30},${downY}`}
          fill="none"
          stroke="hsl(var(--destructive))"
          strokeWidth="2.5"
          strokeDasharray="4,2"
        />
        {/* Fill the jump zone */}
        <path
          d={`M ${jumpX},${upY} C ${jumpX + 8},${upY - 10} ${jumpX + 15},${downY - 8} ${jumpX + 30},${downY} L ${jumpX + 30},${bedY} L ${jumpX},${bedY} Z`}
          fill="hsl(var(--destructive) / 0.12)"
        />

        {/* Turbulence bubbles */}
        {turbulenceCircles.map((c, i) => (
          <motion.circle
            key={i}
            cx={c.cx}
            cy={c.cy}
            r={c.r}
            fill="hsl(var(--primary) / 0.3)"
            stroke="hsl(var(--primary) / 0.5)"
            strokeWidth="0.5"
            animate={{ cy: [c.cy, c.cy - 8, c.cy], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5 + c.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* Flow arrows */}
        <defs>
          <marker id="jumparrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--muted-foreground))" />
          </marker>
        </defs>
        {[0.15, 0.25, 0.35].map((frac, i) => {
          const ay = scaleY(y1 * frac * 2);
          return (
            <motion.line
              key={i}
              x1={m.l + 20}
              y1={ay}
              x2={jumpX - 15}
              y2={ay}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="1.5"
              markerEnd="url(#jumparrow)"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
            />
          );
        })}

        {/* Depth labels */}
        <text x={m.l - 5} y={upY + 4} textAnchor="end" className="text-xs fill-foreground font-medium">y₁</text>
        <text x={m.l + pw + 5} y={downY + 4} className="text-xs fill-foreground font-medium">y₂</text>

        {/* Dimension lines */}
        <line x1={m.l + 10} y1={bedY} x2={m.l + 10} y2={upY} stroke="hsl(var(--foreground))" strokeWidth="1" strokeDasharray="3,2" />
        <text x={m.l + 15} y={(bedY + upY) / 2 + 4} className="text-[10px] fill-muted-foreground">{y1.toFixed(2)}m</text>

        <line x1={m.l + pw - 10} y1={bedY} x2={m.l + pw - 10} y2={downY} stroke="hsl(var(--foreground))" strokeWidth="1" strokeDasharray="3,2" />
        <text x={m.l + pw - 15} y={(bedY + downY) / 2 + 4} textAnchor="end" className="text-[10px] fill-muted-foreground">{result.y2.toFixed(2)}m</text>

        {/* Jump label */}
        <text x={jumpX + 15} y={m.t + 15} textAnchor="middle" className="text-xs fill-destructive font-bold">
          HYDRAULIC JUMP
        </text>

        {/* Classification badge */}
        <text x={jumpX + 15} y={m.t + 28} textAnchor="middle" className="text-[10px] fill-muted-foreground">
          {jumpInfo[result.classification].label} (Fr₁ = {result.Fr1.toFixed(2)})
        </text>

        {/* Y-axis label */}
        <text x={m.l - 5} y={bedY + 4} textAnchor="end" className="text-xs fill-muted-foreground">0</text>
        <text x={m.l - 5} y={m.t + 12} textAnchor="end" className="text-xs fill-muted-foreground">{maxY.toFixed(1)}m</text>
      </svg>
    );
  };

  const info = result ? jumpInfo[result.classification] : null;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Hydraulic Jump Calculator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Bélanger equation for sequent depth, energy loss, jump classification &amp; animated visualization
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label>Bottom Width (m)</Label>
            <Input type="number" step="0.5" value={bottomWidth} onChange={(e) => setBottomWidth(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Side Slope (H:V)</Label>
            <Input type="number" step="0.5" min="0" value={sideSlope} onChange={(e) => setSideSlope(parseFloat(e.target.value) || 0)} />
            <span className="text-[10px] text-muted-foreground">0 = rectangular</span>
          </div>
          <div>
            <Label>Discharge Q (m³/s)</Label>
            <Input type="number" step="1" value={discharge} onChange={(e) => setDischarge(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Upstream Depth y₁ (m)</Label>
            <Input type="number" step="0.05" value={y1} onChange={(e) => setY1(parseFloat(e.target.value) || 0)} />
          </div>
        </div>

        {/* Visualization */}
        <div className="bg-background/50 rounded-lg p-4 overflow-x-auto">
          {renderJumpVisualization()}
        </div>

        {/* Results */}
        {result ? (
          <>
            {/* Classification card */}
            <div className={`rounded-xl border-2 p-4 ${info!.color}`}>
              <div className="flex items-center gap-2 font-semibold text-lg mb-1">
                {result.classification === 'strong' || result.classification === 'steady' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Waves className="w-5 h-5" />
                )}
                {info!.label}
              </div>
              <p className="text-sm opacity-90">{info!.description}</p>
            </div>

            {/* Key results grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-primary">{result.Fr1.toFixed(3)}</div>
                <div className="text-xs text-muted-foreground">Upstream Froude Fr₁</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-lg font-bold">{result.y2.toFixed(3)} m</div>
                <div className="text-xs text-muted-foreground">Sequent Depth y₂</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-destructive">{result.energyLoss.toFixed(3)} m</div>
                <div className="text-xs text-muted-foreground">Energy Loss ΔE</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-lg font-bold">{result.efficiencyPercent.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Dissipation Efficiency</div>
              </div>
            </div>

            {/* Detailed results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4 space-y-2 text-sm">
                  <h4 className="font-semibold flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Before Jump (Supercritical)</h4>
                  <div className="flex justify-between"><span className="text-muted-foreground">Depth y₁</span><span className="font-mono">{y1.toFixed(3)} m</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Velocity V₁</span><span className="font-mono">{result.V1.toFixed(2)} m/s</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Specific Energy E₁</span><span className="font-mono">{result.E1.toFixed(3)} m</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Froude Fr₁</span><span className="font-mono">{result.Fr1.toFixed(3)}</span></div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 space-y-2 text-sm">
                  <h4 className="font-semibold flex items-center gap-2"><ArrowRight className="w-4 h-4" /> After Jump (Subcritical)</h4>
                  <div className="flex justify-between"><span className="text-muted-foreground">Depth y₂</span><span className="font-mono">{result.y2.toFixed(3)} m</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Velocity V₂</span><span className="font-mono">{result.V2.toFixed(2)} m/s</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Specific Energy E₂</span><span className="font-mono">{result.E2.toFixed(3)} m</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Depth Ratio y₂/y₁</span><span className="font-mono">{(result.y2 / y1).toFixed(2)}</span></div>
                </CardContent>
              </Card>
            </div>

            {/* Jump length & design */}
            <div className="bg-muted/20 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-sm">Stilling Basin Design Guidance</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Estimated Jump Length:</span>
                  <span className="font-mono ml-2">{result.jumpLength.toFixed(1)} m</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Momentum Check (M₁ ≈ M₂):</span>
                  <span className="font-mono ml-2">{((result.momentumAfter / result.momentumBefore) * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">USBR Basin Type:</span>
                  <span className="font-mono ml-2">
                    {result.Fr1 < 2.5 ? 'Type IV' : result.Fr1 < 4.5 ? 'Type II or III' : 'Type I or II'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Jump length estimated as L ≈ 6.1 × y₂ (USBR empirical formula). For detailed stilling basin design, refer to USBR Engineering Monograph No. 25.
              </p>
            </div>

            {/* Jump classification reference */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Jump Classification Reference</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {(Object.entries(jumpInfo) as [JumpClassification, typeof jumpInfo[JumpClassification]][]).map(([key, val]) => (
                  <div
                    key={key}
                    className={`rounded-lg border p-2 text-xs ${val.color} ${result.classification === key ? 'ring-2 ring-primary' : 'opacity-60'}`}
                  >
                    <div className="font-semibold">{val.label}</div>
                    <div className="text-muted-foreground mt-0.5">{key === 'undular' ? 'Fr₁ 1.0–1.7' : key === 'weak' ? 'Fr₁ 1.7–2.5' : key === 'oscillating' ? 'Fr₁ 2.5–4.5' : key === 'steady' ? 'Fr₁ 4.5–9.0' : 'Fr₁ > 9.0'}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Waves className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Upstream flow must be supercritical (Fr₁ {'>'} 1) for a hydraulic jump to form.</p>
            <p className="text-xs mt-1">Try reducing y₁ or increasing Q to achieve supercritical conditions.</p>
          </div>
        )}

        {/* Reference */}
        <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg space-y-1">
          <p><strong>Bélanger Equation (rectangular):</strong> y₂/y₁ = ½(√(1 + 8Fr₁²) − 1)</p>
          <p><strong>Energy Loss:</strong> ΔE = (y₂ − y₁)³ / (4 y₁ y₂)</p>
          <p><strong>Jump Length:</strong> L ≈ 6.1 × y₂ (USBR empirical)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HydraulicJumpCalculator;
