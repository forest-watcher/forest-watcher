import React from 'react';
import MapView from 'react-native-maps';
import ClusterMarker from 'components/map/clusters/clusterMarker';
import {
  View
} from 'react-native';

const alertGlad = require('assets/alert-glad.png');

function Clusters(props) {
  return (
    <View>
      {props.markers.map((marker, index) => (
        marker.properties.point_count !== undefined ? (
          <ClusterMarker key={index} marker={marker} zoomTo={props.zoomTo} />
        ) : (
          <MapView.Marker
            key={index}
            coordinate={{
              latitude: marker.geometry.coordinates[1],
              longitude: marker.geometry.coordinates[0]
            }}
            image={alertGlad}
            onPress={(e) => props.selectAlert(e.nativeEvent.coordinate)}
            zIndex={1}
            anchor={{ x: 0.5, y: 0.5 }}
            pointerEvents={'none'}
          />
        )
      ))}
    </View>
  );
}

Clusters.propTypes = {
  markers: React.PropTypes.array,
  zoomTo: React.PropTypes.func
};

export default Clusters;
