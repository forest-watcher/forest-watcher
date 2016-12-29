import React from 'react';
import {
  View
} from 'react-native';
import MapView from 'react-native-maps';
import styles from './styles';

function Map() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={MapView.PROVIDER_GOOGLE}
        region={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121
        }}
      />
    </View>
  );
}

export default Map;
