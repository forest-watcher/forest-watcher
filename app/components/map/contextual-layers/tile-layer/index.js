// @flow
import type { ContextualLayerRenderSpec, Layer, LayersCacheStatus } from 'types/layers.types';

import React, { Component } from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';

import { GFW_CONTEXTUAL_LAYERS_METADATA } from 'config/constants';

import { pathForLayer } from 'helpers/layer-store/layerFilePaths';
import { vectorTileURLForMapboxURL } from 'helpers/mapbox';

import GFWVectorLayer from './gfw-vector-layer';

type Props = {
  +featureId: string,
  +isOfflineMode: boolean,
  +layer: Layer,
  +layerCache: LayersCacheStatus
};

// Renders all active imported contextual layers in settings
export default class TileContextualLayer extends Component<Props> {
  render = () => {
    const { featureId, layer, layerCache, isOfflineMode } = this.props;

    const layerMetadata: ContextualLayerRenderSpec = GFW_CONTEXTUAL_LAYERS_METADATA[layer.id] ?? {
      isShareable: false,
      tileFormat: 'raster'
    };

    const tileURLTemplates = [];

    // Find and append the remote tile URL if we're not offline
    if (!isOfflineMode) {
      const layerURL = (layer.url ? vectorTileURLForMapboxURL(layer.url) : null) ?? layer.url;
      if (layerURL) {
        tileURLTemplates.push(layerURL);
      }
    }

    // Find and append the local tile path if there is one
    if (featureId) {
      const layerDownloadProgress = layerCache[featureId];

      if (layerDownloadProgress?.completed && !layerDownloadProgress?.error) {
        tileURLTemplates.push(`file:/${pathForLayer('contextual_layer', layer.id)}/{z}x{x}x{y}`);
      }
    }

    if (tileURLTemplates.length === 0) {
      return null;
    }

    const sourceID = 'imported_layer_' + layer.id;
    switch (layerMetadata.tileFormat) {
      case 'vector':
        return (
          <MapboxGL.VectorSource
            id={sourceID}
            maxZoomLevel={layerMetadata.maxZoom}
            minZoomLevel={layerMetadata.minZoom}
            tileUrlTemplates={tileURLTemplates}
          >
            {/* $FlowFixMe */}
            {layerMetadata.vectorMapLayers?.map((vectorLayer, index) => {
              return (
                <GFWVectorLayer
                  sourceID={sourceID}
                  id={'imported_layer_layer_' + layer.id + '_' + index}
                  key={index}
                  layer={vectorLayer}
                />
              );
            })}
          </MapboxGL.VectorSource>
        );
      default:
        return (
          <MapboxGL.RasterSource
            id={sourceID}
            maxZoomLevel={layerMetadata.maxZoom}
            minZoomLevel={layerMetadata.minZoom}
            tileUrlTemplates={tileURLTemplates}
          >
            <MapboxGL.RasterLayer id={'imported_layer_layer_' + layer.id} sourceId={sourceID} />
          </MapboxGL.RasterSource>
        );
    }
  };
}
