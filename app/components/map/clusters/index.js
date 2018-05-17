// @flow

import React, { PureComponent } from 'react';
import MapView from 'react-native-maps';
import ClusterMarker from 'components/map/clusters/clusterMarker';
import { View } from 'react-native';
import CONSTANTS from 'config/constants';

import styles from './styles';

type Coordinates = {
  longitude: number,
  latitude: number
};

type Marker = {
  geometry: [number, number]
}

type Props = {
  markers: Array<Marker>,
  reportedAlerts: Array<string>,
  datasetSlug: string,
  selectAlert: Coordinates => void,
  zoomTo: Coordinates => void,
  markerSize: number
};

class Clusters extends PureComponent<Props> {
  markerAnchor = { x: 0.5, y: 0.5 };

  render() {
    if (!this.props.markers) return null;
    return (
      <View>
        {this.props.markers.map((marker, index) => {
          const { datasetSlug } = this.props;
          const coordinates = {
            latitude: marker.geometry.coordinates[1],
            longitude: marker.geometry.coordinates[0]
          };

          if (marker.properties.point_count !== undefined) {
            return (
              <ClusterMarker
                id={`cluster-marker-${index}`}
                key={`cluster-marker-${index}`}
                marker={marker}
                zoomTo={this.props.zoomTo}
                datasetSlug={this.props.datasetSlug}
              />
            );
          }
          let markerColor = datasetSlug === CONSTANTS.datasets.GLAD ? styles.gladColor : styles.viirsColor;
          const id = `${marker.geometry.coordinates[0]}${marker.geometry.coordinates[1]}`;
          if (this.props.reportedAlerts.includes(id)) {
            markerColor = styles.reportedColor;
          }
          return (
            <MapView.Marker
              key={index}
              coordinate={coordinates}
              anchor={this.markerAnchor}
              onPress={() => this.props.selectAlert(coordinates)}
              zIndex={1}
              draggable={false}
            >
              <View style={[this.props.markerSize, markerColor]} />
            </MapView.Marker>
          );
        })}
      </View>
    );
  }
}

export default Clusters;
