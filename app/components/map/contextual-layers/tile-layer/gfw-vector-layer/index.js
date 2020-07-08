// @flow
import React, { Component } from 'react';

import type { VectorMapLayer } from 'types/layers.types';
import MapboxGL from '@react-native-mapbox-gl/maps';

import _ from 'lodash';
import { MAP_LAYER_INDEXES } from 'config/constants';

type Props = {
  id: string,
  layer: VectorMapLayer,
  sourceID: string
};

type PaintStyle = { [string]: number | string };

class GFWVectorLayer extends Component<Props, {}> {
  convertPaintToCamelCase = (paint: PaintStyle): PaintStyle => {
    return _.reduce(
      paint,
      function(newDict, val, oldKey) {
        let keyComponents = oldKey.split('-');
        keyComponents = keyComponents.map((component, index) => {
          return index === 0 ? component : component.charAt(0).toUpperCase() + component.slice(1);
        });
        const newKey = keyComponents.join('');
        newDict[newKey] = val;
        return newDict;
      },
      {}
    );
  };

  render() {
    let MapboxComponent;
    switch (this.props.layer.type) {
      case 'fill':
        MapboxComponent = MapboxGL.FillLayer;
        break;
      case 'line':
        MapboxComponent = MapboxGL.LineLayer;
        break;
      default:
        return null;
    }

    return MapboxComponent ? (
      <MapboxComponent
        id={this.props.id}
        sourceID={this.props.sourceID}
        sourceLayerID={this.props.layer['source-layer']}
        filter={this.props.layer.filter}
        style={this.convertPaintToCamelCase(this.props.layer.paint)}
        layerIndex={MAP_LAYER_INDEXES.contextualLayer}
      />
    ) : null;
  }
}

export default GFWVectorLayer;
