import { Droplets, Mountain, Ruler, Waves, TreePine } from 'lucide-react';
import { ChannelGeometry, HydraulicParams } from './types';

interface Props {
  geometry: ChannelGeometry;
  params: HydraulicParams;
  showFloodplain: boolean;
  onGeometryChange: (geometry: ChannelGeometry) => void;
  onParamsChange: (params: HydraulicParams) => void;
  onFloodplainToggle: (show: boolean) => void;
}

export const ControlPanel = ({
  geometry,
  params,
  showFloodplain,
  onGeometryChange,
  onParamsChange,
  onFloodplainToggle,
}: Props) => {
  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-lg">
      <h4 className="text-sm font-semibold text-foreground mb-4">Channel Parameters</h4>
      
      <div className="space-y-5">
        {/* Channel Geometry Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <Ruler className="w-3.5 h-3.5" />
            Geometry
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-muted-foreground">Bottom Width</label>
                <span className="text-sm font-mono">{geometry.bottomWidth}m</span>
              </div>
              <input
                type="range"
                min={2}
                max={30}
                step={0.5}
                value={geometry.bottomWidth}
                onChange={(e) => onGeometryChange({ ...geometry, bottomWidth: parseFloat(e.target.value) })}
                className="w-full h-2 rounded-lg appearance-none bg-secondary cursor-pointer accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-muted-foreground">Bank Slope (H:V)</label>
                <span className="text-sm font-mono">{geometry.bankSlope}:1</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={5}
                step={0.25}
                value={geometry.bankSlope}
                onChange={(e) => onGeometryChange({ ...geometry, bankSlope: parseFloat(e.target.value) })}
                className="w-full h-2 rounded-lg appearance-none bg-secondary cursor-pointer accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-muted-foreground">Channel Depth</label>
                <span className="text-sm font-mono">{geometry.channelDepth}m</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={0.25}
                value={geometry.channelDepth}
                onChange={(e) => onGeometryChange({ ...geometry, channelDepth: parseFloat(e.target.value) })}
                className="w-full h-2 rounded-lg appearance-none bg-secondary cursor-pointer accent-primary"
              />
            </div>
          </div>
        </div>

        {/* Hydraulic Parameters Section */}
        <div className="space-y-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <Waves className="w-3.5 h-3.5" />
            Hydraulics
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-muted-foreground">Water Level</label>
                <span className="text-sm font-mono text-water">{params.waterLevel.toFixed(2)}m</span>
              </div>
              <input
                type="range"
                min={0}
                max={geometry.channelDepth + 2}
                step={0.1}
                value={params.waterLevel}
                onChange={(e) => onParamsChange({ ...params, waterLevel: parseFloat(e.target.value) })}
                className="w-full h-2 rounded-lg appearance-none bg-secondary cursor-pointer accent-water"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-muted-foreground">Manning's n (channel)</label>
                <span className="text-sm font-mono">{params.manningN.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min={0.01}
                max={0.15}
                step={0.001}
                value={params.manningN}
                onChange={(e) => onParamsChange({ ...params, manningN: parseFloat(e.target.value) })}
                className="w-full h-2 rounded-lg appearance-none bg-secondary cursor-pointer accent-terrain"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-muted-foreground">Bed Slope</label>
                <span className="text-sm font-mono">{(params.bedSlope * 1000).toFixed(2)}‰</span>
              </div>
              <input
                type="range"
                min={0.0001}
                max={0.01}
                step={0.0001}
                value={params.bedSlope}
                onChange={(e) => onParamsChange({ ...params, bedSlope: parseFloat(e.target.value) })}
                className="w-full h-2 rounded-lg appearance-none bg-secondary cursor-pointer accent-terrain"
              />
            </div>
          </div>
        </div>

        {/* Floodplain Toggle */}
        <div className="pt-3 border-t border-border">
          <button
            onClick={() => onFloodplainToggle(!showFloodplain)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
              showFloodplain 
                ? 'bg-terrain/10 border-terrain/50 text-terrain' 
                : 'bg-secondary border-transparent text-muted-foreground hover:border-border'
            }`}
          >
            <div className="flex items-center gap-2">
              <TreePine className="w-4 h-4" />
              <span className="text-sm font-medium">Floodplain</span>
            </div>
            <div className={`w-10 h-5 rounded-full transition-colors ${showFloodplain ? 'bg-terrain' : 'bg-muted'}`}>
              <div className={`w-4 h-4 mt-0.5 rounded-full bg-white shadow transition-transform ${
                showFloodplain ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </div>
          </button>

          {showFloodplain && (
            <div className="mt-3">
              <div className="flex justify-between mb-1">
                <label className="text-sm text-muted-foreground">Floodplain n</label>
                <span className="text-sm font-mono">{params.manningNFloodplain.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min={0.03}
                max={0.2}
                step={0.005}
                value={params.manningNFloodplain}
                onChange={(e) => onParamsChange({ ...params, manningNFloodplain: parseFloat(e.target.value) })}
                className="w-full h-2 rounded-lg appearance-none bg-secondary cursor-pointer accent-terrain"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
