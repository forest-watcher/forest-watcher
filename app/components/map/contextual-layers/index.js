// @flow
import type { MapContent, LayersCacheStatus } from 'types/layers.types';

import React, { Component } from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';

import { GFW_CONTEXTUAL_LAYERS_METADATA } from 'config/constants';

import { toFileUri } from 'helpers/fileURI';
import { pathForLayer } from 'helpers/layer-store/layerFilePaths';
import { vectorTileURLForMapboxURL } from 'helpers/mapbox';

import GFWVectorLayer from '../gfw-vector-layer';
import { mapboxStyles } from './styles';

type Props = {
  downloadedLayerCache: { [id: string]: LayersCacheStatus },
  featureId: string,
  importedContextualLayers: Array<MapContent>
};

// Renders all active imported contextual layers in settings
export default class ContextualLayers extends Component<Props> {
  renderGFWImportedContextualLayer = (layer: MapContent) => {
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
            <MapboxGL.RasterLayer id={'imported_layer_layer_' + layer.id} sourceId={sourceID} />
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
        />
        <MapboxGL.LineLayer id={'imported_layer_line_' + layer.id} style={mapboxStyles.geoJsonStyleSpec} />
        <MapboxGL.FillLayer
          filter={['match', ['geometry-type'], ['LineString', 'MultiLineString'], false, true]}
          id={'imported_layer_fill_' + layer.id}
          style={mapboxStyles.geoJsonStyleSpec}
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
