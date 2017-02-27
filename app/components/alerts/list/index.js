import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  Image,
  ScrollView
} from 'react-native';

import I18n from 'locales';
import GeoPoint from 'geopoint';
import ImageCache from 'components/common/image-cache';
import styles from './styles';

const placeholderImage = require('assets/alert_list_preloader_row.png');

function getPlaceholder() {
  return (
    <View style={styles.placeholder}>
      <Image style={styles.placeholderImage} source={placeholderImage} />
      <Text style={styles.loadingText}>{I18n.t('alerts.downloadingAlerts')}</Text>
    </View>
  );
}

function getNoDataView() {
  return (
    <View style={[styles.placeholder, styles.center]}>
      <Text style={styles.loadingText}>{I18n.t('alerts.noAlerts')}</Text>
    </View>
  );
}

class AlertsList extends Component {
  componentDidMount() {
    // Temp
    setTimeout(() => {
      this.checkData();
    }, 200);
  }

  getAlertsView() {
    const { alerts } = this.props;

    return (
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.alerts}
        horizontal
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        alwaysBounceVertical={false}
      >
        <View style={styles.content}>
          {Object.keys(alerts).map((key, index) => {
            const alert = alerts[key];
            alert.areaName = this.props.areaName;
            let distance = I18n.t('commonText.notAvailable');

            if (this.props.currentPosition) {
              const geoPoint = new GeoPoint(alert.center.lat, alert.center.lon);
              const currentPoint = new GeoPoint(this.props.currentPosition.coords.latitude, this.props.currentPosition.coords.longitude);
              distance = `${Math.round(currentPoint.distanceTo(geoPoint, true))}${I18n.t('commonText.kmAway')}`; // in Kilometers
            }

            return (
              <TouchableHighlight
                key={`alert-${index}`}
                onPress={() => this.props.onPress(alert)}
                activeOpacity={1}
                underlayColor="transparent"
              >
                <View style={styles.item}>
                  <View style={styles.image}>
                    <ImageCache
                      style={{ width: 128, height: 128 }}
                      source={{
                        uri: alert.url
                      }}
                    />
                  </View>
                  <View style={styles.distance}>
                    <Text style={styles.distanceText}>{distance}</Text>
                  </View>
                </View>
              </TouchableHighlight>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  checkData() {
    if (!this.props.alerts) {
      this.props.getAlerts(this.props.areaId);
    }
  }

  render() {
    const { alerts } = this.props;

    if (!alerts) return getPlaceholder();

    return alerts && alerts.length > 0
      ? this.getAlertsView()
      : getNoDataView();
  }
}

AlertsList.propTypes = {
  onPress: React.PropTypes.func.isRequired,
  getAlerts: React.PropTypes.func.isRequired,
  alerts: React.PropTypes.any, // Bool = not request [] = no data
  currentPosition: React.PropTypes.object,
  areaId: React.PropTypes.string.isRequired,
  areaName: React.PropTypes.string.isRequired
};

export default AlertsList;
