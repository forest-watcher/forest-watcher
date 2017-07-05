import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text
} from 'react-native';
import MapView from 'react-native-maps';
import styles from './styles';

function ClusterMarker(props) {
  return (
    <MapView.Marker
      coordinate={{
        latitude: props.marker.geometry.coordinates[1],
        longitude: props.marker.geometry.coordinates[0]
      }}
      zIndex={1}
      pointerEvents={'none'}
      onPress={(event) => props.zoomTo(event.nativeEvent.coordinate)}
    >
      <View style={styles.container}>
        <View style={props.datasetSlug === 'viirs' ? styles.bubbleViirs : styles.bubbleGlad}>
          <Text style={styles.number}>{props.marker.properties.point_count}</Text>
        </View>
      </View>
    </MapView.Marker>

  );
}

ClusterMarker.propTypes = {
  marker: PropTypes.object.isRequired,
  zoomTo: PropTypes.func.isRequired,
  datasetSlug: PropTypes.string.isRequired
};

export default ClusterMarker;
