import React, { Component } from 'react';
import {
  View,
  InteractionManager,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import MapView from 'react-native-maps';
import Theme from 'config/theme';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = -10.55449;
const LONGITUDE = -54.242900;
const LATITUDE_DELTA = 0.025;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

function renderLoading() {
  return (
    <View style={[styles.container, styles.loader]}>
      <ActivityIndicator
        color={Theme.colors.color1}
        style={{ height: 80 }}
        size="large"
      />
    </View>
  );
}

class Map extends Component {
  constructor(props) {
    super(props);

    this.state = {
      renderMap: false
    };
  }

  componentDidMount() {
    tracker.trackScreenView('Map');
    InteractionManager.runAfterInteractions(() => {
      if (!this.state.renderMap) {
        this.setState({
          renderMap: true
        });
      }
    });
  }

  render() {
    return (
      this.state.renderMap
      ?
        <View style={styles.container}>
          <MapView
            style={styles.map}
            provider={MapView.PROVIDER_GOOGLE}
            mapType="hybrid"
            rotateEnabled={false}
            initialRegion={{
              latitude: LATITUDE,
              longitude: LONGITUDE,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA
            }}
          />
        </View>
      :
        renderLoading()
    );
  }


}

export default Map;
