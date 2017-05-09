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
    this.props.navigate('Map', {
      features: null,
      center: null,
      geojson: null,
      title: null,
      areaId
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
  navigate: React.PropTypes.func.isRequired,
  fetchData: React.PropTypes.func.isRequired,
  areas: React.PropTypes.array
};

Alerts.navigationOptions = {
  header: ({ goBack }) => ({
    left: <LeftBtn goBack={goBack} />,
    tintColor: Theme.colors.color1,
    style: headerStyles.style,
    titleStyle: headerStyles.titleStyle,
    title: I18n.t('alerts.title')
  })
};

export default Alerts;
