import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Layers, Map, Play, Pause, RotateCcw, BookOpen, Calculator, Waves, Mountain, TreePine, Building2, Droplets, PenTool, Milestone, Grid3X3, Box } from 'lucide-react';
import { ViewMode, ChannelGeometry, HydraulicParams } from './types';
import { useHydraulicCalculations } from './useHydraulicCalculations';
import { CrossSectionView } from './CrossSectionView';
import { LongProfileView } from './LongProfileView';
import { PlanView } from './PlanView';
import { IrregularCrossSectionEditor } from './IrregularCrossSectionEditor';
import { BridgeCulvertView } from './BridgeCulvertView';
import { CouplingZonesView } from './CouplingZonesView';
import { ControlPanel } from './ControlPanel';
import { ResultsPanel } from './ResultsPanel';
import { ICMConceptCard } from './ICMConceptCard';
import { AdvancedConceptsSection } from './AdvancedConceptsSection';
import { TroubleshootingSection } from './TroubleshootingSection';
import { TwoDModelingSection } from './TwoDModelingSection';
import { SWMM5ChannelsSection } from './SWMM5ChannelsSection';
import RubyScriptsSection from './RubyScriptsSection';
interface ChannelPreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  geometry: ChannelGeometry;
  params: HydraulicParams;
  showFloodplain: boolean;
}

const channelPresets: ChannelPreset[] = [
  {
    id: 'natural-river',
    name: 'Natural River',
    icon: <TreePine className="w-4 h-4" />,
    description: 'Meandering channel with vegetated floodplains',
    geometry: {
      bottomWidth: 15,
      bankSlope: 2.5,
      channelDepth: 3.5,
      floodplainWidth: 30,
    },
    params: {
      manningN: 0.035,
      manningNFloodplain: 0.08,
      bedSlope: 0.0008,
      waterLevel: 2.5,
    },
    showFloodplain: true,
  },
  {
    id: 'concrete-channel',
    name: 'Concrete Channel',
    icon: <Building2 className="w-4 h-4" />,
    description: 'Engineered channel with smooth surfaces',
    geometry: {
      bottomWidth: 8,
      bankSlope: 1,
      channelDepth: 4,
      floodplainWidth: 5,
    },
    params: {
      manningN: 0.015,
      manningNFloodplain: 0.025,
      bedSlope: 0.002,
      waterLevel: 2,
    },
    showFloodplain: false,
  },
  {
    id: 'vegetated-swale',
    name: 'Vegetated Swale',
    icon: <Droplets className="w-4 h-4" />,
    description: 'Shallow grassed drainage channel',
    geometry: {
      bottomWidth: 3,
      bankSlope: 4,
      channelDepth: 1.2,
      floodplainWidth: 10,
    },
    params: {
      manningN: 0.045,
      manningNFloodplain: 0.1,
      bedSlope: 0.005,
      waterLevel: 0.6,
    },
    showFloodplain: false,
  },
];

const defaultGeometry: ChannelGeometry = channelPresets[0].geometry;
const defaultParams: HydraulicParams = channelPresets[0].params;

export const ChannelVisualizer = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('cross-section');
  const [geometry, setGeometry] = useState<ChannelGeometry>(defaultGeometry);
  const [params, setParams] = useState<HydraulicParams>(defaultParams);
  const [showFloodplain, setShowFloodplain] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);
  const [activePreset, setActivePreset] = useState<string>('natural-river');

  const results = useHydraulicCalculations(geometry, params, showFloodplain);

  const applyPreset = (preset: ChannelPreset) => {
    setGeometry(preset.geometry);
    setParams(preset.params);
    setShowFloodplain(preset.showFloodplain);
    setActivePreset(preset.id);
  };

  const resetAll = () => {
    const defaultPreset = channelPresets[0];
    applyPreset(defaultPreset);
  };

  const viewModes = [
    { id: 'cross-section' as ViewMode, label: 'Cross-Section', shortLabel: 'Section', icon: Layers },
    { id: 'long-profile' as ViewMode, label: 'Long Profile', shortLabel: 'Profile', icon: Eye },
    { id: 'plan-view' as ViewMode, label: 'Plan View', shortLabel: 'Plan', icon: Map },
    { id: 'irregular-section' as ViewMode, label: 'Irregular Section', shortLabel: 'Irregular', icon: PenTool },
    { id: 'bridge-culvert' as ViewMode, label: 'Bridge/Culvert', shortLabel: 'Bridge', icon: Milestone },
    { id: 'coupling-zones' as ViewMode, label: '1D/2D Coupling', shortLabel: '1D/2D', icon: Grid3X3 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Preset Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {channelPresets.map(preset => (
          <motion.button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
              activePreset === preset.id
                ? 'bg-primary/10 border-primary shadow-md'
                : 'bg-card border-border hover:border-primary/50'
            }`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className={`p-2 rounded-lg ${
              activePreset === preset.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}>
              {preset.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-sm ${
                activePreset === preset.id ? 'text-primary' : 'text-foreground'
              }`}>
                {preset.name}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {preset.description}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                  n={preset.params.manningN}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                  b={preset.geometry.bottomWidth}m
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* View Mode Tabs & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex bg-secondary rounded-lg p-1 overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max">
            {viewModes.map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  viewMode === mode.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <mode.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden xs:inline sm:hidden">{mode.shortLabel}</span>
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
              isAnimating ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="hidden xs:inline">{isAnimating ? 'Pause' : 'Animate'}</span>
          </button>
          <button
            onClick={resetAll}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors"
            title="Reset all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Visualization Canvas */}
        <div className={`bg-card rounded-xl p-4 border border-border shadow-lg ${
          ['irregular-section', 'bridge-culvert', 'coupling-zones'].includes(viewMode) ? 'lg:col-span-4' : 'lg:col-span-3'
        }`}>
          <motion.div key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {viewMode === 'cross-section' && (
              <CrossSectionView geometry={geometry} params={params} results={results} showFloodplain={showFloodplain} isAnimating={isAnimating} />
            )}
            {viewMode === 'long-profile' && (
              <LongProfileView geometry={geometry} params={params} results={results} isAnimating={isAnimating} />
            )}
            {viewMode === 'plan-view' && (
              <PlanView geometry={geometry} params={params} results={results} showFloodplain={showFloodplain} isAnimating={isAnimating} />
            )}
            {viewMode === 'irregular-section' && (
              <IrregularCrossSectionEditor />
            )}
            {viewMode === 'bridge-culvert' && (
              <BridgeCulvertView isAnimating={isAnimating} />
            )}
            {viewMode === 'coupling-zones' && (
              <CouplingZonesView isAnimating={isAnimating} />
            )}
          </motion.div>
        </div>

        {/* Control Panel - only show for basic views */}
        {!['irregular-section', 'bridge-culvert', 'coupling-zones'].includes(viewMode) && (
          <ControlPanel
            geometry={geometry}
            params={params}
            showFloodplain={showFloodplain}
            onGeometryChange={setGeometry}
            onParamsChange={setParams}
            onFloodplainToggle={setShowFloodplain}
          />
        )}
      </div>

      {/* Results Panel - only show for basic views */}
      {!['irregular-section', 'bridge-culvert', 'coupling-zones'].includes(viewMode) && (
        <ResultsPanel results={results} />
      )}

      {/* ICM Concepts Section */}
      <div className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">ICM Hydraulic Concepts</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ICMConceptCard
            title="Conveyance (K)"
            icon={<Calculator className="w-5 h-5" />}
            formula="K = (1/n) × A × R^(2/3)"
            description="Conveyance represents the flow-carrying capacity of a channel section."
            details={[
              "Combines geometry and roughness into single value",
              "Q = K × √S (discharge from conveyance)",
              "Different K values for channel vs floodplain zones",
              "Used in compound channel calculations"
            ]}
            color="primary"
          />
          <ICMConceptCard
            title="Saint-Venant Equations"
            icon={<Waves className="w-5 h-5" />}
            formula="∂A/∂t + ∂Q/∂x = 0"
            description="The fundamental equations governing unsteady open-channel flow."
            details={[
              "Continuity: mass conservation (∂A/∂t + ∂Q/∂x = q)",
              "Momentum: force balance along flow direction",
              "Solved numerically using finite difference methods",
              "ICM uses Preissmann implicit scheme"
            ]}
            color="water"
          />
          <ICMConceptCard
            title="Roughness Zones"
            icon={<Mountain className="w-5 h-5" />}
            formula="n = 0.015 to 0.15"
            description="Different Manning's n values applied to distinct parts of the cross-section."
            details={[
              "Main channel: typically 0.025-0.045",
              "Floodplain: typically 0.05-0.15 (vegetation)",
              "Bank markers define zone boundaries",
              "Composite roughness calculated for total section"
            ]}
            color="terrain"
          />
        </div>
      </div>

      {/* Advanced Concepts Section */}
      <AdvancedConceptsSection />

      {/* 2D Modeling Section */}
      <TwoDModelingSection />

      {/* SWMM5 Channels Section */}
      <SWMM5ChannelsSection />

      {/* Ruby Scripts Section */}
      <RubyScriptsSection />

      {/* Troubleshooting Section */}
      <TroubleshootingSection />
    </div>
  );
};
