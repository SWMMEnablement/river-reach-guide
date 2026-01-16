import { useMemo } from 'react';
import { ChannelGeometry, HydraulicParams, HydraulicResults } from './types';

export const useHydraulicCalculations = (
  geometry: ChannelGeometry,
  params: HydraulicParams,
  showFloodplain: boolean
): HydraulicResults => {
  return useMemo(() => {
    const { bottomWidth, bankSlope, channelDepth } = geometry;
    const { manningN, manningNFloodplain, bedSlope, waterLevel } = params;

    // Water depth from channel bed
    const waterDepth = Math.max(0, Math.min(waterLevel, channelDepth + 2));
    
    if (waterDepth <= 0) {
      return {
        area: 0,
        wettedPerimeter: 0,
        hydraulicRadius: 0,
        topWidth: 0,
        velocity: 0,
        discharge: 0,
        froudeNumber: 0,
        conveyance: 0,
      };
    }

    let area = 0;
    let wettedPerimeter = 0;
    let topWidth = 0;
    let conveyance = 0;

    // Main channel (trapezoidal)
    const mainChannelDepth = Math.min(waterDepth, channelDepth);
    if (mainChannelDepth > 0) {
      // Trapezoidal area: A = (b + s*d) * d
      const mainArea = (bottomWidth + bankSlope * mainChannelDepth) * mainChannelDepth;
      area += mainArea;

      // Wetted perimeter: P = b + 2*d*sqrt(1 + s^2)
      const sideLength = mainChannelDepth * Math.sqrt(1 + bankSlope * bankSlope);
      const mainWettedP = bottomWidth + 2 * sideLength;
      wettedPerimeter += mainWettedP;

      // Top width of main channel
      topWidth = bottomWidth + 2 * bankSlope * mainChannelDepth;

      // Main channel conveyance
      const mainR = mainArea / mainWettedP;
      const mainK = (1 / manningN) * mainArea * Math.pow(mainR, 2/3);
      conveyance += mainK;
    }

    // Floodplain (if water above bank)
    if (showFloodplain && waterDepth > channelDepth && geometry.floodplainWidth > 0) {
      const floodDepth = waterDepth - channelDepth;
      
      // Left floodplain (rectangular approximation)
      const fpArea = geometry.floodplainWidth * floodDepth;
      area += 2 * fpArea; // Both sides
      
      const fpWettedP = geometry.floodplainWidth + floodDepth;
      wettedPerimeter += 2 * fpWettedP;
      
      topWidth += 2 * geometry.floodplainWidth;

      // Floodplain conveyance (both sides)
      const fpR = fpArea / fpWettedP;
      const fpK = (1 / manningNFloodplain) * fpArea * Math.pow(fpR, 2/3);
      conveyance += 2 * fpK;
    }

    const hydraulicRadius = wettedPerimeter > 0 ? area / wettedPerimeter : 0;
    
    // Manning's equation: Q = K * S^0.5
    const discharge = conveyance * Math.sqrt(bedSlope);
    const velocity = area > 0 ? discharge / area : 0;
    
    // Froude number: Fr = V / sqrt(g * D)
    const g = 9.81;
    const hydraulicDepth = topWidth > 0 ? area / topWidth : 0;
    const froudeNumber = hydraulicDepth > 0 ? velocity / Math.sqrt(g * hydraulicDepth) : 0;

    return {
      area,
      wettedPerimeter,
      hydraulicRadius,
      topWidth,
      velocity,
      discharge,
      froudeNumber,
      conveyance,
    };
  }, [geometry, params, showFloodplain]);
};
