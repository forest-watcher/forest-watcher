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
        {this.props.markers.map((marker, index) => (
          marker.properties.point_count !== undefined ? (
            <ClusterMarker key={index} marker={marker} zoomTo={this.props.zoomTo} datasetSlug={this.props.datasetSlug} />
          ) : (
            <MapView.Marker
              key={index}
              coordinate={{
                latitude: marker.geometry.coordinates[1],
                longitude: marker.geometry.coordinates[0]
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={this.props.selectAlert}
              zIndex={1}
              draggable={false}
              pointerEvents="none"
            >
              <View
                style={[
                  styles.markerIcon,
                  this.props.datasetSlug === 'viirs' ? styles.viirsColor : styles.gladColor
                ]}
              />
            </MapView.Marker>
          )
        ))}
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
