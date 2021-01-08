// @flow

import type { Layer } from 'types/layers.types';

import i18n from 'i18next';

/**
 * Sorts an array of GFW contextual layers (from either API)
 *
 * The sort order is slightly complex and is as follows:
 * 1. Protected Areas
 * 2. TCL in descending date order
 * 3. All other GFW areas in alphabetical order
 *
 * @param {Array} layers The array of layers to sort
 */
export function sortGFWContextualLayers(layers: Array<Layer>): Array<Layer> {
  // Copy layers array, we will remove from here as we sort...
  const allLayers = [...layers];
  let sortedLayers = [];

  // Move protected area layer to the top
  const protectedAreasIndex = allLayers.findIndex((layer: Layer) => {
    return layer.name === 'layers.protectedAreas' || layer.id === '597b6b899c157500128c912b';
  });

  if (protectedAreasIndex !== -1) {
    sortedLayers.push(allLayers[protectedAreasIndex]);
    allLayers.splice(protectedAreasIndex, 1);
  }

  // Find all tree cover loss layers
  const nonTreeCoverLossLayers = [];
  const treeCoverLossLayers = allLayers.filter((layer: Layer) => {
    const isTreeCoverLossLayer =
      layer.name
        ?.toLowerCase?.()
        .replace?.(/\s/g, '')
        .includes?.('treecoverloss') === true;
    // If it's a tree cover loss layer, remove it from `allLayers`
    if (!isTreeCoverLossLayer) {
      nonTreeCoverLossLayers.push(layer);
    }
    return isTreeCoverLossLayer;
  });
  // Can't just sort alphabetically directly because one layer
  // does not have an i18n key, rather a readable name. So we will
  // regex the date out of the names...
  treeCoverLossLayers.sort((layerA, layerB) => {
    const yearMatchesA = layerA.name?.match?.(/\d{4}/g);
    const yearMatchesB = layerB.name?.match?.(/\d{4}/g);
    if (yearMatchesA.length > 0 && yearMatchesB.length > 0) {
      const yearA = yearMatchesA[0];
      const yearB = yearMatchesB[0];
      return yearA < yearB ? 1 : yearA > yearB ? -1 : 0;
    } else {
      // Do nothing!
      return 0;
    }
  });

  sortedLayers = sortedLayers.concat(treeCoverLossLayers);

  // Sort remaining layers alphabetically by their human-readable
  // name (in case we have any left over which need localising)
  nonTreeCoverLossLayers.sort((layerA, layerB) => {
    const nameA = i18n.t(layerA.name);
    const nameB = i18n.t(layerB.name);
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  });

  sortedLayers = sortedLayers.concat(nonTreeCoverLossLayers);

  return sortedLayers;
}