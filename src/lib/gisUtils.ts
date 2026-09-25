/**
 * GIS Polygon Utilities for Agricultural Field Boundaries
 * Pure math/geometry helpers safe for SSR and Client-side execution.
 */

export const calculateDefaultPolygonPoints = (
  centerLat: number,
  centerLng: number,
  ac: number,
  pointsCount: number = 4
): [number, number][] => {
  const radius = 0.0022 * Math.sqrt(Math.max(ac, 1) / 15);
  
  if (pointsCount === 4) {
    return [
      [parseFloat((centerLat + radius).toFixed(5)), parseFloat((centerLng - radius).toFixed(5))],
      [parseFloat((centerLat + radius).toFixed(5)), parseFloat((centerLng + radius).toFixed(5))],
      [parseFloat((centerLat - radius).toFixed(5)), parseFloat((centerLng + radius).toFixed(5))],
      [parseFloat((centerLat - radius).toFixed(5)), parseFloat((centerLng - radius).toFixed(5))],
    ];
  }
  
  // For 6 (Hexagon) or 8 (Octagon) points
  const points: [number, number][] = [];
  const angleStep = (2 * Math.PI) / pointsCount;
  for (let i = 0; i < pointsCount; i++) {
    const angle = i * angleStep - Math.PI / 2; // start from top vertex
    const latOffset = radius * Math.cos(angle);
    const lngOffset = radius * Math.sin(angle) * 1.25; // longitude scale adjustment
    points.push([
      parseFloat((centerLat + latOffset).toFixed(5)),
      parseFloat((centerLng + lngOffset).toFixed(5))
    ]);
  }
  return points;
};
