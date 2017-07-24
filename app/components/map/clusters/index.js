import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import MapView from 'react-native-maps';
import ClusterMarker from 'components/map/clusters/clusterMarker';
import { View } from 'react-native';

import styles from './styles';

class Clusters extends PureComponent {
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
          let markerColor = styles.gladColor;
          const id = `${marker.geometry.coordinates[0]}${marker.geometry.coordinates[1]}`;
          if (this.props.reportedAlerts.includes(id)) {
            markerColor = styles.reportedColor;
          } else if (datasetSlug === 'viirs') {
            markerColor = styles.viirsColor;
          }
          return (
            <MapView.Marker
              key={index}
              coordinate={coordinates}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={() => this.props.selectAlert(coordinates)}
              zIndex={1}
              draggable={false}
            >
              <View style={[styles.markerIcon, markerColor]} />
            </MapView.Marker>
          );
        })}
      </View>
    );
  }
}

Clusters.propTypes = {
  markers: PropTypes.array.isRequired,
  reportedAlerts: PropTypes.array.isRequired,
  datasetSlug: PropTypes.string.isRequired,
  selectAlert: PropTypes.func.isRequired,
  zoomTo: PropTypes.func.isRequired
};

export default Clusters;
