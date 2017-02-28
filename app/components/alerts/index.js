import React, { Component } from 'react';
import {
  View,
  ScrollView,
  Text
} from 'react-native';
import tracker from 'helpers/googleAnalytics';

import I18n from 'locales';
import AlertsList from 'containers/alerts/list';
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

  onPress = (params) => {
    this.props.navigate('Map', {
      features: params.coordinates,
      center: params.center,
      geojson: params.geojson,
      title: params.areaName
    });
  }

  getLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({ currentPosition: position });
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, timeout: 60000, maximumAge: 50 }
    );
  }

  render() {
    const { areas, geostore } = this.props;
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
              <AlertsList
                areaName={area.name}
                areaGeojson={geostore[area.geostore]}
                onPress={this.onPress} areaId={area.id}
                currentPosition={this.state.currentPosition}
              />
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
  areas: React.PropTypes.array,
  geostore: React.PropTypes.object
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
