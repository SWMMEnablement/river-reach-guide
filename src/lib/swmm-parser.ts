/**
 * SWMM .inp File Parser
 * Parses EPA SWMM5 input files to extract hydraulic model data
 * Reference: EPA SWMM5 User's Manual, Appendix D - Input File Format
 */

export interface SWMMJunction {
  name: string;
  elevation: number;
  maxDepth: number;
  initDepth: number;
  surchargeDepth: number;
  pondedArea: number;
}

export interface SWMMConduit {
  name: string;
  fromNode: string;
  toNode: string;
  length: number;
  roughness: number;
  inOffset: number;
  outOffset: number;
  initFlow: number;
  maxFlow: number;
}

export interface SWMMXSection {
  link: string;
  shape: string;
  geom1: number; // Primary dimension (height/diameter)
  geom2: number; // Secondary dimension (base width for trapezoidal)
  geom3: number; // Left slope for trapezoidal
  geom4: number; // Right slope for trapezoidal
  barrels: number;
  culvertCode: number;
  transectName?: string;
}

export interface SWMMTransectStation {
  station: number;
  elevation: number;
}

export interface SWMMTransect {
  name: string;
  leftBank: number;
  rightBank: number;
  nLeft: number;
  nRight: number;
  nChannel: number;
  stations: SWMMTransectStation[];
}

export interface SWMMOutfall {
  name: string;
  elevation: number;
  type: string;
  stageData?: number;
  gated: boolean;
  routeTo?: string;
}

export interface SWMMParsedData {
  title: string;
  junctions: SWMMJunction[];
  conduits: SWMMConduit[];
  xsections: SWMMXSection[];
  transects: SWMMTransect[];
  outfalls: SWMMOutfall[];
  options: Record<string, string>;
  rawSections: Record<string, string>;
}

type SectionType = 'TITLE' | 'OPTIONS' | 'JUNCTIONS' | 'CONDUITS' | 'XSECTIONS' | 'TRANSECTS' | 'OUTFALLS' | string;

/**
 * Main parser function for SWMM .inp files
 */
export function parseSWMMFile(content: string): SWMMParsedData {
  const lines = content.split('\n').map(line => line.trim());
  
  const result: SWMMParsedData = {
    title: '',
    junctions: [],
    conduits: [],
    xsections: [],
    transects: [],
    outfalls: [],
    options: {},
    rawSections: {},
  };

  let currentSection: SectionType | null = null;
  let sectionContent: string[] = [];

  for (const line of lines) {
    // Skip empty lines and comments within sections
    if (line === '' || line.startsWith(';;')) {
      continue;
    }

    // Check for section header
    const sectionMatch = line.match(/^\[([A-Z_]+)\]$/);
    if (sectionMatch) {
      // Process previous section before starting new one
      if (currentSection && sectionContent.length > 0) {
        result.rawSections[currentSection] = sectionContent.join('\n');
        processSection(result, currentSection, sectionContent);
      }
      currentSection = sectionMatch[1] as SectionType;
      sectionContent = [];
      continue;
    }

    // Skip comment lines (starting with ;)
    if (line.startsWith(';')) {
      continue;
    }

    // Add line to current section
    if (currentSection) {
      sectionContent.push(line);
    }
  }

  // Process last section
  if (currentSection && sectionContent.length > 0) {
    result.rawSections[currentSection] = sectionContent.join('\n');
    processSection(result, currentSection, sectionContent);
  }

  return result;
}

function processSection(result: SWMMParsedData, section: SectionType, lines: string[]): void {
  switch (section) {
    case 'TITLE':
      result.title = lines.join(' ').trim();
      break;
    case 'OPTIONS':
      parseOptions(result, lines);
      break;
    case 'JUNCTIONS':
      parseJunctions(result, lines);
      break;
    case 'CONDUITS':
      parseConduits(result, lines);
      break;
    case 'XSECTIONS':
      parseXSections(result, lines);
      break;
    case 'TRANSECTS':
      parseTransects(result, lines);
      break;
    case 'OUTFALLS':
      parseOutfalls(result, lines);
      break;
  }
}

function parseOptions(result: SWMMParsedData, lines: string[]): void {
  for (const line of lines) {
    const parts = splitByWhitespace(line);
    if (parts.length >= 2) {
      result.options[parts[0]] = parts.slice(1).join(' ');
    }
  }
}

function parseJunctions(result: SWMMParsedData, lines: string[]): void {
  for (const line of lines) {
    const parts = splitByWhitespace(line);
    if (parts.length >= 2) {
      result.junctions.push({
        name: parts[0],
        elevation: parseFloat(parts[1]) || 0,
        maxDepth: parseFloat(parts[2]) || 0,
        initDepth: parseFloat(parts[3]) || 0,
        surchargeDepth: parseFloat(parts[4]) || 0,
        pondedArea: parseFloat(parts[5]) || 0,
      });
    }
  }
}

function parseConduits(result: SWMMParsedData, lines: string[]): void {
  for (const line of lines) {
    const parts = splitByWhitespace(line);
    if (parts.length >= 4) {
      result.conduits.push({
        name: parts[0],
        fromNode: parts[1],
        toNode: parts[2],
        length: parseFloat(parts[3]) || 0,
        roughness: parseFloat(parts[4]) || 0.013,
        inOffset: parseFloat(parts[5]) || 0,
        outOffset: parseFloat(parts[6]) || 0,
        initFlow: parseFloat(parts[7]) || 0,
        maxFlow: parseFloat(parts[8]) || 0,
      });
    }
  }
}

function parseXSections(result: SWMMParsedData, lines: string[]): void {
  for (const line of lines) {
    const parts = splitByWhitespace(line);
    if (parts.length >= 3) {
      const xsection: SWMMXSection = {
        link: parts[0],
        shape: parts[1],
        geom1: parseFloat(parts[2]) || 0,
        geom2: parseFloat(parts[3]) || 0,
        geom3: parseFloat(parts[4]) || 0,
        geom4: parseFloat(parts[5]) || 0,
        barrels: parseInt(parts[6]) || 1,
        culvertCode: parseInt(parts[7]) || 0,
      };
      
      // For irregular sections, geom1 may contain transect name
      if (xsection.shape === 'IRREGULAR') {
        xsection.transectName = parts[2];
        xsection.geom1 = 0;
      }
      
      result.xsections.push(xsection);
    }
  }
}

function parseTransects(result: SWMMParsedData, lines: string[]): void {
  let currentTransect: SWMMTransect | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parts = splitByWhitespace(line);
    
    if (parts.length === 0) continue;
    
    // NC line: roughness coefficients
    if (parts[0] === 'NC') {
      if (parts.length >= 4) {
        // NC nLeft nRight nChannel
        if (currentTransect) {
          currentTransect.nLeft = parseFloat(parts[1]) || 0.035;
          currentTransect.nRight = parseFloat(parts[2]) || 0.035;
          currentTransect.nChannel = parseFloat(parts[3]) || 0.035;
        }
      }
      continue;
    }
    
    // X1 line: transect header
    if (parts[0] === 'X1') {
      // Save previous transect
      if (currentTransect && currentTransect.stations.length > 0) {
        result.transects.push(currentTransect);
      }
      
      // X1 name nStations leftBank rightBank 0 0 0 leftMeander rightMeander channelMeander
      currentTransect = {
        name: parts[1] || '',
        leftBank: parseFloat(parts[3]) || 0,
        rightBank: parseFloat(parts[4]) || 0,
        nLeft: 0.035,
        nRight: 0.035,
        nChannel: 0.035,
        stations: [],
      };
      continue;
    }
    
    // GR line: station-elevation pairs
    if (parts[0] === 'GR' && currentTransect) {
      // GR elev1 sta1 elev2 sta2 ...
      for (let j = 1; j < parts.length - 1; j += 2) {
        const elevation = parseFloat(parts[j]);
        const station = parseFloat(parts[j + 1]);
        if (!isNaN(elevation) && !isNaN(station)) {
          currentTransect.stations.push({ station, elevation });
        }
      }
      continue;
    }
  }
  
  // Don't forget the last transect
  if (currentTransect && currentTransect.stations.length > 0) {
    result.transects.push(currentTransect);
  }
}

function parseOutfalls(result: SWMMParsedData, lines: string[]): void {
  for (const line of lines) {
    const parts = splitByWhitespace(line);
    if (parts.length >= 3) {
      result.outfalls.push({
        name: parts[0],
        elevation: parseFloat(parts[1]) || 0,
        type: parts[2],
        stageData: parts[3] ? parseFloat(parts[3]) : undefined,
        gated: parts[4]?.toUpperCase() === 'YES',
        routeTo: parts[5],
      });
    }
  }
}

function splitByWhitespace(line: string): string[] {
  return line.split(/\s+/).filter(part => part.length > 0);
}

/**
 * Utility function to get shape description
 */
export function getShapeDescription(shape: string): string {
  const descriptions: Record<string, string> = {
    'CIRCULAR': 'Circular pipe',
    'FORCE_MAIN': 'Pressurized circular pipe',
    'FILLED_CIRCULAR': 'Circular with sediment fill',
    'RECT_CLOSED': 'Closed rectangular',
    'RECT_OPEN': 'Open rectangular channel',
    'TRAPEZOIDAL': 'Trapezoidal channel',
    'TRIANGULAR': 'Triangular channel',
    'PARABOLIC': 'Parabolic channel',
    'POWER': 'Power law shape',
    'RECT_TRIANGULAR': 'Rectangular-triangular',
    'RECT_ROUND': 'Rectangular-round',
    'MOD_BASKET': 'Modified basket handle',
    'EGG': 'Egg-shaped',
    'HORSESHOE': 'Horseshoe',
    'GOTHIC': 'Gothic arch',
    'CATENARY': 'Catenary',
    'SEMI_ELLIPTICAL': 'Semi-elliptical',
    'BASKET_HANDLE': 'Basket handle',
    'SEMI_CIRCULAR': 'Semi-circular',
    'IRREGULAR': 'Irregular/Natural (from transect)',
    'CUSTOM': 'Custom shape curve',
  };
  return descriptions[shape] || shape;
}

/**
 * Convert SWMM cross-section to calculator-friendly format
 */
export interface CalculatorGeometry {
  bottomWidth: number;
  sideSlope: number;
  manningN: number;
  shape: string;
  transectData?: SWMMTransectStation[];
}

export function xsectionToGeometry(
  xsection: SWMMXSection, 
  conduit?: SWMMConduit,
  transects?: SWMMTransect[]
): CalculatorGeometry {
  const result: CalculatorGeometry = {
    bottomWidth: 0,
    sideSlope: 0,
    manningN: conduit?.roughness || 0.035,
    shape: xsection.shape,
  };

  switch (xsection.shape) {
    case 'TRAPEZOIDAL':
      result.bottomWidth = xsection.geom2;
      result.sideSlope = (xsection.geom3 + xsection.geom4) / 2; // Average of left and right slopes
      break;
    case 'RECT_OPEN':
    case 'RECT_CLOSED':
      result.bottomWidth = xsection.geom2 || xsection.geom1;
      result.sideSlope = 0;
      break;
    case 'TRIANGULAR':
      result.bottomWidth = 0;
      result.sideSlope = xsection.geom2 / xsection.geom1 / 2; // Convert max width/depth to slope
      break;
    case 'CIRCULAR':
      result.bottomWidth = xsection.geom1; // Diameter
      result.sideSlope = 0;
      break;
    case 'IRREGULAR':
      if (transects && xsection.transectName) {
        const transect = transects.find(t => t.name === xsection.transectName);
        if (transect) {
          result.transectData = transect.stations;
          result.manningN = transect.nChannel;
          
          // Estimate bottom width from transect data
          const sortedStations = [...transect.stations].sort((a, b) => a.station - b.station);
          if (sortedStations.length >= 2) {
            const minElev = Math.min(...sortedStations.map(s => s.elevation));
            const bottomPoints = sortedStations.filter(s => s.elevation <= minElev + 0.1);
            if (bottomPoints.length >= 2) {
              result.bottomWidth = Math.abs(
                bottomPoints[bottomPoints.length - 1].station - bottomPoints[0].station
              );
            }
          }
        }
      }
      break;
    default:
      result.bottomWidth = xsection.geom1;
  }

  return result;
}

/**
 * Validate SWMM file content
 */
export function validateSWMMFile(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!content || content.trim().length === 0) {
    errors.push('File is empty');
    return { valid: false, errors };
  }

  // Check for required sections
  const hasConduits = content.includes('[CONDUITS]');
  const hasXSections = content.includes('[XSECTIONS]');
  const hasJunctions = content.includes('[JUNCTIONS]') || content.includes('[OUTFALLS]');

  if (!hasConduits && !hasXSections) {
    errors.push('No [CONDUITS] or [XSECTIONS] section found - this may not be a complete SWMM model');
  }

  if (!hasJunctions) {
    errors.push('No [JUNCTIONS] or [OUTFALLS] section found');
  }

  // Basic format check
  const sectionCount = (content.match(/\[[A-Z_]+\]/g) || []).length;
  if (sectionCount < 2) {
    errors.push('File does not appear to be a valid SWMM .inp format');
  }

  return { valid: errors.length === 0, errors };
}
