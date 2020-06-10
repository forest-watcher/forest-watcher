// @flow

import type { LayerFile } from 'types/sharing.types';

export function isCustomBasemap(layerFile: LayerFile) {
  return layerFile.type === 'basemap';
}

export function isCustomContextualLayer(layerFile: LayerFile) {
  return layerFile.type === 'contextual_layer' && !!layerFile.subFiles?.length;
}

export function isGfwContextualLayer(layerFile: LayerFile) {
  return layerFile.type === 'contextual_layer' && !layerFile.subFiles;
}
