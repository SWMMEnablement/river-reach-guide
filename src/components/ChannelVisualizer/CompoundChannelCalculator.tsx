import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layers, ChevronDown, ChevronUp, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { CalculatorInsights, CalculatorInsight } from './CalculatorInsights';
import { CalculatorQuiz, compoundChannelQuizQuestions } from './CalculatorQuiz';

interface ChannelZone {
  id: string;
  name: string;
  area: number;
  wettedPerimeter: number;
  hydraulicRadius: number;
  conveyance: number;
  velocity: number;
  discharge: number;
  manningN: number;
  alpha: number; // velocity distribution coefficient
}

export const CompoundChannelCalculator = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Main channel geometry
  const [mainBottomWidth, setMainBottomWidth] = useState(8);
  const [mainBankSlope, setMainBankSlope] = useState(1.5);
  const [mainBankHeight, setMainBankHeight] = useState(2.5);
  const [mainManningN, setMainManningN] = useState(0.035);
  
  // Left floodplain
  const [leftFPWidth, setLeftFPWidth] = useState(25);
  const [leftFPSlope, setLeftFPSlope] = useState(0.01);
  const [leftFPManningN, setLeftFPManningN] = useState(0.06);
  
  // Right floodplain
  const [rightFPWidth, setRightFPWidth] = useState(30);
  const [rightFPSlope, setRightFPSlope] = useState(0.015);
  const [rightFPManningN, setRightFPManningN] = useState(0.08);
  
  // Flow parameters
  const [bedSlope, setBedSlope] = useState(0.0005);
  const [waterLevel, setWaterLevel] = useState(3.2);

  const calculations = useMemo(() => {
    const g = 9.81;
    const zones: ChannelZone[] = [];
    
    // Main channel calculations
    const mainDepth = Math.min(waterLevel, mainBankHeight);
    if (mainDepth > 0) {
      const mainTopWidth = mainBottomWidth + 2 * mainBankSlope * mainDepth;
      const mainArea = (mainBottomWidth + mainTopWidth) / 2 * mainDepth;
      const mainSideLength = mainDepth * Math.sqrt(1 + mainBankSlope * mainBankSlope);
      let mainWettedP = mainBottomWidth + 2 * mainSideLength;
      
      // Add bank tops if water is at bankfull or above
      if (waterLevel >= mainBankHeight) {
        // Don't include bank tops in main channel wetted perimeter for compound section
        mainWettedP = mainBottomWidth + 2 * mainSideLength;
      }
      
      const mainR = mainArea / mainWettedP;
      const mainK = (1 / mainManningN) * mainArea * Math.pow(mainR, 2/3);
      const mainQ = mainK * Math.sqrt(bedSlope);
      const mainV = mainArea > 0 ? mainQ / mainArea : 0;
      
      zones.push({
        id: 'main',
        name: 'Main Channel',
        area: mainArea,
        wettedPerimeter: mainWettedP,
        hydraulicRadius: mainR,
        conveyance: mainK,
        velocity: mainV,
        discharge: mainQ,
        manningN: mainManningN,
        alpha: 1,
      });
    }
    
    // Floodplain calculations (only if water above bank)
    const floodDepth = waterLevel - mainBankHeight;
    
    if (floodDepth > 0) {
      // Left floodplain
      const leftHeight = floodDepth - leftFPSlope * leftFPWidth / 2; // Average depth considering slope
      const effectiveLeftDepth = Math.max(0, Math.min(floodDepth, leftHeight + floodDepth) / 2);
      
      if (effectiveLeftDepth > 0 && leftFPWidth > 0) {
        const leftArea = leftFPWidth * floodDepth;
        const leftWettedP = leftFPWidth + floodDepth; // Simplified - one side + bottom
        const leftR = leftArea / leftWettedP;
        const leftK = (1 / leftFPManningN) * leftArea * Math.pow(leftR, 2/3);
        const leftQ = leftK * Math.sqrt(bedSlope);
        const leftV = leftArea > 0 ? leftQ / leftArea : 0;
        
        zones.push({
          id: 'left-fp',
          name: 'Left Floodplain',
          area: leftArea,
          wettedPerimeter: leftWettedP,
          hydraulicRadius: leftR,
          conveyance: leftK,
          velocity: leftV,
          discharge: leftQ,
          manningN: leftFPManningN,
          alpha: 1,
        });
      }
      
      // Right floodplain
      if (floodDepth > 0 && rightFPWidth > 0) {
        const rightArea = rightFPWidth * floodDepth;
        const rightWettedP = rightFPWidth + floodDepth;
        const rightR = rightArea / rightWettedP;
        const rightK = (1 / rightFPManningN) * rightArea * Math.pow(rightR, 2/3);
        const rightQ = rightK * Math.sqrt(bedSlope);
        const rightV = rightArea > 0 ? rightQ / rightArea : 0;
        
        zones.push({
          id: 'right-fp',
          name: 'Right Floodplain',
          area: rightArea,
          wettedPerimeter: rightWettedP,
          hydraulicRadius: rightR,
          conveyance: rightK,
          velocity: rightV,
          discharge: rightQ,
          manningN: rightFPManningN,
          alpha: 1,
        });
      }
    }
    
    // Total compound section properties
    const totalArea = zones.reduce((sum, z) => sum + z.area, 0);
    const totalConveyance = zones.reduce((sum, z) => sum + z.conveyance, 0);
    const totalDischarge = zones.reduce((sum, z) => sum + z.discharge, 0);
    const totalWettedP = zones.reduce((sum, z) => sum + z.wettedPerimeter, 0);
    
    // Composite Manning's n (Lotter's method)
    const compositN = totalWettedP > 0 
      ? Math.pow(
          zones.reduce((sum, z) => sum + z.wettedPerimeter * Math.pow(z.manningN, 1.5), 0) / totalWettedP,
          2/3
        )
      : mainManningN;
    
    // Kinetic energy correction factor (alpha) - Coriolis coefficient
    const alpha = totalArea > 0 && totalDischarge > 0
      ? zones.reduce((sum, z) => sum + z.conveyance ** 3 / (z.area ** 2), 0) * (totalArea ** 2) / (totalConveyance ** 3)
      : 1;
    
    // Momentum correction factor (beta) - Boussinesq coefficient
    const beta = totalArea > 0 && totalDischarge > 0
      ? zones.reduce((sum, z) => sum + z.conveyance ** 2 / z.area, 0) * totalArea / (totalConveyance ** 2)
      : 1;
    
    // Average velocity
    const avgVelocity = totalArea > 0 ? totalDischarge / totalArea : 0;
    
    // Froude number (using hydraulic depth)
    const mainChannel = zones.find(z => z.id === 'main');
    const mainTopWidth = mainBottomWidth + 2 * mainBankSlope * Math.min(waterLevel, mainBankHeight);
    let totalTopWidth = mainTopWidth;
    if (floodDepth > 0) {
      totalTopWidth += leftFPWidth + rightFPWidth;
    }
    const hydraulicDepth = totalArea / totalTopWidth;
    const froudeNumber = hydraulicDepth > 0 ? avgVelocity / Math.sqrt(g * hydraulicDepth) : 0;
    
    // Percentage contributions
    const percentages = zones.map(z => ({
      ...z,
      areaPercent: totalArea > 0 ? (z.area / totalArea) * 100 : 0,
      dischargePercent: totalDischarge > 0 ? (z.discharge / totalDischarge) * 100 : 0,
      conveyancePercent: totalConveyance > 0 ? (z.conveyance / totalConveyance) * 100 : 0,
    }));
    
    return {
      zones,
      percentages,
      totalArea,
      totalConveyance,
      totalDischarge,
      totalWettedP,
      compositN,
      alpha,
      beta,
      avgVelocity,
      froudeNumber,
      hydraulicDepth,
      totalTopWidth,
      floodDepth,
      isCompound: floodDepth > 0,
    };
  }, [
    mainBottomWidth, mainBankSlope, mainBankHeight, mainManningN,
    leftFPWidth, leftFPSlope, leftFPManningN,
    rightFPWidth, rightFPSlope, rightFPManningN,
    bedSlope, waterLevel
  ]);

  // Generate insights
  const insights = useMemo((): CalculatorInsight[] => {
    const result: CalculatorInsight[] = [];
    
    if (!calculations.isCompound) {
      result.push({
        level: 'info',
        title: 'In-Bank Flow',
        message: `Water level (${waterLevel.toFixed(2)}m) is below bankfull (${mainBankHeight.toFixed(2)}m). Flow is confined to main channel only.`,
        nextStep: 'Increase water level above bank height to activate floodplain flow.',
      });
    } else {
      result.push({
        level: 'warning',
        title: 'Compound Channel Flow Active',
        message: `Flood depth on floodplains: ${calculations.floodDepth.toFixed(2)}m. Flow is distributed across ${calculations.zones.length} zones.`,
        nextStep: 'Check velocity ratios between zones - large differences indicate strong interaction effects.',
      });
      
      // Check velocity ratios
      const mainVel = calculations.zones.find(z => z.id === 'main')?.velocity ?? 0;
      const fpVels = calculations.zones.filter(z => z.id !== 'main').map(z => z.velocity);
      const maxRatio = fpVels.length > 0 ? mainVel / Math.min(...fpVels) : 1;
      
      if (maxRatio > 3) {
        result.push({
          level: 'warning',
          title: 'High Velocity Gradient',
          message: `Main channel velocity is ${maxRatio.toFixed(1)}× faster than slowest floodplain. Strong momentum exchange expected at interfaces.`,
          nextStep: 'Consider using Ackers (1993) or DCM method for more accurate conveyance.',
        });
      }
    }
    
    // Alpha coefficient check
    if (calculations.alpha > 1.3) {
      result.push({
        level: 'tip',
        title: 'Significant Kinetic Energy Correction',
        message: `α = ${calculations.alpha.toFixed(3)} indicates non-uniform velocity distribution. Energy equation should use αV²/2g.`,
        nextStep: 'For backwater calculations, use α to correct kinetic energy head.',
      });
    }
    
    // Composite n advice
    if (calculations.isCompound) {
      result.push({
        level: 'info',
        title: 'Composite Roughness',
        message: `Equivalent n = ${calculations.compositN.toFixed(4)} (Lotter method). Individual zone calculations are more accurate.`,
        nextStep: 'Use Divided Channel Method (DCM) for GVF computations on compound sections.',
      });
    }
    
    // Froude number
    if (calculations.froudeNumber > 1) {
      result.push({
        level: 'warning',
        title: 'Supercritical Compound Flow',
        message: `Fr = ${calculations.froudeNumber.toFixed(2)} > 1. Unusual for natural compound channels - verify slope and geometry.`,
      });
    }
    
    return result;
  }, [calculations, waterLevel, mainBankHeight]);

  // SVG visualization
  const svgWidth = 700;
  const svgHeight = 280;
  const margin = { left: 40, right: 40, top: 30, bottom: 40 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;
  
  // Calculate total channel width for scaling
  const totalWidth = leftFPWidth + mainBottomWidth + 2 * mainBankSlope * mainBankHeight + rightFPWidth;
  const maxHeight = Math.max(mainBankHeight, waterLevel) * 1.3;
  
  const xScale = (x: number) => margin.left + (x / totalWidth) * plotWidth;
  const yScale = (y: number) => margin.top + plotHeight - (y / maxHeight) * plotHeight;
  
  // Build cross-section path
  const leftFPStart = 0;
  const leftFPEnd = leftFPWidth;
  const mainLeftBank = leftFPEnd;
  const mainLeftBottom = mainLeftBank + mainBankSlope * mainBankHeight;
  const mainRightBottom = mainLeftBottom + mainBottomWidth;
  const mainRightBank = mainRightBottom + mainBankSlope * mainBankHeight;
  const rightFPEnd = mainRightBank + rightFPWidth;
  
  const crossSectionPath = `
    M ${xScale(leftFPStart)} ${yScale(mainBankHeight)}
    L ${xScale(leftFPEnd)} ${yScale(mainBankHeight)}
    L ${xScale(mainLeftBottom)} ${yScale(0)}
    L ${xScale(mainRightBottom)} ${yScale(0)}
    L ${xScale(mainRightBank)} ${yScale(mainBankHeight)}
    L ${xScale(rightFPEnd)} ${yScale(mainBankHeight)}
  `;
  
  // Water surface
  const waterY = yScale(waterLevel);
  const waterPath = calculations.isCompound
    ? `M ${xScale(leftFPStart)} ${waterY} L ${xScale(rightFPEnd)} ${waterY}`
    : `M ${xScale(mainLeftBank + mainBankSlope * (mainBankHeight - waterLevel))} ${waterY} 
       L ${xScale(mainRightBank - mainBankSlope * (mainBankHeight - waterLevel))} ${waterY}`;

  return (
    <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <Layers className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">Compound Channel Calculator</h3>
            <p className="text-xs text-muted-foreground">Main Channel + Floodplains with Divided Channel Method</p>
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
          {/* Cross-Section Visualization */}
          <div className="bg-gradient-to-b from-sky-50 to-blue-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full">
              {/* Grid */}
              <defs>
                <pattern id="compound-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeOpacity="0.05" />
                </pattern>
              </defs>
              <rect x={margin.left} y={margin.top} width={plotWidth} height={plotHeight} fill="url(#compound-grid)" />
              
              {/* Floodplain fill (if active) */}
              {calculations.isCompound && (
                <>
                  {/* Left floodplain */}
                  <path
                    d={`M ${xScale(leftFPStart)} ${waterY}
                        L ${xScale(leftFPEnd)} ${waterY}
                        L ${xScale(leftFPEnd)} ${yScale(mainBankHeight)}
                        L ${xScale(leftFPStart)} ${yScale(mainBankHeight)} Z`}
                    fill="rgba(34, 197, 94, 0.2)"
                    stroke="rgba(34, 197, 94, 0.5)"
                    strokeWidth={1}
                  />
                  {/* Right floodplain */}
                  <path
                    d={`M ${xScale(mainRightBank)} ${waterY}
                        L ${xScale(rightFPEnd)} ${waterY}
                        L ${xScale(rightFPEnd)} ${yScale(mainBankHeight)}
                        L ${xScale(mainRightBank)} ${yScale(mainBankHeight)} Z`}
                    fill="rgba(59, 130, 246, 0.2)"
                    stroke="rgba(59, 130, 246, 0.5)"
                    strokeWidth={1}
                  />
                </>
              )}
              
              {/* Main channel water */}
              <path
                d={`M ${xScale(mainLeftBank + mainBankSlope * Math.max(0, mainBankHeight - waterLevel))} ${yScale(Math.min(waterLevel, mainBankHeight))}
                    L ${xScale(mainLeftBottom)} ${yScale(0)}
                    L ${xScale(mainRightBottom)} ${yScale(0)}
                    L ${xScale(mainRightBank - mainBankSlope * Math.max(0, mainBankHeight - waterLevel))} ${yScale(Math.min(waterLevel, mainBankHeight))}
                    ${calculations.isCompound ? `L ${xScale(mainRightBank)} ${waterY} L ${xScale(mainLeftBank)} ${waterY}` : ''} Z`}
                fill="rgba(96, 165, 250, 0.4)"
              />
              
              {/* Cross-section outline */}
              <path
                d={crossSectionPath}
                fill="none"
                stroke="#8B4513"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Bank height markers */}
              <line
                x1={xScale(mainLeftBank) - 15}
                y1={yScale(mainBankHeight)}
                x2={xScale(mainLeftBank) - 15}
                y2={yScale(0)}
                stroke="currentColor"
                strokeOpacity={0.3}
                strokeDasharray="4,2"
              />
              <text
                x={xScale(mainLeftBank) - 20}
                y={yScale(mainBankHeight / 2)}
                textAnchor="end"
                className="text-[9px] fill-muted-foreground"
              >
                {mainBankHeight.toFixed(1)}m
              </text>
              
              {/* Water level line */}
              <line
                x1={margin.left}
                y1={waterY}
                x2={svgWidth - margin.right}
                y2={waterY}
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="6,3"
              />
              <text
                x={svgWidth - margin.right + 5}
                y={waterY + 4}
                className="text-[10px] fill-blue-500 font-medium"
              >
                WL: {waterLevel.toFixed(2)}m
              </text>
              
              {/* Zone labels */}
              {calculations.zones.map((zone, i) => {
                let labelX = 0;
                if (zone.id === 'main') {
                  labelX = xScale((mainLeftBottom + mainRightBottom) / 2);
                } else if (zone.id === 'left-fp') {
                  labelX = xScale(leftFPWidth / 2);
                } else if (zone.id === 'right-fp') {
                  labelX = xScale(mainRightBank + rightFPWidth / 2);
                }
                return (
                  <g key={zone.id}>
                    <text
                      x={labelX}
                      y={margin.top + 15}
                      textAnchor="middle"
                      className="text-[10px] fill-foreground font-medium"
                    >
                      {zone.name}
                    </text>
                    <text
                      x={labelX}
                      y={margin.top + 28}
                      textAnchor="middle"
                      className="text-[9px] fill-muted-foreground"
                    >
                      n = {zone.manningN}
                    </text>
                  </g>
                );
              })}
              
              {/* Velocity arrows */}
              {calculations.zones.map((zone, i) => {
                let arrowX = 0;
                if (zone.id === 'main') {
                  arrowX = xScale((mainLeftBottom + mainRightBottom) / 2);
                } else if (zone.id === 'left-fp') {
                  arrowX = xScale(leftFPWidth / 2);
                } else if (zone.id === 'right-fp') {
                  arrowX = xScale(mainRightBank + rightFPWidth / 2);
                }
                const maxVel = Math.max(...calculations.zones.map(z => z.velocity));
                const arrowLength = (zone.velocity / maxVel) * 40;
                const arrowY = waterY + 20;
                
                return (
                  <g key={`arrow-${zone.id}`}>
                    <line
                      x1={arrowX}
                      y1={arrowY}
                      x2={arrowX + arrowLength}
                      y2={arrowY}
                      stroke="#ef4444"
                      strokeWidth={2}
                      markerEnd="url(#arrowhead)"
                    />
                    <text
                      x={arrowX}
                      y={arrowY + 15}
                      textAnchor="middle"
                      className="text-[9px] fill-red-500"
                    >
                      {zone.velocity.toFixed(2)} m/s
                    </text>
                  </g>
                );
              })}
              
              <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                  <polygon points="0 0, 6 2, 0 4" fill="#ef4444" />
                </marker>
              </defs>
            </svg>
          </div>

          {/* Water Level Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Water Level: {waterLevel.toFixed(2)} m</Label>
              <span className={`text-xs px-2 py-0.5 rounded ${calculations.isCompound ? 'bg-amber-500/20 text-amber-600' : 'bg-green-500/20 text-green-600'}`}>
                {calculations.isCompound ? 'Overbank' : 'In-Bank'}
              </span>
            </div>
            <Slider
              value={[waterLevel]}
              onValueChange={([v]) => setWaterLevel(v)}
              min={0.1}
              max={mainBankHeight + 2}
              step={0.05}
              className="w-full"
            />
          </div>

          {/* Geometry Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Main Channel */}
            <div className="space-y-3 p-3 bg-secondary/30 rounded-lg">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                Main Channel
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Width (m)</Label>
                  <Input
                    type="number"
                    value={mainBottomWidth}
                    onChange={e => setMainBottomWidth(parseFloat(e.target.value) || 1)}
                    step={0.5}
                    min={1}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Bank Slope</Label>
                  <Input
                    type="number"
                    value={mainBankSlope}
                    onChange={e => setMainBankSlope(parseFloat(e.target.value) || 0.5)}
                    step={0.25}
                    min={0}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Bank Height (m)</Label>
                  <Input
                    type="number"
                    value={mainBankHeight}
                    onChange={e => setMainBankHeight(parseFloat(e.target.value) || 1)}
                    step={0.25}
                    min={0.5}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Manning's n</Label>
                  <Input
                    type="number"
                    value={mainManningN}
                    onChange={e => setMainManningN(parseFloat(e.target.value) || 0.03)}
                    step={0.005}
                    min={0.01}
                    max={0.15}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Left Floodplain */}
            <div className="space-y-3 p-3 bg-green-500/10 rounded-lg">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                Left Floodplain
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Width (m)</Label>
                  <Input
                    type="number"
                    value={leftFPWidth}
                    onChange={e => setLeftFPWidth(parseFloat(e.target.value) || 0)}
                    step={5}
                    min={0}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Manning's n</Label>
                  <Input
                    type="number"
                    value={leftFPManningN}
                    onChange={e => setLeftFPManningN(parseFloat(e.target.value) || 0.05)}
                    step={0.01}
                    min={0.02}
                    max={0.2}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Right Floodplain */}
            <div className="space-y-3 p-3 bg-blue-500/10 rounded-lg">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                Right Floodplain
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Width (m)</Label>
                  <Input
                    type="number"
                    value={rightFPWidth}
                    onChange={e => setRightFPWidth(parseFloat(e.target.value) || 0)}
                    step={5}
                    min={0}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Manning's n</Label>
                  <Input
                    type="number"
                    value={rightFPManningN}
                    onChange={e => setRightFPManningN(parseFloat(e.target.value) || 0.05)}
                    step={0.01}
                    min={0.02}
                    max={0.2}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bed Slope */}
          <div className="flex items-center gap-4">
            <Label className="text-sm whitespace-nowrap">Bed Slope S₀:</Label>
            <Input
              type="number"
              value={bedSlope}
              onChange={e => setBedSlope(parseFloat(e.target.value) || 0.0001)}
              step={0.0001}
              min={0.00001}
              className="h-8 w-32 text-sm"
            />
          </div>

          {/* Zone Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Zone</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Area (m²)</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">P (m)</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">R (m)</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">K (m³/s)</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">V (m/s)</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Q (m³/s)</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">% Q</th>
                </tr>
              </thead>
              <tbody>
                {calculations.percentages.map((zone, i) => (
                  <tr key={zone.id} className="border-b border-border/50">
                    <td className="py-2 px-2 font-medium">{zone.name}</td>
                    <td className="text-right py-2 px-2">{zone.area.toFixed(2)}</td>
                    <td className="text-right py-2 px-2">{zone.wettedPerimeter.toFixed(2)}</td>
                    <td className="text-right py-2 px-2">{zone.hydraulicRadius.toFixed(3)}</td>
                    <td className="text-right py-2 px-2">{zone.conveyance.toFixed(1)}</td>
                    <td className="text-right py-2 px-2">{zone.velocity.toFixed(3)}</td>
                    <td className="text-right py-2 px-2">{zone.discharge.toFixed(3)}</td>
                    <td className="text-right py-2 px-2 font-semibold text-primary">{zone.dischargePercent.toFixed(1)}%</td>
                  </tr>
                ))}
                <tr className="bg-secondary/30 font-semibold">
                  <td className="py-2 px-2">Total</td>
                  <td className="text-right py-2 px-2">{calculations.totalArea.toFixed(2)}</td>
                  <td className="text-right py-2 px-2">{calculations.totalWettedP.toFixed(2)}</td>
                  <td className="text-right py-2 px-2">-</td>
                  <td className="text-right py-2 px-2">{calculations.totalConveyance.toFixed(1)}</td>
                  <td className="text-right py-2 px-2">{calculations.avgVelocity.toFixed(3)}</td>
                  <td className="text-right py-2 px-2">{calculations.totalDischarge.toFixed(3)}</td>
                  <td className="text-right py-2 px-2">100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Composite n</div>
              <div className="text-lg font-bold text-foreground">{calculations.compositN.toFixed(4)}</div>
              <div className="text-xs text-muted-foreground">Lotter method</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">α (Coriolis)</div>
              <div className="text-lg font-bold text-foreground">{calculations.alpha.toFixed(3)}</div>
              <div className="text-xs text-muted-foreground">Energy correction</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">β (Boussinesq)</div>
              <div className="text-lg font-bold text-foreground">{calculations.beta.toFixed(3)}</div>
              <div className="text-xs text-muted-foreground">Momentum correction</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Froude Number</div>
              <div className={`text-lg font-bold ${calculations.froudeNumber > 1 ? 'text-orange-500' : 'text-green-500'}`}>
                {calculations.froudeNumber.toFixed(3)}
              </div>
              <div className="text-xs text-muted-foreground">
                {calculations.froudeNumber > 1 ? 'Supercritical' : 'Subcritical'}
              </div>
            </div>
          </div>

          {/* Insights */}
          <CalculatorInsights insights={insights} />

          {/* Quiz */}
          <CalculatorQuiz
            title="Compound Channel Quiz"
            questions={compoundChannelQuizQuestions}
            calculatorValues={{
              alpha: calculations.alpha,
              beta: calculations.beta,
              compositN: calculations.compositN,
              totalDischarge: calculations.totalDischarge,
              floodDepth: calculations.floodDepth,
              zoneCount: calculations.zones.length,
            }}
          />
        </motion.div>
      )}
    </div>
  );
};

export default CompoundChannelCalculator;
