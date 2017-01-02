import React, { Component } from 'react';
import {
  View,
  InteractionManager,
  ActivityIndicator,
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

class Map extends Component {
  constructor(props) {
    super(props);

    this.state = {
      renderMap: false
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      if (!this.state.renderMap) {
        this.setState({
          renderMap: true
        });
      }
    });
  }

  renderLoading() {
    return (
      <View style={[styles.container, styles.loader]}>
        <ActivityIndicator
          style={{ height: 80 }}
          size="large"
        />
      </View>
    );
  }

  render() {
    return (
      this.state.renderMap
      ?
        <View style={styles.container}>
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
      :
        this.renderLoading()
    );
  }


}

export default Map;
