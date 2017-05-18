export function dataset(area) {
  const enabledDataset = area.datasets.find((d) => (d.value === true));
  if (enabledDataset !== undefined) { return enabledDataset; }
  return false;
}

export function enabledDatasetName(area) {
  const enabledDataset = dataset(area);
  return enabledDataset !== false ? enabledDataset.name : false;
}

export default function enabledDatasetSlug(area) {
  const enabledDataset = dataset(area);
  return enabledDataset !== false ? enabledDataset.slug : false;
}
