/**
 * ICM SQLite Database Parser
 * 
 * Parses Autodesk InfoWorks ICM .sqlite database files to extract
 * river reach, conduit, and cross-section data.
 * 
 * Based on ICM database schema:
 * - hw_river_reach: River reach links
 * - hw_conduit: Closed conduits/pipes
 * - hw_cross_section_line: Cross-section survey lines
 * - Various sub-tables for geometry data
 */

import initSqlJs, { Database } from 'sql.js';

// Types for parsed ICM data
export interface ICMRiverReach {
  id: string;
  usNodeId: string;
  dsNodeId: string;
  length: number;
  usInvert: number;
  dsInvert: number;
  shape: string;
  sections: ICMReachSection[];
}

export interface ICMReachSection {
  chainage: number;
  points: ICMSectionPoint[];
  manningN: number;
  leftBankX?: number;
  rightBankX?: number;
}

export interface ICMSectionPoint {
  x: number;     // Offset from center
  z: number;     // Elevation
  n?: number;    // Optional roughness at this point
}

export interface ICMConduit {
  id: string;
  usNodeId: string;
  dsNodeId: string;
  length: number;
  usInvert: number;
  dsInvert: number;
  shape: string;
  width: number;
  height: number;
  roughnessN: number;
  roughnessType: string;
}

export interface ICMNode {
  id: string;
  x: number;
  y: number;
  groundLevel: number;
  chamberFloor?: number;
}

export interface ICMCrossSection {
  id: string;
  riverReachId?: string;
  chainage?: number;
  points: ICMSectionPoint[];
  manningN: number;
  leftBankIndex?: number;
  rightBankIndex?: number;
}

export interface ICMParsedData {
  riverReaches: ICMRiverReach[];
  conduits: ICMConduit[];
  nodes: ICMNode[];
  crossSections: ICMCrossSection[];
  metadata: {
    modelName?: string;
    createdDate?: string;
    version?: string;
    tableCount: number;
  };
}

export interface ICMImportableItem {
  id: string;
  name: string;
  type: 'river_reach' | 'conduit' | 'cross_section';
  length?: number;
  shape?: string;
  manningN?: number;
  bedSlope?: number;
  bottomWidth?: number;
  sideSlope?: number;
  points?: ICMSectionPoint[];
}

let sqlPromise: Promise<any> | null = null;

async function initSQL() {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`
    });
  }
  return sqlPromise;
}

/**
 * Parse an ICM SQLite database file
 */
export async function parseICMDatabase(file: File): Promise<ICMParsedData> {
  const SQL = await initSQL();
  
  // Read file as array buffer
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Open database
  const db: Database = new SQL.Database(uint8Array);
  
  try {
    // Get available tables
    const tables = getAvailableTables(db);
    
    // Parse different elements based on available tables
    const riverReaches = tables.includes('hw_river_reach') 
      ? parseRiverReaches(db) 
      : [];
      
    const conduits = tables.includes('hw_conduit') 
      ? parseConduits(db) 
      : [];
      
    const nodes = parseNodes(db, tables);
    
    const crossSections = tables.includes('hw_cross_section_line')
      ? parseCrossSections(db)
      : [];
    
    // Try to get metadata
    const metadata = getMetadata(db, tables);
    
    return {
      riverReaches,
      conduits,
      nodes,
      crossSections,
      metadata: {
        ...metadata,
        tableCount: tables.length
      }
    };
  } finally {
    db.close();
  }
}

function getAvailableTables(db: Database): string[] {
  const result = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => row[0] as string);
}

function parseRiverReaches(db: Database): ICMRiverReach[] {
  const reaches: ICMRiverReach[] = [];
  
  try {
    // Query main river reach table
    const result = db.exec(`
      SELECT 
        id, us_node_id, ds_node_id, 
        COALESCE(length, 0) as length,
        COALESCE(us_invert, 0) as us_invert,
        COALESCE(ds_invert, 0) as ds_invert,
        COALESCE(shape, 'IRREGULAR') as shape
      FROM hw_river_reach
    `);
    
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    const idIdx = columns.indexOf('id');
    const usNodeIdx = columns.indexOf('us_node_id');
    const dsNodeIdx = columns.indexOf('ds_node_id');
    const lengthIdx = columns.indexOf('length');
    const usInvertIdx = columns.indexOf('us_invert');
    const dsInvertIdx = columns.indexOf('ds_invert');
    const shapeIdx = columns.indexOf('shape');
    
    for (const row of result[0].values) {
      const reachId = String(row[idIdx]);
      
      // Try to get section data
      const sections = parseReachSections(db, reachId);
      
      reaches.push({
        id: reachId,
        usNodeId: String(row[usNodeIdx] || ''),
        dsNodeId: String(row[dsNodeIdx] || ''),
        length: Number(row[lengthIdx]) || 0,
        usInvert: Number(row[usInvertIdx]) || 0,
        dsInvert: Number(row[dsInvertIdx]) || 0,
        shape: String(row[shapeIdx] || 'IRREGULAR'),
        sections
      });
    }
  } catch (e) {
    console.warn('Error parsing river reaches:', e);
  }
  
  return reaches;
}

function parseReachSections(db: Database, reachId: string): ICMReachSection[] {
  const sections: ICMReachSection[] = [];
  
  try {
    // Try hw_reach_section sub-table pattern
    const result = db.exec(`
      SELECT 
        COALESCE(chainage, row_number() OVER ()) as chainage,
        x, z,
        COALESCE(roughness_manning, 0.035) as n
      FROM hw_reach_section
      WHERE parent_id = '${reachId}'
      ORDER BY chainage, x
    `);
    
    if (result.length > 0) {
      const pointsByChain: Record<number, ICMSectionPoint[]> = {};
      const nByChain: Record<number, number> = {};
      
      for (const row of result[0].values) {
        const chainage = Number(row[0]);
        const point: ICMSectionPoint = {
          x: Number(row[1]),
          z: Number(row[2]),
          n: Number(row[3])
        };
        
        if (!pointsByChain[chainage]) {
          pointsByChain[chainage] = [];
          nByChain[chainage] = Number(row[3]) || 0.035;
        }
        pointsByChain[chainage].push(point);
      }
      
      for (const [chainStr, points] of Object.entries(pointsByChain)) {
        const chainage = Number(chainStr);
        sections.push({
          chainage,
          points: points.sort((a, b) => a.x - b.x),
          manningN: nByChain[chainage]
        });
      }
    }
  } catch (e) {
    console.warn('Error parsing reach sections:', e);
  }
  
  return sections;
}

function parseConduits(db: Database): ICMConduit[] {
  const conduits: ICMConduit[] = [];
  
  try {
    const result = db.exec(`
      SELECT 
        id, us_node_id, ds_node_id,
        COALESCE(conduit_length, length, 0) as length,
        COALESCE(us_invert, 0) as us_invert,
        COALESCE(ds_invert, 0) as ds_invert,
        COALESCE(shape, 'CIRCULAR') as shape,
        COALESCE(conduit_width, diameter, width, 1) as width,
        COALESCE(conduit_height, height, diameter, 1) as height,
        COALESCE(roughness_n, bottom_roughness_n, 0.013) as n,
        COALESCE(roughness_type, 'Manning') as roughness_type
      FROM hw_conduit
    `);
    
    if (result.length === 0) return [];
    
    const cols = result[0].columns;
    
    for (const row of result[0].values) {
      conduits.push({
        id: String(row[cols.indexOf('id')]),
        usNodeId: String(row[cols.indexOf('us_node_id')] || ''),
        dsNodeId: String(row[cols.indexOf('ds_node_id')] || ''),
        length: Number(row[cols.indexOf('length')]) || 0,
        usInvert: Number(row[cols.indexOf('us_invert')]) || 0,
        dsInvert: Number(row[cols.indexOf('ds_invert')]) || 0,
        shape: String(row[cols.indexOf('shape')] || 'CIRCULAR'),
        width: Number(row[cols.indexOf('width')]) || 1,
        height: Number(row[cols.indexOf('height')]) || 1,
        roughnessN: Number(row[cols.indexOf('n')]) || 0.013,
        roughnessType: String(row[cols.indexOf('roughness_type')] || 'Manning')
      });
    }
  } catch (e) {
    console.warn('Error parsing conduits:', e);
  }
  
  return conduits;
}

function parseNodes(db: Database, tables: string[]): ICMNode[] {
  const nodes: ICMNode[] = [];
  
  // Try different node tables
  const nodeTables = [
    'hw_node', 
    'hw_manhole', 
    'hw_river_reach_node',
    'hw_junction',
    'hw_outfall'
  ].filter(t => tables.includes(t));
  
  for (const table of nodeTables) {
    try {
      const result = db.exec(`
        SELECT 
          id, 
          COALESCE(x, 0) as x, 
          COALESCE(y, 0) as y,
          COALESCE(ground_level, elevation, 0) as ground_level,
          COALESCE(chamber_floor, invert, 0) as chamber_floor
        FROM ${table}
      `);
      
      if (result.length > 0) {
        for (const row of result[0].values) {
          nodes.push({
            id: String(row[0]),
            x: Number(row[1]) || 0,
            y: Number(row[2]) || 0,
            groundLevel: Number(row[3]) || 0,
            chamberFloor: Number(row[4])
          });
        }
      }
    } catch (e) {
      // Table structure might differ
    }
  }
  
  return nodes;
}

function parseCrossSections(db: Database): ICMCrossSection[] {
  const sections: ICMCrossSection[] = [];
  
  try {
    // Query cross-section line table
    const result = db.exec(`
      SELECT 
        id,
        COALESCE(river_reach_id, '') as river_reach_id,
        COALESCE(chainage, 0) as chainage,
        COALESCE(roughness_manning, 0.035) as n
      FROM hw_cross_section_line
    `);
    
    if (result.length === 0) return [];
    
    for (const row of result[0].values) {
      const sectionId = String(row[0]);
      const points = parseSectionPoints(db, sectionId);
      
      sections.push({
        id: sectionId,
        riverReachId: String(row[1]) || undefined,
        chainage: Number(row[2]) || undefined,
        points,
        manningN: Number(row[3]) || 0.035
      });
    }
  } catch (e) {
    console.warn('Error parsing cross-sections:', e);
  }
  
  return sections;
}

function parseSectionPoints(db: Database, sectionId: string): ICMSectionPoint[] {
  const points: ICMSectionPoint[] = [];
  
  try {
    // Try section point sub-table
    const result = db.exec(`
      SELECT x, z, COALESCE(n, 0) as n
      FROM hw_cross_section_point
      WHERE parent_id = '${sectionId}'
      ORDER BY x
    `);
    
    if (result.length > 0) {
      for (const row of result[0].values) {
        points.push({
          x: Number(row[0]),
          z: Number(row[1]),
          n: Number(row[2]) || undefined
        });
      }
    }
  } catch (e) {
    // Points table might not exist or have different structure
  }
  
  return points;
}

function getMetadata(db: Database, tables: string[]): { modelName?: string; createdDate?: string; version?: string } {
  const metadata: { modelName?: string; createdDate?: string; version?: string } = {};
  
  try {
    if (tables.includes('_model_info') || tables.includes('model_info')) {
      const table = tables.includes('_model_info') ? '_model_info' : 'model_info';
      const result = db.exec(`SELECT * FROM ${table} LIMIT 1`);
      
      if (result.length > 0 && result[0].values.length > 0) {
        const cols = result[0].columns;
        const row = result[0].values[0];
        
        const nameIdx = cols.findIndex(c => c.toLowerCase().includes('name'));
        const dateIdx = cols.findIndex(c => c.toLowerCase().includes('date') || c.toLowerCase().includes('created'));
        const verIdx = cols.findIndex(c => c.toLowerCase().includes('version'));
        
        if (nameIdx >= 0) metadata.modelName = String(row[nameIdx]);
        if (dateIdx >= 0) metadata.createdDate = String(row[dateIdx]);
        if (verIdx >= 0) metadata.version = String(row[verIdx]);
      }
    }
  } catch (e) {
    // Metadata table might not exist
  }
  
  return metadata;
}

/**
 * Get importable items from parsed data
 */
export function getImportableItems(data: ICMParsedData): ICMImportableItem[] {
  const items: ICMImportableItem[] = [];
  
  // Add river reaches
  for (const reach of data.riverReaches) {
    const bedSlope = reach.length > 0 
      ? Math.abs(reach.usInvert - reach.dsInvert) / reach.length 
      : 0.001;
    
    // Get representative section
    const section = reach.sections[0];
    const geometry = section?.points.length 
      ? calculateTrapezoidalApprox(section.points)
      : { bottomWidth: 5, sideSlope: 2 };
    
    items.push({
      id: reach.id,
      name: reach.id,
      type: 'river_reach',
      length: reach.length,
      shape: reach.shape,
      manningN: section?.manningN || 0.035,
      bedSlope,
      bottomWidth: geometry.bottomWidth,
      sideSlope: geometry.sideSlope,
      points: section?.points
    });
  }
  
  // Add conduits
  for (const conduit of data.conduits) {
    const bedSlope = conduit.length > 0 
      ? Math.abs(conduit.usInvert - conduit.dsInvert) / conduit.length 
      : 0.001;
    
    items.push({
      id: conduit.id,
      name: conduit.id,
      type: 'conduit',
      length: conduit.length,
      shape: conduit.shape,
      manningN: conduit.roughnessN,
      bedSlope,
      bottomWidth: conduit.width,
      sideSlope: conduit.shape === 'CIRCULAR' ? 0 : 0 // Pipes don't have side slopes
    });
  }
  
  // Add standalone cross-sections
  for (const section of data.crossSections) {
    if (!section.riverReachId) {
      const geometry = section.points.length 
        ? calculateTrapezoidalApprox(section.points)
        : { bottomWidth: 5, sideSlope: 2 };
      
      items.push({
        id: section.id,
        name: section.id,
        type: 'cross_section',
        shape: 'IRREGULAR',
        manningN: section.manningN,
        bottomWidth: geometry.bottomWidth,
        sideSlope: geometry.sideSlope,
        points: section.points
      });
    }
  }
  
  return items;
}

/**
 * Calculate approximate trapezoidal parameters from irregular section points
 */
function calculateTrapezoidalApprox(points: ICMSectionPoint[]): { bottomWidth: number; sideSlope: number } {
  if (points.length < 3) {
    return { bottomWidth: 5, sideSlope: 2 };
  }
  
  // Find lowest point (invert)
  const minZ = Math.min(...points.map(p => p.z));
  const maxZ = Math.max(...points.map(p => p.z));
  const bankLevel = minZ + (maxZ - minZ) * 0.5; // Assume bank at 50% height
  
  // Find points at invert level (within tolerance)
  const invertTolerance = (maxZ - minZ) * 0.1;
  const bottomPoints = points.filter(p => p.z <= minZ + invertTolerance);
  
  // Estimate bottom width
  const bottomWidth = bottomPoints.length >= 2
    ? Math.abs(bottomPoints[bottomPoints.length - 1].x - bottomPoints[0].x)
    : Math.abs(points[points.length - 1].x - points[0].x) * 0.3;
  
  // Estimate side slope (H:V)
  const leftBank = points.find(p => p.z >= bankLevel);
  const rightBank = [...points].reverse().find(p => p.z >= bankLevel);
  
  if (leftBank && rightBank) {
    const avgHeight = bankLevel - minZ;
    const leftHoriz = Math.abs(leftBank.x - bottomPoints[0]?.x || 0);
    const rightHoriz = Math.abs(rightBank.x - bottomPoints[bottomPoints.length - 1]?.x || 0);
    const avgHoriz = (leftHoriz + rightHoriz) / 2;
    const sideSlope = avgHeight > 0 ? avgHoriz / avgHeight : 2;
    
    return { 
      bottomWidth: Math.max(1, bottomWidth), 
      sideSlope: Math.max(0.5, Math.min(10, sideSlope)) 
    };
  }
  
  return { bottomWidth: Math.max(1, bottomWidth), sideSlope: 2 };
}

/**
 * Validate if a file appears to be an ICM SQLite database
 */
export async function validateICMFile(file: File): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  // Check file extension
  if (!file.name.endsWith('.sqlite') && !file.name.endsWith('.icmm') && !file.name.endsWith('.icmt')) {
    errors.push('File should have .sqlite, .icmm, or .icmt extension');
  }
  
  // Check file size (SQLite files should have some content)
  if (file.size < 1024) {
    errors.push('File appears too small to be a valid database');
  }
  
  // Try to open and check for ICM tables
  try {
    const SQL = await initSQL();
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const db: Database = new SQL.Database(uint8Array);
    
    try {
      const tables = getAvailableTables(db);
      
      // Check for ICM-specific tables
      const icmTables = ['hw_river_reach', 'hw_conduit', 'hw_node', 'hw_cross_section_line', 'hw_manhole'];
      const foundIcmTables = icmTables.filter(t => tables.includes(t));
      
      if (foundIcmTables.length === 0) {
        errors.push('No recognized ICM tables found. Expected tables like hw_river_reach, hw_conduit, etc.');
      }
    } finally {
      db.close();
    }
  } catch (e) {
    errors.push('Could not read file as SQLite database');
  }
  
  return { valid: errors.length === 0, errors };
}

export type { Database };
