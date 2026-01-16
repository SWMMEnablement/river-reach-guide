export interface ChannelGeometry {
  bottomWidth: number;      // meters
  bankSlope: number;        // horizontal:vertical (e.g., 2 means 2:1)
  channelDepth: number;     // meters
  floodplainWidth: number;  // meters (each side)
}

export interface HydraulicParams {
  manningN: number;
  manningNFloodplain: number;
  bedSlope: number;
  waterLevel: number;
}

export interface HydraulicResults {
  area: number;
  wettedPerimeter: number;
  hydraulicRadius: number;
  topWidth: number;
  velocity: number;
  discharge: number;
  froudeNumber: number;
  conveyance: number;
}

export type ViewMode = 'cross-section' | 'long-profile' | 'plan-view';
