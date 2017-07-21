import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import MapView from 'react-native-maps';
import ClusterMarker from 'components/map/clusters/clusterMarker';
import {
  View
} from 'react-native';

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

          let markerColor = styles.gladColor;
          if (marker.attributes.reported) {
            markerColor = styles.reportedColor;
          } else if (datasetSlug === 'viirs') {
            markerColor = styles.viirsColor;
          }
          return marker.properties.point_count !== undefined ? (
            <ClusterMarker id={`cluster-marker-${index}`} key={`cluster-marker-${index}`} marker={marker} zoomTo={this.props.zoomTo} datasetSlug={this.props.datasetSlug} />
          ) : (
            <MapView.Marker
              key={`Alert-marker-${index}`}
              coordinate={coordinates}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={() => this.props.selectAlert(coordinates)}
              zIndex={1}
              draggable={false}
            >
              <View
                style={[styles.markerIcon, markerColor]}
              />
            </MapView.Marker>
          );
        })}
      </View>
    );
  }
}

Clusters.propTypes = {
  markers: PropTypes.array.isRequired,
  datasetSlug: PropTypes.string.isRequired,
  selectAlert: PropTypes.func.isRequired,
  zoomTo: PropTypes.func.isRequired
};

export default Clusters;
