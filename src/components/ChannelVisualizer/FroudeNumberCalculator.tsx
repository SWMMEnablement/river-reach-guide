import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Waves, Zap, AlertTriangle, ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import { CalculatorInsights, generateFroudeInsights } from './CalculatorInsights';
import { CalculatorQuiz, froudeQuizQuestions } from './CalculatorQuiz';

interface ChannelParams {
  bottomWidth: number;      // m
  sideSlope: number;        // H:V
  discharge: number;        // m³/s
  bedSlope: number;         // m/m
  manningN: number;
  upstreamDepth: number;    // m
  downstreamDepth: number;  // m
}

type FlowRegime = 'subcritical' | 'critical' | 'supercritical';

const FroudeNumberCalculator: React.FC = () => {
  const [params, setParams] = useState<ChannelParams>({
    bottomWidth: 5.0,
    sideSlope: 2.0,
    discharge: 15.0,
    bedSlope: 0.002,
    manningN: 0.035,
    upstreamDepth: 2.0,
    downstreamDepth: 0.8,
  });

  const [analysisPosition, setAnalysisPosition] = useState(50); // percentage along channel

  const calculations = useMemo(() => {
    const g = 9.81;
    const { bottomWidth, sideSlope, discharge, bedSlope, manningN, upstreamDepth, downstreamDepth } = params;

    // Calculate critical depth using iterative method
    // For trapezoidal channel: Q² / g = A³ / T
    const calcCriticalDepth = () => {
      let yc = 1.0;
      for (let i = 0; i < 50; i++) {
        const A = (bottomWidth + sideSlope * yc) * yc;
        const T = bottomWidth + 2 * sideSlope * yc;
        const f = Math.pow(discharge, 2) / g - Math.pow(A, 3) / T;
        const dA_dy = bottomWidth + 2 * sideSlope * yc;
        const dT_dy = 2 * sideSlope;
        const df_dy = -(3 * Math.pow(A, 2) * dA_dy * T - Math.pow(A, 3) * dT_dy) / Math.pow(T, 2);
        
        if (Math.abs(df_dy) < 1e-10) break;
        const ycNew = yc - f / df_dy;
        if (Math.abs(ycNew - yc) < 1e-6) break;
        yc = Math.max(0.01, ycNew);
      }
      return yc;
    };

    // Calculate normal depth using Manning's equation iteratively
    const calcNormalDepth = () => {
      let yn = 1.0;
      for (let i = 0; i < 50; i++) {
        const A = (bottomWidth + sideSlope * yn) * yn;
        const P = bottomWidth + 2 * yn * Math.sqrt(1 + sideSlope * sideSlope);
        const R = A / P;
        const Qcalc = (1 / manningN) * A * Math.pow(R, 2/3) * Math.sqrt(bedSlope);
        
        const ratio = discharge / Qcalc;
        const ynNew = yn * Math.pow(ratio, 0.4);
        if (Math.abs(ynNew - yn) < 1e-6) break;
        yn = Math.max(0.01, ynNew);
      }
      return yn;
    };

    const criticalDepth = calcCriticalDepth();
    const normalDepth = calcNormalDepth();

    // Calculate Froude number at a given depth
    const calcFroude = (depth: number) => {
      const A = (bottomWidth + sideSlope * depth) * depth;
      const T = bottomWidth + 2 * sideSlope * depth;
      const V = discharge / A;
      const D = A / T; // hydraulic depth
      return V / Math.sqrt(g * D);
    };

    // Interpolate depth at analysis position
    const depthAtPosition = upstreamDepth + (downstreamDepth - upstreamDepth) * (analysisPosition / 100);
    const froudeAtPosition = calcFroude(depthAtPosition);
    
    const froudeUpstream = calcFroude(upstreamDepth);
    const froudeDownstream = calcFroude(downstreamDepth);
    const froudeCritical = calcFroude(criticalDepth);
    const froudeNormal = calcFroude(normalDepth);

    // Determine flow regime
    const getRegime = (fr: number): FlowRegime => {
      if (fr < 0.95) return 'subcritical';
      if (fr > 1.05) return 'supercritical';
      return 'critical';
    };

    // Determine if hydraulic jump occurs
    const jumpOccurs = froudeUpstream > 1.05 && froudeDownstream < 0.95;
    
    // Calculate jump location (approximate)
    let jumpLocation = -1;
    if (jumpOccurs) {
      // Simple linear interpolation to find where Fr ≈ 1
      jumpLocation = ((froudeUpstream - 1) / (froudeUpstream - froudeDownstream)) * 100;
    }

    // Sequent depth calculation (Belanger equation for rectangular approx)
    const calcSequentDepth = (y1: number, Fr1: number) => {
      return (y1 / 2) * (Math.sqrt(1 + 8 * Math.pow(Fr1, 2)) - 1);
    };

    const sequentDepth = jumpOccurs ? calcSequentDepth(upstreamDepth, froudeUpstream) : 0;
    
    // Energy loss in jump
    const energyLoss = jumpOccurs 
      ? Math.pow(sequentDepth - upstreamDepth, 3) / (4 * upstreamDepth * sequentDepth)
      : 0;

    // Calculate velocity at position
    const areaAtPosition = (bottomWidth + sideSlope * depthAtPosition) * depthAtPosition;
    const velocityAtPosition = discharge / areaAtPosition;

    // Specific energy
    const specificEnergy = depthAtPosition + Math.pow(velocityAtPosition, 2) / (2 * g);
    const criticalEnergy = 1.5 * criticalDepth; // Minimum specific energy

    return {
      criticalDepth,
      normalDepth,
      froudeAtPosition,
      froudeUpstream,
      froudeDownstream,
      froudeCritical,
      froudeNormal,
      regimeAtPosition: getRegime(froudeAtPosition),
      regimeUpstream: getRegime(froudeUpstream),
      regimeDownstream: getRegime(froudeDownstream),
      jumpOccurs,
      jumpLocation,
      sequentDepth,
      energyLoss,
      depthAtPosition,
      velocityAtPosition,
      specificEnergy,
      criticalEnergy,
    };
  }, [params, analysisPosition]);

  const getRegimeColor = (regime: FlowRegime) => {
    switch (regime) {
      case 'subcritical': return 'bg-blue-500';
      case 'supercritical': return 'bg-red-500';
      case 'critical': return 'bg-yellow-500';
    }
  };

  const getRegimeBadge = (regime: FlowRegime) => {
    switch (regime) {
      case 'subcritical': return 'default';
      case 'supercritical': return 'destructive';
      case 'critical': return 'secondary';
    }
  };

  const renderFlowProfileDiagram = () => {
    const width = 500;
    const height = 250;
    const margin = { top: 30, right: 30, bottom: 40, left: 50 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const maxDepth = Math.max(params.upstreamDepth, params.downstreamDepth, calculations.criticalDepth, calculations.normalDepth) * 1.3;
    
    // Generate water surface profile points
    const points: { x: number; y: number; depth: number; froude: number }[] = [];
    for (let i = 0; i <= 20; i++) {
      const x = (i / 20) * plotWidth;
      const depth = params.upstreamDepth + (params.downstreamDepth - params.upstreamDepth) * (i / 20);
      const y = plotHeight - (depth / maxDepth) * plotHeight;
      
      const A = (params.bottomWidth + params.sideSlope * depth) * depth;
      const T = params.bottomWidth + 2 * params.sideSlope * depth;
      const V = params.discharge / A;
      const D = A / T;
      const froude = V / Math.sqrt(9.81 * D);
      
      points.push({ x: margin.left + x, y: margin.top + y, depth, froude });
    }

    const waterSurfacePath = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    
    // Critical depth line
    const ycY = margin.top + plotHeight - (calculations.criticalDepth / maxDepth) * plotHeight;
    
    // Normal depth line
    const ynY = margin.top + plotHeight - (calculations.normalDepth / maxDepth) * plotHeight;
    
    // Bed line
    const bedY = margin.top + plotHeight;

    // Jump location
    const jumpX = calculations.jumpOccurs 
      ? margin.left + (calculations.jumpLocation / 100) * plotWidth 
      : -100;

    return (
      <svg width={width} height={height} className="mx-auto">
        {/* Grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--muted))" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect x={margin.left} y={margin.top} width={plotWidth} height={plotHeight} fill="url(#grid)" />

        {/* Bed */}
        <line
          x1={margin.left}
          y1={bedY}
          x2={margin.left + plotWidth}
          y2={bedY}
          stroke="hsl(var(--foreground))"
          strokeWidth="3"
        />
        
        {/* Normal depth line */}
        <line
          x1={margin.left}
          y1={ynY}
          x2={margin.left + plotWidth}
          y2={ynY}
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeDasharray="10,5"
        />
        <text x={margin.left + plotWidth + 5} y={ynY + 4} className="text-xs fill-primary">yₙ</text>

        {/* Critical depth line */}
        <line
          x1={margin.left}
          y1={ycY}
          x2={margin.left + plotWidth}
          y2={ycY}
          stroke="hsl(var(--destructive))"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        <text x={margin.left + plotWidth + 5} y={ycY + 4} className="text-xs fill-destructive">yc</text>

        {/* Water surface */}
        <path
          d={waterSurfacePath}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
        />

        {/* Water fill */}
        <path
          d={`${waterSurfacePath} L ${margin.left + plotWidth},${bedY} L ${margin.left},${bedY} Z`}
          fill="hsl(var(--primary) / 0.2)"
        />

        {/* Hydraulic jump indicator */}
        {calculations.jumpOccurs && (
          <>
            <line
              x1={jumpX}
              y1={margin.top}
              x2={jumpX}
              y2={bedY}
              stroke="hsl(var(--destructive))"
              strokeWidth="2"
              strokeDasharray="5,3"
            />
            <text x={jumpX} y={margin.top - 5} textAnchor="middle" className="text-xs fill-destructive font-bold">
              HYDRAULIC JUMP
            </text>
          </>
        )}

        {/* Analysis position marker */}
        <circle
          cx={margin.left + (analysisPosition / 100) * plotWidth}
          cy={margin.top + plotHeight - (calculations.depthAtPosition / maxDepth) * plotHeight}
          r="6"
          fill="hsl(var(--accent))"
          stroke="hsl(var(--foreground))"
          strokeWidth="2"
        />

        {/* Flow direction arrow */}
        <defs>
          <marker id="flowarrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--muted-foreground))" />
          </marker>
        </defs>
        <line
          x1={margin.left + 10}
          y1={margin.top + 15}
          x2={margin.left + 60}
          y2={margin.top + 15}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          markerEnd="url(#flowarrow)"
        />
        <text x={margin.left + 35} y={margin.top + 10} textAnchor="middle" className="text-xs fill-muted-foreground">Flow</text>

        {/* Labels */}
        <text x={margin.left} y={height - 5} className="text-xs fill-muted-foreground">Upstream</text>
        <text x={margin.left + plotWidth} y={height - 5} textAnchor="end" className="text-xs fill-muted-foreground">Downstream</text>
        <text x={margin.left - 5} y={margin.top} textAnchor="end" className="text-xs fill-muted-foreground">{maxDepth.toFixed(1)}m</text>
        <text x={margin.left - 5} y={bedY} textAnchor="end" className="text-xs fill-muted-foreground">0</text>
      </svg>
    );
  };

  const renderFlowRegimeIcon = (regime: FlowRegime) => {
    switch (regime) {
      case 'subcritical':
        return <Waves className="w-5 h-5 text-blue-500" />;
      case 'supercritical':
        return <Zap className="w-5 h-5 text-red-500" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waves className="w-5 h-5 text-primary" />
          Froude Number Calculator & Flow Regime Analyzer
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Analyze subcritical/supercritical flow regimes and hydraulic jump locations
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Channel Parameters */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <Label>Bottom Width (m)</Label>
            <Input
              type="number"
              step="0.5"
              value={params.bottomWidth}
              onChange={(e) => setParams({ ...params, bottomWidth: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label>Side Slope (H:V)</Label>
            <Input
              type="number"
              step="0.5"
              value={params.sideSlope}
              onChange={(e) => setParams({ ...params, sideSlope: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label>Discharge (m³/s)</Label>
            <Input
              type="number"
              step="1"
              value={params.discharge}
              onChange={(e) => setParams({ ...params, discharge: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label>Bed Slope (m/m)</Label>
            <Input
              type="number"
              step="0.001"
              value={params.bedSlope}
              onChange={(e) => setParams({ ...params, bedSlope: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label>Manning's n</Label>
            <Input
              type="number"
              step="0.005"
              value={params.manningN}
              onChange={(e) => setParams({ ...params, manningN: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* Boundary Conditions */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Upstream Depth (m)</Label>
            <Input
              type="number"
              step="0.1"
              value={params.upstreamDepth}
              onChange={(e) => setParams({ ...params, upstreamDepth: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label>Downstream Depth (m)</Label>
            <Input
              type="number"
              step="0.1"
              value={params.downstreamDepth}
              onChange={(e) => setParams({ ...params, downstreamDepth: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* Flow Profile Diagram */}
        <div className="bg-background/50 rounded-lg p-4">
          {renderFlowProfileDiagram()}
          <div className="mt-4">
            <Label>Analysis Position: {analysisPosition}%</Label>
            <Slider
              value={[analysisPosition]}
              onValueChange={([v]) => setAnalysisPosition(v)}
              min={0}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>
        </div>

        {/* Flow Regime Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-blue-500/30">
            <CardContent className="pt-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4" />
                <span className="font-medium">Upstream</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                {renderFlowRegimeIcon(calculations.regimeUpstream)}
                <Badge variant={getRegimeBadge(calculations.regimeUpstream)}>
                  {calculations.regimeUpstream.toUpperCase()}
                </Badge>
              </div>
              <div className="mt-2 text-2xl font-bold">Fr = {calculations.froudeUpstream.toFixed(3)}</div>
              <div className="text-sm text-muted-foreground">y = {params.upstreamDepth.toFixed(2)} m</div>
            </CardContent>
          </Card>

          <Card className={`border-2 ${getRegimeColor(calculations.regimeAtPosition)}/30`}>
            <CardContent className="pt-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ArrowRight className="w-4 h-4" />
                <span className="font-medium">At Position ({analysisPosition}%)</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                {renderFlowRegimeIcon(calculations.regimeAtPosition)}
                <Badge variant={getRegimeBadge(calculations.regimeAtPosition)}>
                  {calculations.regimeAtPosition.toUpperCase()}
                </Badge>
              </div>
              <div className="mt-2 text-2xl font-bold">Fr = {calculations.froudeAtPosition.toFixed(3)}</div>
              <div className="text-sm text-muted-foreground">y = {calculations.depthAtPosition.toFixed(2)} m</div>
            </CardContent>
          </Card>

          <Card className="border-red-500/30">
            <CardContent className="pt-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">Downstream</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                {renderFlowRegimeIcon(calculations.regimeDownstream)}
                <Badge variant={getRegimeBadge(calculations.regimeDownstream)}>
                  {calculations.regimeDownstream.toUpperCase()}
                </Badge>
              </div>
              <div className="mt-2 text-2xl font-bold">Fr = {calculations.froudeDownstream.toFixed(3)}</div>
              <div className="text-sm text-muted-foreground">y = {params.downstreamDepth.toFixed(2)} m</div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Parameters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-destructive">{calculations.criticalDepth.toFixed(3)}</div>
            <div className="text-xs text-muted-foreground">Critical Depth yc (m)</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-primary">{calculations.normalDepth.toFixed(3)}</div>
            <div className="text-xs text-muted-foreground">Normal Depth yn (m)</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{calculations.velocityAtPosition.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Velocity (m/s)</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{calculations.specificEnergy.toFixed(3)}</div>
            <div className="text-xs text-muted-foreground">Specific Energy (m)</div>
          </div>
        </div>

        {/* Hydraulic Jump Analysis */}
        {calculations.jumpOccurs && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Hydraulic Jump Detected
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                Flow transitions from supercritical (Fr {'>'} 1) upstream to subcritical (Fr {'<'} 1) downstream, 
                causing a hydraulic jump.
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="font-semibold text-destructive">{calculations.jumpLocation.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Jump Location</div>
                </div>
                <div>
                  <div className="font-semibold">{calculations.sequentDepth.toFixed(3)} m</div>
                  <div className="text-xs text-muted-foreground">Sequent Depth (y₂)</div>
                </div>
                <div>
                  <div className="font-semibold">{calculations.energyLoss.toFixed(3)} m</div>
                  <div className="text-xs text-muted-foreground">Energy Loss (ΔE)</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Sequent depth calculated using Bélanger equation: y₂/y₁ = 0.5(√(1 + 8Fr₁²) - 1)
              </p>
            </CardContent>
          </Card>
        )}

        {/* Flow Regime Reference */}
        <Tabs defaultValue="regimes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="regimes">Flow Regimes</TabsTrigger>
            <TabsTrigger value="slopes">Slope Classification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="regimes" className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 font-medium text-blue-600">
                  <Waves className="w-4 h-4" /> Subcritical (Fr {'<'} 1)
                </div>
                <p className="text-xs mt-2 text-muted-foreground">
                  Deep, slow flow. Disturbances propagate upstream. Depth {'>'} critical depth.
                  Control at downstream boundary.
                </p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 font-medium text-yellow-600">
                  <AlertTriangle className="w-4 h-4" /> Critical (Fr = 1)
                </div>
                <p className="text-xs mt-2 text-muted-foreground">
                  Unstable transitional flow. Minimum specific energy. Depth = critical depth.
                  Wave celerity equals flow velocity.
                </p>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 font-medium text-red-600">
                  <Zap className="w-4 h-4" /> Supercritical (Fr {'>'} 1)
                </div>
                <p className="text-xs mt-2 text-muted-foreground">
                  Shallow, fast flow. Disturbances only propagate downstream. Depth {'<'} critical depth.
                  Control at upstream boundary.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="slopes" className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              <div className="bg-muted/30 rounded p-2 text-center">
                <div className="font-semibold">Mild (M)</div>
                <div className="text-muted-foreground">yn {'>'} yc</div>
              </div>
              <div className="bg-muted/30 rounded p-2 text-center">
                <div className="font-semibold">Steep (S)</div>
                <div className="text-muted-foreground">yn {'<'} yc</div>
              </div>
              <div className="bg-muted/30 rounded p-2 text-center">
                <div className="font-semibold">Critical (C)</div>
                <div className="text-muted-foreground">yn = yc</div>
              </div>
              <div className="bg-muted/30 rounded p-2 text-center">
                <div className="font-semibold">Horizontal (H)</div>
                <div className="text-muted-foreground">S₀ = 0</div>
              </div>
              <div className="bg-muted/30 rounded p-2 text-center">
                <div className="font-semibold">Adverse (A)</div>
                <div className="text-muted-foreground">S₀ {'<'} 0</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Current slope classification: <strong>
                {calculations.normalDepth > calculations.criticalDepth ? 'Mild (M)' : 
                 calculations.normalDepth < calculations.criticalDepth ? 'Steep (S)' : 'Critical (C)'}
              </strong> — yn = {calculations.normalDepth.toFixed(3)} m, yc = {calculations.criticalDepth.toFixed(3)} m
            </p>
          </TabsContent>
        </Tabs>

        {/* Interpretive Insights */}
        <CalculatorInsights 
          insights={generateFroudeInsights(
            calculations.froudeUpstream,
            calculations.froudeDownstream,
            calculations.normalDepth,
            calculations.criticalDepth,
            calculations.jumpOccurs,
            calculations.sequentDepth,
            calculations.energyLoss
          )}
        />

        {/* Interactive Quiz */}
        <CalculatorQuiz 
          title="Froude Number Quiz"
          questions={froudeQuizQuestions}
          calculatorValues={{
            froudeUpstream: calculations.froudeUpstream,
            froudeDownstream: calculations.froudeDownstream,
            normalDepth: calculations.normalDepth,
            criticalDepth: calculations.criticalDepth
          }}
        />

        {/* Reference */}
        <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
          <strong>Froude Number:</strong> Fr = V / √(gD) where V = velocity, g = gravity, D = hydraulic depth (A/T).
          Fr {'<'} 1 indicates subcritical flow, Fr {'>'} 1 indicates supercritical flow.
        </div>
      </CardContent>
    </Card>
  );
};

export default FroudeNumberCalculator;
