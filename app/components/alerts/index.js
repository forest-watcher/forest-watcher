import React, { Component } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableHighlight
} from 'react-native';
import tracker from 'helpers/googleAnalytics';

import I18n from 'locales';
import LeftBtn from 'components/common/header/left-btn';
import Theme from 'config/theme';
import headerStyles from 'components/common/header/styles';
import styles from './styles';

class Alerts extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  constructor() {
    super();

    this.state = {
      currentPosition: null
    };
  }

  componentDidMount() {
    this.getLocation();
    this.props.fetchData();
    tracker.trackScreenView('Alerts');
  }

  onPress = (areaId) => {
    this.props.navigator.push({
      screen: 'ForestWatcher.Map',
      title: 'Area name',
      backButtonTitle: 'Back',
      passProps: {
        features: null,
        center: null,
        geojson: null,
        title: null,
        areaId
      }
    });
  }

  getLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({ currentPosition: position });
      },
      (error) => console.warn(error),
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
  }

  render() {
    const { areas } = this.props;
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {areas && areas.length > 0 && areas.map((data, areaKey) => {
          const area = data.attributes;
          area.id = data.id;

          return (
            <View key={`area-${areaKey}`}>
              <View style={styles.area}>
                <Text style={styles.areaTitle}>{area.name}</Text>
              </View>
              <TouchableHighlight
                onPress={() => this.onPress(area.id)}
                activeOpacity={1}
                underlayColor="transparent"
              >
                <Text style={styles.distanceText}>Go to area</Text>
              </TouchableHighlight>
            </View>
          );
        }
        )}
      </ScrollView>
    );
  }
}

Alerts.propTypes = {
  navigator: React.PropTypes.object.isRequired,
  fetchData: React.PropTypes.func.isRequired,
  areas: React.PropTypes.array,
  geostore: React.PropTypes.object
};

export default Alerts;
