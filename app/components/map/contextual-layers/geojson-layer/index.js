// @flow
import type { Layer } from 'types/layers.types';

import React, { Component } from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';

import { mapboxStyles } from './styles';
import queryLayerFiles from 'helpers/layer-store/queryLayerFiles';
import { pathForLayerFile } from 'helpers/layer-store/layerFilePaths';
import { toFileUri } from 'helpers/fileURI';
import { MAP_LAYER_INDEXES } from 'config/constants';

type Props = {
  +layer: Layer
};

type State = {
  +geoJsonUri: ?string
};

export default class GeoJSONContextualLayer extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      geoJsonUri: null
    };
  }

  componentDidMount() {
    this.queryFilesForLayer(this.props.layer);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.layer.id !== prevProps.layer.id) {
      this.queryFilesForLayer(this.props.layer);
    }
  }

  /**
   * Query the layer store for any geojson files relating to the specified layer
   */
  queryFilesForLayer = async (layer: ContextualLayer) => {
    const layerFiles = await queryLayerFiles('contextual_layer', {
      whitelist: [this.props.layer.id],
      blacklist: []
    });
    const layerFilesWithGeoJson = layerFiles.filter(layerFile =>
      (layerFile.subFiles ?? []).some(subfile => subfile.endsWith('.geojson'))
    );

    if (layerFilesWithGeoJson.length === 0) {
      console.warn('3SC', `Layer with ID ${layer.id} does not have any GeoJSON files in the layer store`);
      this.setState({
        geoJsonUri: null
      });
    } else {
      if (layerFilesWithGeoJson.length > 1) {
        console.warn(
          '3SC',
          `Layer with ID ${layer.id} has multiple GeoJSON files in the layer store, but we will only display one`
        );
      }

      const firstLayerFile = layerFilesWithGeoJson[0];
      const path = pathForLayerFile(firstLayerFile);
      const geoJsonSubFile = (firstLayerFile.subFiles ?? []).find(subfile => subfile.endsWith('.geojson'));
      const geoJsonUri = geoJsonSubFile ? `${path}/${geoJsonSubFile}` : null;

      this.setState({
        geoJsonUri: geoJsonUri
      });
    }
  };

  render() {
    const { layer } = this.props;
    const { geoJsonUri } = this.state;

    if (!geoJsonUri) {
      return null;
    }

    return (
      <MapboxGL.ShapeSource id={'imported_layer_' + layer.id} url={toFileUri(geoJsonUri)}>
        <MapboxGL.SymbolLayer
          filter={['match', ['geometry-type'], ['Point', 'MultiPoint'], true, false]}
          id={'imported_layer_symbol_' + layer.id}
          sourceID={'imported_layer_' + layer.id}
          style={mapboxStyles.icon}
          layerIndex={MAP_LAYER_INDEXES.contextualLayer}
        />
        <MapboxGL.LineLayer
          id={'imported_layer_line_' + layer.id}
          sourceID={'imported_layer_' + layer.id}
          style={mapboxStyles.geoJsonStyleSpec}
          layerIndex={MAP_LAYER_INDEXES.contextualLayer}
        />
        <MapboxGL.FillLayer
          filter={['match', ['geometry-type'], ['LineString', 'MultiLineString'], false, true]}
          id={'imported_layer_fill_' + layer.id}
          sourceID={'imported_layer_' + layer.id}
          style={mapboxStyles.geoJsonStyleSpec}
          layerIndex={MAP_LAYER_INDEXES.contextualLayer}
        />
      </MapboxGL.ShapeSource>
    );
  }
}
