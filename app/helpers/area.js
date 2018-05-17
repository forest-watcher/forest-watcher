// @flow
import type { Area, Dataset } from 'types/areas.types';

export function activeDataset(area: Area): ?Dataset {
  if (area.datasets === undefined) return null;
  const enabledDataset = area.datasets.find((d) => (d.active === true));
  if (typeof enabledDataset !== 'undefined') {
    return { ...enabledDataset };
  }
  return null;
}

export function enabledDatasetName(area: Area): ?string {
  if (!area.datasets) return null;
  const enabledDataset = activeDataset(area);
  return enabledDataset ? enabledDataset.name : null;
}

