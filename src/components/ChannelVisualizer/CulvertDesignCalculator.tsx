import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Circle, Square, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { CalculatorInsights, generateCulvertInsights } from './CalculatorInsights';
import { CalculatorQuiz, culvertQuizQuestions } from './CalculatorQuiz';

interface CulvertParams {
  designFlow: number;        // m³/s
  headwaterDepth: number;    // m
  tailwaterDepth: number;    // m
  culvertLength: number;     // m
  culvertSlope: number;      // m/m
  manningN: number;
  entranceLossCoeff: number;
}

interface CulvertDimensions {
  diameter?: number;         // m (for pipe)
  width?: number;            // m (for box)
  height?: number;           // m (for box)
}

type CulvertType = 'pipe' | 'box';
type ControlType = 'inlet' | 'outlet' | 'unknown';

const CulvertDesignCalculator: React.FC = () => {
  const [culvertType, setCulvertType] = useState<CulvertType>('pipe');
  const [params, setParams] = useState<CulvertParams>({
    designFlow: 5.0,
    headwaterDepth: 2.5,
    tailwaterDepth: 0.8,
    culvertLength: 30,
    culvertSlope: 0.01,
    manningN: 0.013,
    entranceLossCoeff: 0.5,
  });
  const [dimensions, setDimensions] = useState<CulvertDimensions>({
    diameter: 1.2,
    width: 2.0,
    height: 1.5,
  });

  const entranceTypes = [
    { value: 0.2, label: 'Square edge with headwall' },
    { value: 0.5, label: 'Groove end with headwall' },
    { value: 0.7, label: 'Groove end projecting' },
    { value: 0.9, label: 'Mitered to slope' },
  ];

  const calculations = useMemo(() => {
    const g = 9.81;
    const { designFlow, headwaterDepth, tailwaterDepth, culvertLength, culvertSlope, manningN, entranceLossCoeff } = params;
    
    let area: number, wettedPerimeter: number, hydraulicRadius: number;
    let D: number; // characteristic dimension
    
    if (culvertType === 'pipe') {
      D = dimensions.diameter || 1.0;
      // Assume full flow for initial calculations
      area = Math.PI * Math.pow(D, 2) / 4;
      wettedPerimeter = Math.PI * D;
      hydraulicRadius = D / 4;
    } else {
      const width = dimensions.width || 2.0;
      const height = dimensions.height || 1.5;
      D = height;
      area = width * height;
      wettedPerimeter = 2 * (width + height);
      hydraulicRadius = area / wettedPerimeter;
    }

    // Velocity and Froude number
    const velocity = designFlow / area;
    const froudeNumber = velocity / Math.sqrt(g * D);

    // Inlet Control (HY-8 Methodology - Unsubmerged and Submerged)
    // Unsubmerged: HW/D = Hc/D + K * (Q/AD^0.5)^M + Ks * S
    // Simplified inlet control headwater
    const Cd = 0.62; // discharge coefficient
    const inletControlHW = Math.pow(designFlow / (Cd * area * Math.sqrt(2 * g)), 2) / (2 * g) + entranceLossCoeff * Math.pow(velocity, 2) / (2 * g);

    // Outlet Control (HY-8 Methodology)
    // HW = TW + H_L where H_L = entrance loss + friction loss + exit loss
    const entranceLoss = entranceLossCoeff * Math.pow(velocity, 2) / (2 * g);
    const frictionLoss = (Math.pow(manningN * velocity, 2) * culvertLength) / Math.pow(hydraulicRadius, 4/3);
    const exitLoss = 1.0 * Math.pow(velocity, 2) / (2 * g); // Ke = 1.0 for exit
    const outletControlHW = tailwaterDepth + entranceLoss + frictionLoss + exitLoss - culvertSlope * culvertLength;

    // Determine controlling condition
    let controlType: ControlType = 'unknown';
    let controllingHW: number;
    
    if (inletControlHW > outletControlHW) {
      controlType = 'inlet';
      controllingHW = inletControlHW;
    } else {
      controlType = 'outlet';
      controllingHW = outletControlHW;
    }

    // Capacity check
    const capacityRatio = headwaterDepth / controllingHW;
    const isAdequate = capacityRatio >= 1.0;

    // Critical depth (approximate)
    const criticalDepth = culvertType === 'pipe' 
      ? Math.pow((designFlow * designFlow) / (g * Math.pow(D, 2)), 1/3)
      : Math.pow((designFlow * designFlow) / (g * Math.pow(dimensions.width || 2, 2)), 1/3);

    // Normal depth (using Manning's equation iteratively - simplified)
    const normalDepth = Math.pow(
      (designFlow * manningN) / (Math.sqrt(culvertSlope) * (culvertType === 'pipe' ? Math.PI * D / 4 : dimensions.width || 2)),
      3/5
    );

    return {
      area,
      velocity,
      froudeNumber,
      inletControlHW,
      outletControlHW,
      controlType,
      controllingHW,
      capacityRatio,
      isAdequate,
      criticalDepth,
      normalDepth,
      entranceLoss,
      frictionLoss,
      exitLoss,
      hydraulicRadius,
    };
  }, [params, dimensions, culvertType]);

  const renderCulvertDiagram = () => {
    const width = 400;
    const height = 200;
    const margin = 20;
    
    const hwHeight = Math.min(150, (params.headwaterDepth / 3) * 100);
    const twHeight = Math.min(100, (params.tailwaterDepth / 3) * 100);
    
    return (
      <svg width={width} height={height} className="mx-auto">
        {/* Embankment */}
        <polygon
          points={`${margin},${height - margin} ${margin + 50},${margin + 30} ${width - margin - 50},${margin + 30} ${width - margin},${height - margin}`}
          fill="hsl(var(--muted))"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
        />
        
        {/* Culvert barrel */}
        <rect
          x={margin + 60}
          y={height - margin - 40}
          width={width - 2 * margin - 120}
          height={culvertType === 'pipe' ? 35 : 40}
          fill="hsl(var(--secondary))"
          stroke="hsl(var(--foreground))"
          strokeWidth="2"
          rx={culvertType === 'pipe' ? 17 : 0}
        />
        
        {/* Headwater */}
        <rect
          x={margin}
          y={height - margin - hwHeight}
          width={60}
          height={hwHeight}
          fill="hsl(var(--primary) / 0.4)"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
        />
        
        {/* Tailwater */}
        <rect
          x={width - margin - 60}
          y={height - margin - twHeight}
          width={60}
          height={twHeight}
          fill="hsl(var(--primary) / 0.3)"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
        />
        
        {/* Flow arrow */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" />
          </marker>
        </defs>
        <line
          x1={margin + 80}
          y1={height - margin - 25}
          x2={width - margin - 100}
          y2={height - margin - 25}
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          markerEnd="url(#arrowhead)"
        />
        
        {/* Labels */}
        <text x={margin + 25} y={height - margin - hwHeight - 5} textAnchor="middle" className="text-xs fill-foreground">HW</text>
        <text x={width - margin - 30} y={height - margin - twHeight - 5} textAnchor="middle" className="text-xs fill-foreground">TW</text>
        <text x={width / 2} y={height - 5} textAnchor="middle" className="text-xs fill-muted-foreground">Culvert Profile View</text>
      </svg>
    );
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Circle className="w-5 h-5 text-primary" />
          Culvert Design Calculator (HY-8 Method)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Size box and pipe culverts using FHWA HY-8 methodology with inlet/outlet control analysis
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={culvertType} onValueChange={(v) => setCulvertType(v as CulvertType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pipe" className="flex items-center gap-2">
              <Circle className="w-4 h-4" /> Pipe Culvert
            </TabsTrigger>
            <TabsTrigger value="box" className="flex items-center gap-2">
              <Square className="w-4 h-4" /> Box Culvert
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pipe" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Diameter (m)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={dimensions.diameter}
                  onChange={(e) => setDimensions({ ...dimensions, diameter: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="box" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Width (m)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={dimensions.width}
                  onChange={(e) => setDimensions({ ...dimensions, width: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Height (m)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={dimensions.height}
                  onChange={(e) => setDimensions({ ...dimensions, height: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Design Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Design Flow (m³/s)</Label>
            <Input
              type="number"
              step="0.5"
              value={params.designFlow}
              onChange={(e) => setParams({ ...params, designFlow: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label>Headwater Depth (m)</Label>
            <Input
              type="number"
              step="0.1"
              value={params.headwaterDepth}
              onChange={(e) => setParams({ ...params, headwaterDepth: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label>Tailwater Depth (m)</Label>
            <Input
              type="number"
              step="0.1"
              value={params.tailwaterDepth}
              onChange={(e) => setParams({ ...params, tailwaterDepth: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label>Culvert Length (m)</Label>
            <Input
              type="number"
              step="1"
              value={params.culvertLength}
              onChange={(e) => setParams({ ...params, culvertLength: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label>Culvert Slope (m/m)</Label>
            <Input
              type="number"
              step="0.001"
              value={params.culvertSlope}
              onChange={(e) => setParams({ ...params, culvertSlope: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label>Manning's n</Label>
            <Input
              type="number"
              step="0.001"
              value={params.manningN}
              onChange={(e) => setParams({ ...params, manningN: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div>
          <Label>Entrance Type</Label>
          <Select
            value={params.entranceLossCoeff.toString()}
            onValueChange={(v) => setParams({ ...params, entranceLossCoeff: parseFloat(v) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {entranceTypes.map((type) => (
                <SelectItem key={type.value} value={type.value.toString()}>
                  {type.label} (Ke = {type.value})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Culvert Diagram */}
        <div className="bg-background/50 rounded-lg p-4">
          {renderCulvertDiagram()}
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Control Analysis */}
          <Card className="border-secondary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="w-4 h-4" />
                Control Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Inlet Control HW:</span>
                <Badge variant="outline">{calculations.inletControlHW.toFixed(3)} m</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Outlet Control HW:</span>
                <Badge variant="outline">{calculations.outletControlHW.toFixed(3)} m</Badge>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium">Controlling Condition:</span>
                <Badge variant={calculations.controlType === 'inlet' ? 'default' : 'secondary'}>
                  {calculations.controlType.toUpperCase()} CONTROL
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Required HW:</span>
                <Badge>{calculations.controllingHW.toFixed(3)} m</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Capacity Check */}
          <Card className={`border-2 ${calculations.isAdequate ? 'border-green-500/50' : 'border-destructive/50'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                {calculations.isAdequate ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                )}
                Capacity Check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Available HW:</span>
                <Badge variant="outline">{params.headwaterDepth.toFixed(2)} m</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Required HW:</span>
                <Badge variant="outline">{calculations.controllingHW.toFixed(3)} m</Badge>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium">Capacity Ratio:</span>
                <Badge variant={calculations.isAdequate ? 'default' : 'destructive'}>
                  {calculations.capacityRatio.toFixed(2)}
                </Badge>
              </div>
              <p className={`text-sm ${calculations.isAdequate ? 'text-green-600' : 'text-destructive'}`}>
                {calculations.isAdequate 
                  ? '✓ Culvert size is adequate for design flow'
                  : '✗ Culvert undersized - increase dimensions or reduce flow'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hydraulic Properties */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-primary">{calculations.velocity.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Velocity (m/s)</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-primary">{calculations.area.toFixed(3)}</div>
            <div className="text-xs text-muted-foreground">Area (m²)</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-primary">{calculations.froudeNumber.toFixed(3)}</div>
            <div className="text-xs text-muted-foreground">Froude Number</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-primary">{calculations.criticalDepth.toFixed(3)}</div>
            <div className="text-xs text-muted-foreground">Critical Depth (m)</div>
          </div>
        </div>

        {/* Head Loss Breakdown */}
        <Card className="bg-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Head Loss Breakdown (Outlet Control)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-semibold">{calculations.entranceLoss.toFixed(4)} m</div>
                <div className="text-xs text-muted-foreground">Entrance Loss</div>
              </div>
              <div>
                <div className="font-semibold">{calculations.frictionLoss.toFixed(4)} m</div>
                <div className="text-xs text-muted-foreground">Friction Loss</div>
              </div>
              <div>
                <div className="font-semibold">{calculations.exitLoss.toFixed(4)} m</div>
                <div className="text-xs text-muted-foreground">Exit Loss</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interpretive Insights */}
        <CalculatorInsights 
          insights={generateCulvertInsights(
            calculations.controlType,
            calculations.inletControlHW,
            calculations.outletControlHW,
            calculations.capacityRatio,
            calculations.froudeNumber,
            calculations.isAdequate,
            params.headwaterDepth
          )}
        />

        {/* Interactive Quiz */}
        <CalculatorQuiz 
          title="Culvert Design Quiz"
          questions={culvertQuizQuestions}
          calculatorValues={{
            capacityRatio: calculations.capacityRatio,
            controlType: calculations.controlType,
            inletControlHW: calculations.inletControlHW,
            outletControlHW: calculations.outletControlHW
          }}
        />

        {/* Reference */}
        <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
          <strong>Reference:</strong> FHWA HY-8 Culvert Analysis Program methodology. Inlet control uses 
          unsubmerged/submerged equations; outlet control uses energy equation with entrance, friction, 
          and exit losses. Manning's equation used for friction calculations.
        </div>
      </CardContent>
    </Card>
  );
};

export default CulvertDesignCalculator;
