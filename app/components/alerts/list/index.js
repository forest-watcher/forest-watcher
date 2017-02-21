import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  Image,
  ScrollView
} from 'react-native';

import GeoPoint from 'geopoint';
import ImageCache from 'components/common/image-cache';
import styles from './styles';

const placeholderImage = require('assets/alert_list_preloader_row.png');

function getPlaceholder() {
  return (
    <View style={styles.placeholder}>
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Please wait while the data is downloaded...</Text>
      </View>
      <Image style={styles.placeholderImage} source={placeholderImage} />
    </View>
  );
}

class AlertsList extends Component {
  constructor() {
    super();

    this.state = {
      alerts: null,
      curentPosition: null
    };
  }

  componentDidMount() {
    // Temp
    setTimeout(() => {
      this.getLocation();
      this.checkData();
    }, 200);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.alerts) {
      this.setState({ alerts: newProps.alerts });
    }
  }

  getLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({ curentPosition: position });
      },
      (error) => console.log(JSON.stringify(error)),
      { enableHighAccuracy: true, timeout: 1000, maximumAge: 50 }
    );
  }

  getAlertsView() {
    const { alerts } = this.state;

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
            let distance = 'Not Available';

            if (this.state.curentPosition) {
              const geoPoint = new GeoPoint(alert.center.lat, alert.center.lon);
              const currentPoint = new GeoPoint(this.state.curentPosition.coords.latitude, this.state.curentPosition.coords.longitude);
              distance = `${Math.round(currentPoint.distanceTo(geoPoint, true))}km away`; // in Kilometers
            }
            // console.log(this.state.curentPosition.coords, currentPoint.distanceTo(geoPoint, true));

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
                      style={{ width: 150, height: 150 }}
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
    if (!Object.keys(this.props.alerts).length > 0) {
      this.props.getAlerts(this.props.areaId);
    } else {
      this.setState({ alerts: this.props.alerts });
    }
  }

  render() {
    const { alerts } = this.state;
    return alerts && alerts.length > 0
      ? this.getAlertsView()
      : getPlaceholder();
  }
}

AlertsList.propTypes = {
  onPress: React.PropTypes.func.isRequired,
  getAlerts: React.PropTypes.func.isRequired,
  alerts: React.PropTypes.array,
  areaId: React.PropTypes.string.isRequired
};

export default AlertsList;
