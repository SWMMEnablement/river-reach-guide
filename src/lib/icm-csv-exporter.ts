/**
 * ICM-Compatible CSV Exporter
 * 
 * Exports calculator results in CSV formats compatible with 
 * Autodesk InfoWorks ICM for direct import.
 * 
 * Supported export formats:
 * - Cross-section survey data (hw_cross_section_line format)
 * - Rating curve data (stage-discharge)
 * - Channel properties (conduit/river reach parameters)
 */

export interface ICMCrossSectionExport {
  sectionId: string;
  chainage?: number;
  points: { x: number; z: number; n?: number }[];
  leftBankIndex?: number;
  rightBankIndex?: number;
  manningN: number;
}

export interface ICMRatingCurveExport {
  nodeId: string;
  curveType: 'STAGE_DISCHARGE' | 'AREA_STAGE' | 'VELOCITY_STAGE';
  points: { stage: number; value: number }[];
}

export interface ICMChannelExport {
  id: string;
  usNodeId?: string;
  dsNodeId?: string;
  length: number;
  usInvert?: number;
  dsInvert?: number;
  shape: string;
  bottomWidth: number;
  height?: number;
  sideSlope?: number;
  manningN: number;
  bedSlope: number;
}

export interface ICMExportOptions {
  filename: string;
  includeHeaders?: boolean;
  decimalPlaces?: number;
  coordinateSystem?: string;
}

/**
 * Export cross-section survey data in ICM-compatible CSV format
 * Format matches hw_cross_section_point import template
 */
export function exportCrossSectionCSV(
  sections: ICMCrossSectionExport[],
  options: ICMExportOptions
): void {
  const dp = options.decimalPlaces ?? 4;
  
  // ICM cross-section import format
  const headers = [
    'section_id',
    'chainage',
    'x',
    'z',
    'roughness_n',
    'left_bank',
    'right_bank'
  ].join(',');
  
  const rows: string[] = [];
  
  for (const section of sections) {
    section.points.forEach((point, index) => {
      const isLeftBank = index === section.leftBankIndex;
      const isRightBank = index === section.rightBankIndex;
      
      rows.push([
        section.sectionId,
        section.chainage?.toFixed(dp) ?? '',
        point.x.toFixed(dp),
        point.z.toFixed(dp),
        (point.n ?? section.manningN).toFixed(4),
        isLeftBank ? 'Y' : '',
        isRightBank ? 'Y' : ''
      ].join(','));
    });
  }
  
  const content = options.includeHeaders !== false 
    ? headers + '\n' + rows.join('\n')
    : rows.join('\n');
    
  downloadCSV(content, options.filename);
}

/**
 * Export rating curve data in ICM-compatible CSV format
 * Format matches ICM rating curve import template
 */
export function exportRatingCurveCSV(
  curves: ICMRatingCurveExport[],
  options: ICMExportOptions
): void {
  const dp = options.decimalPlaces ?? 4;
  
  // ICM rating curve import format
  const headers = [
    'node_id',
    'curve_type',
    'stage_m',
    'value'
  ].join(',');
  
  const rows: string[] = [];
  
  for (const curve of curves) {
    for (const point of curve.points) {
      rows.push([
        curve.nodeId,
        curve.curveType,
        point.stage.toFixed(dp),
        point.value.toFixed(dp)
      ].join(','));
    }
  }
  
  const content = options.includeHeaders !== false 
    ? headers + '\n' + rows.join('\n')
    : rows.join('\n');
    
  downloadCSV(content, options.filename);
}

/**
 * Export channel/conduit properties in ICM-compatible CSV format
 * Format matches hw_conduit and hw_river_reach import templates
 */
export function exportChannelPropertiesCSV(
  channels: ICMChannelExport[],
  options: ICMExportOptions
): void {
  const dp = options.decimalPlaces ?? 4;
  
  // ICM conduit/reach import format
  const headers = [
    'id',
    'us_node_id',
    'ds_node_id',
    'length_m',
    'us_invert_m',
    'ds_invert_m',
    'shape',
    'width_m',
    'height_m',
    'side_slope',
    'roughness_n',
    'bed_slope'
  ].join(',');
  
  const rows: string[] = [];
  
  for (const channel of channels) {
    rows.push([
      channel.id,
      channel.usNodeId ?? '',
      channel.dsNodeId ?? '',
      channel.length.toFixed(dp),
      channel.usInvert?.toFixed(dp) ?? '',
      channel.dsInvert?.toFixed(dp) ?? '',
      channel.shape,
      channel.bottomWidth.toFixed(dp),
      channel.height?.toFixed(dp) ?? '',
      channel.sideSlope?.toFixed(2) ?? '',
      channel.manningN.toFixed(4),
      channel.bedSlope.toFixed(6)
    ].join(','));
  }
  
  const content = options.includeHeaders !== false 
    ? headers + '\n' + rows.join('\n')
    : rows.join('\n');
    
  downloadCSV(content, options.filename);
}

/**
 * Export GVF profile data in ICM-compatible water level format
 */
export interface ICMWaterLevelExport {
  reachId: string;
  chainage: number;
  waterLevel: number;
  bedLevel?: number;
  velocity?: number;
  froudeNumber?: number;
}

export function exportWaterLevelProfileCSV(
  profile: ICMWaterLevelExport[],
  options: ICMExportOptions
): void {
  const dp = options.decimalPlaces ?? 4;
  
  const headers = [
    'reach_id',
    'chainage_m',
    'water_level_m',
    'bed_level_m',
    'velocity_m_s',
    'froude_number'
  ].join(',');
  
  const rows: string[] = [];
  
  for (const point of profile) {
    rows.push([
      point.reachId,
      point.chainage.toFixed(dp),
      point.waterLevel.toFixed(dp),
      point.bedLevel?.toFixed(dp) ?? '',
      point.velocity?.toFixed(dp) ?? '',
      point.froudeNumber?.toFixed(4) ?? ''
    ].join(','));
  }
  
  const content = options.includeHeaders !== false 
    ? headers + '\n' + rows.join('\n')
    : rows.join('\n');
    
  downloadCSV(content, options.filename);
}

/**
 * Export culvert design results in ICM-compatible format
 */
export interface ICMCulvertExport {
  id: string;
  type: 'PIPE' | 'BOX';
  diameter?: number;
  width?: number;
  height?: number;
  length: number;
  usInvert: number;
  dsInvert: number;
  manningN: number;
  entranceType: string;
  entranceLossCoeff: number;
  designFlow: number;
  headwater: number;
  tailwater: number;
  controlType: string;
  velocity: number;
  froudeNumber: number;
}

export function exportCulvertDesignCSV(
  culverts: ICMCulvertExport[],
  options: ICMExportOptions
): void {
  const dp = options.decimalPlaces ?? 4;
  
  const headers = [
    'id',
    'type',
    'diameter_m',
    'width_m',
    'height_m',
    'length_m',
    'us_invert_m',
    'ds_invert_m',
    'roughness_n',
    'entrance_type',
    'entrance_ke',
    'design_flow_m3s',
    'headwater_m',
    'tailwater_m',
    'control_type',
    'velocity_m_s',
    'froude_number'
  ].join(',');
  
  const rows: string[] = [];
  
  for (const culvert of culverts) {
    rows.push([
      culvert.id,
      culvert.type,
      culvert.diameter?.toFixed(dp) ?? '',
      culvert.width?.toFixed(dp) ?? '',
      culvert.height?.toFixed(dp) ?? '',
      culvert.length.toFixed(dp),
      culvert.usInvert.toFixed(dp),
      culvert.dsInvert.toFixed(dp),
      culvert.manningN.toFixed(4),
      culvert.entranceType,
      culvert.entranceLossCoeff.toFixed(3),
      culvert.designFlow.toFixed(dp),
      culvert.headwater.toFixed(dp),
      culvert.tailwater.toFixed(dp),
      culvert.controlType,
      culvert.velocity.toFixed(dp),
      culvert.froudeNumber.toFixed(4)
    ].join(','));
  }
  
  const content = options.includeHeaders !== false 
    ? headers + '\n' + rows.join('\n')
    : rows.join('\n');
    
  downloadCSV(content, options.filename);
}

/**
 * Export Froude number analysis in ICM-compatible format
 */
export interface ICMFroudeAnalysisExport {
  sectionId: string;
  chainage: number;
  depth: number;
  velocity: number;
  froudeNumber: number;
  flowRegime: 'SUBCRITICAL' | 'CRITICAL' | 'SUPERCRITICAL';
  criticalDepth: number;
  normalDepth: number;
  specificEnergy: number;
}

export function exportFroudeAnalysisCSV(
  analysis: ICMFroudeAnalysisExport[],
  options: ICMExportOptions
): void {
  const dp = options.decimalPlaces ?? 4;
  
  const headers = [
    'section_id',
    'chainage_m',
    'depth_m',
    'velocity_m_s',
    'froude_number',
    'flow_regime',
    'critical_depth_m',
    'normal_depth_m',
    'specific_energy_m'
  ].join(',');
  
  const rows: string[] = [];
  
  for (const point of analysis) {
    rows.push([
      point.sectionId,
      point.chainage.toFixed(dp),
      point.depth.toFixed(dp),
      point.velocity.toFixed(dp),
      point.froudeNumber.toFixed(4),
      point.flowRegime,
      point.criticalDepth.toFixed(dp),
      point.normalDepth.toFixed(dp),
      point.specificEnergy.toFixed(dp)
    ].join(','));
  }
  
  const content = options.includeHeaders !== false 
    ? headers + '\n' + rows.join('\n')
    : rows.join('\n');
    
  downloadCSV(content, options.filename);
}

/**
 * Helper function to download CSV content
 */
function downloadCSV(content: string, filename: string): void {
  // Add BOM for Excel compatibility with UTF-8
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Generate a timestamped filename
 */
export function generateICMFilename(prefix: string, extension: string = 'csv'): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
  return `${prefix}_ICM_${timestamp}.${extension}`;
}
