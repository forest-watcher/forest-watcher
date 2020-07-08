// @flow
import type { Layer, LayersCacheStatus } from 'types/layers.types';

import React, { Component } from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';

import { GFW_CONTEXTUAL_LAYERS_METADATA, MAP_LAYER_INDEXES } from 'config/constants';

import { toFileUri } from 'helpers/fileURI';
import { pathForLayer } from 'helpers/layer-store/layerFilePaths';
import { vectorTileURLForMapboxURL } from 'helpers/mapbox';

import GFWVectorLayer from '../gfw-vector-layer';
import { mapboxStyles } from './styles';

type Props = {
  downloadedLayerCache: { [id: string]: LayersCacheStatus },
  featureId: string,
  importedContextualLayers: Array<Layer>
};

// Renders all active imported contextual layers in settings
export default class ContextualLayers extends Component<Props> {
  renderGFWImportedContextualLayer = (layer: Layer) => {
    const layerMetadata = GFW_CONTEXTUAL_LAYERS_METADATA[layer.id];
    if (!layerMetadata) {
      return null;
    }

    const layerURL = vectorTileURLForMapboxURL(layer.url) ?? layer.url;
    const tileURLTemplates = layerURL.startsWith('mapbox://') ? null : [layerURL];

    if (!layerURL.startsWith('mapbox://') && this.props.featureId) {
      const layerDownloadProgress = this.props.downloadedLayerCache[layer.id]?.[this.props.featureId];

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
            <MapboxGL.RasterLayer
              id={'imported_layer_layer_' + layer.id}
              sourceId={sourceID}
              layerIndex={MAP_LAYER_INDEXES.contextualLayer}
            />
          </MapboxGL.RasterSource>
        );
    }
  };

  renderCustomImportedContextualLayer = (layer: ContextualLayer) => {
    return (
      <MapboxGL.ShapeSource key={layer.id} id={'imported_layer_' + layer.id} url={toFileUri(layer.url)}>
        <MapboxGL.SymbolLayer
          filter={['match', ['geometry-type'], ['Point', 'MultiPoint'], true, false]}
          id={'imported_layer_symbol_' + layer.id}
          sourceID={'imported_layer_' + layer.id}
          style={mapboxStyles.icon}
          layerIndex={MAP_LAYER_INDEXES.contextualLayer}
        />
        <MapboxGL.LineLayer
          id={'imported_layer_line_' + layer.id}
          style={mapboxStyles.geoJsonStyleSpec}
          layerIndex={MAP_LAYER_INDEXES.contextualLayer}
        />
        <MapboxGL.FillLayer
          filter={['match', ['geometry-type'], ['LineString', 'MultiLineString'], false, true]}
          id={'imported_layer_fill_' + layer.id}
          style={mapboxStyles.geoJsonStyleSpec}
          layerIndex={MAP_LAYER_INDEXES.contextualLayer}
        />
      </MapboxGL.ShapeSource>
    );
  };

  render() {
    const layerFiles = this.props.importedContextualLayers;

    return (
      <React.Fragment>
        {layerFiles.map(layerFile => {
          return !layerFile.isCustom
            ? this.renderGFWImportedContextualLayer(layerFile)
            : this.renderCustomImportedContextualLayer(layerFile);
        })}
      </React.Fragment>
    );
  }
}
