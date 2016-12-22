/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Map from 'react-native-maps';

export default class ForestWatcher extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Map
          style={styles.map}
          provider={Map.PROVIDER_GOOGLE}
          region={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
});

AppRegistry.registerComponent('ForestWatcher', () => ForestWatcher);
