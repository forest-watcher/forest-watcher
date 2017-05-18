export function activeDataset(area) {
  const enabledDataset = area.datasets.find((d) => (d.value === true));
  if (enabledDataset !== undefined) { return enabledDataset; }
  return false;
}

export function enabledDatasetName(area) {
  if (!area.datasets) return false;
  const enabledDataset = activeDataset(area);
  return enabledDataset !== false ? enabledDataset.name : false;
}

export default function enabledDatasetSlug(area) {
  if (!area.datasets) return false;
  const enabledDataset = activeDataset(area);
  return enabledDataset !== false ? enabledDataset.slug : false;
}
