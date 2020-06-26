// @flow
import type { Area, Dataset } from 'types/areas.types';
import { polygon } from '@turf/helpers';
const geojsonArea = require('@mapbox/geojson-area');

export function getSelectedArea(areas: Array<Area>, selectedId: string): ?Area {
  if (!selectedId || (!areas || !areas.length)) {
    return null;
  }
  return areas.find(a => a.id === selectedId);
}

export function activeDataset(area: Area): ?Dataset {
  if (!area.datasets) {
    return null;
  }
  const enabledDataset = area.datasets.find(Boolean);
  return enabledDataset;
}

// Returns the area size in square meters.
export const getAreaSize = (area: Area): number => {
  const polygon2 = polygon(area.geojson.coordinates);
  const areaSize = geojsonArea.geometry(polygon2?.geometry);

  return areaSize;
};
