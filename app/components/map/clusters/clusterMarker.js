import React from 'react';
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
      anchor={{ x: 0.5, y: 0.5 }}
      pointerEvents={'none'}
      onPress={(event) => props.zoomTo(event.nativeEvent.coordinate)}
    >
      <View style={styles.container}>
        <View style={styles.bubble}>
          <Text style={styles.number}>{props.marker.properties.point_count}</Text>
        </View>
      </View>
    </MapView.Marker>

  );
}

ClusterMarker.propTypes = {
  marker: React.PropTypes.object.isRequired,
  zoomTo: React.PropTypes.func.isRequired
};

export default ClusterMarker;
