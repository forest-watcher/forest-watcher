// @flow

import type { LayerFile } from 'types/sharing.types';
import type { MapContent } from 'types/layers.types';

export function isCustomBasemapFile(layerFile: LayerFile) {
  return layerFile.type === 'basemap';
}

export function isCustomContextualLayerFile(layerFile: LayerFile) {
  return layerFile.type === 'contextual_layer' && !!layerFile.subFiles?.length;
}

export function isCustomContextualLayer(layer: MapContent) {
  return layer.isCustom;
}

export function isGfwContextualLayerFile(layerFile: LayerFile) {
  return layerFile.type === 'contextual_layer' && !layerFile.subFiles;
}

export function isGfwContextualLayer(layer: MapContent) {
  return !layer.isCustom;
}
