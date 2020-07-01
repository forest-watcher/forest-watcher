// @flow
import type { ContextualLayer, LayersCacheStatus } from 'types/layers.types';

import React, { Component } from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';

import { GFW_CONTEXTUAL_LAYERS_METADATA } from 'config/constants';

import { pathForLayer } from 'helpers/layer-store/layerFilePaths';
import { vectorTileURLForMapboxURL } from 'helpers/mapbox';

import GFWVectorLayer from './gfw-vector-layer';

type Props = {
  +featureId: string,
  +layer: ContextualLayer,
  +layerCache: LayersCacheStatus
};

// Renders all active imported contextual layers in settings
export default class TileContextualLayer extends Component<Props> {
  render = () => {
    const { featureId, layer, layerCache } = this.props;

    const layerMetadata = GFW_CONTEXTUAL_LAYERS_METADATA[layer.id];
    if (!layerMetadata) {
      return null;
    }

    const layerURL = vectorTileURLForMapboxURL(layer.url) ?? layer.url;
    const tileURLTemplates = layerURL.startsWith('mapbox://') ? null : [layerURL];

    if (!layerURL.startsWith('mapbox://') && featureId) {
      const layerDownloadProgress = layerCache[featureId];

      if (layerDownloadProgress?.completed && !layerDownloadProgress?.error) {
        // $FlowFixMe
        tileURLTemplates?.push(`file:/${pathForLayer('contextual_layer', layer.id)}/{z}x{x}x{y}`);
      }
    }

    const sourceID = 'imported_layer_' + layer.id;
    switch (layerMetadata.tileFormat) {
      case 'vector':
        return (
          <MapboxGL.VectorSource
            key={layer.id}
            id={sourceID}
            maxZoomLevel={layerMetadata.maxZoom}
            minZoomLevel={layerMetadata.minZoom}
            url={layerURL.startsWith('mapbox://') ? layerURL : null}
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
            key={layer.id}
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
