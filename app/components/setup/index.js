import React, { Component } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  InteractionManager,
  Dimensions
} from 'react-native';

import MapView from 'react-native-maps';
import styles from './styles';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 4.931654;
const LONGITUDE = -64.958867;
const LATITUDE_DELTA = 40;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

function renderLoading() {
  return (
    <View style={[styles.container, styles.loader]}>
      <ActivityIndicator
        style={{ height: 80 }}
        size={'large'}
      />
    </View>
  );
}

class Setup extends Component {
  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      if (!this.props.user) {
        this.props.getUser();
      }
    });
  }

  render() {
    console.log(this.props.user);
    return (
      this.props.user
      ?
        <View style={styles.container}>
          <View style={styles.content}>
            <Text>Hi {this.props.user.fullName}!</Text>
            <Text>First, select your area of interest</Text>
          </View>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              provider={MapView.PROVIDER_GOOGLE}
              initialRegion={{
                latitude: LATITUDE,
                longitude: LONGITUDE,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA
              }}
            />
          </View>
        </View>
      :
        renderLoading()
    );
  }
}

Setup.propTypes = {
  user: React.PropTypes.any,
  getUser: React.PropTypes.func.isRequired
};

export default Setup;
