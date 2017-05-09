import React, { Component } from 'react';
import {
  View,
  ActivityIndicator,
  Dimensions,
  DeviceEventEmitter,
  Animated,
  Easing,
  StatusBar,
  Image,
  Text,
  Platform,
  TouchableHighlight
} from 'react-native';
import CONSTANTS from 'config/constants';

import MapView from 'react-native-maps';
import GeoPoint from 'geopoint';
import I18n from 'locales';

import ActionBtn from 'components/common/action-button';
import Theme from 'config/theme';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';
import { SensorManager } from 'NativeModules'; // eslint-disable-line

const { RNLocation: Location } = require('NativeModules'); // eslint-disable-line

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 10;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const markerImage = require('assets/marker.png');
const markerCompassRedImage = require('assets/compass_circle_red.png');
const compassImage = require('assets/compass_direction.png');
const backgroundImage = require('assets/map_bg_gradient.png');
const backIconWhite = require('assets/previous_white.png');

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

// function getGoogleMapsCoordinates(coordinates) {
//   const cords = [];

//   coordinates.forEach((cordinate) => {
//     cords.push({
//       latitude: cordinate.lat,
//       longitude: cordinate.long
//     });
//   });

//   return cords;
// }

class Map extends Component {
  constructor(props) {
    super(props);
    const { params } = this.props.navigation.state;
    const intialCoords = params.center
      ? params.center
      : { lat: CONSTANTS.maps.lat, lon: CONSTANTS.maps.lng };

    this.afterRenderTimer = null;
    this.eventLocation = null;
    this.eventOrientation = null;
    this.state = {
      renderMap: false,
      lastPosition: null,
      heading: null,
      geoMarkerOpacity: new Animated.Value(0.3),
      region: {
        latitude: intialCoords.lat,
        longitude: intialCoords.lon,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },
      alertSelected: null
      // alerts: params.features && params.features.length > 0 ? params.features.slice(0, 120) : [] // Provisional
    };
  }

  componentDidMount() {
    tracker.trackScreenView('Map');

    if (Platform.OS === 'ios') {
      Location.requestWhenInUseAuthorization();
      StatusBar.setBarStyle('light-content');
    }

    this.renderMap();
    this.geoLocate();
  }

  componentWillUnmount() {
    Location.stopUpdatingLocation();

    clearTimeout(this.afterRenderTimer);

    if (this.eventLocation) {
      this.eventLocation.remove();
    }

    if (this.eventOrientation) {
      this.eventOrientation.remove();
    }

    if (Platform.OS === 'ios') {
      StatusBar.setBarStyle('default');
      Location.stopUpdatingHeading();
    } else {
      SensorManager.stopOrientation();
    }
  }

  onLayout = () => {
    // if (!this.state.alertSelected) {
    //   if (this.afterRenderTimer) {
    //     clearTimeout(this.afterRenderTimer);
    //   }
    //   this.afterRenderTimer = setTimeout(() => {
    //     const { params } = this.props.navigation.state;
    //     if (params && params.features && params.features.length > 0) {
    //       this.map.fitToCoordinates(getGoogleMapsCoordinates(params.features), {
    //         edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
    //         animated: true
    //       });
    //     }
    //   }, 1000);
    // }
  }

  geoLocate() {
    this.animateGeo();

    navigator.geolocation.getCurrentPosition(
      (location) => {
        this.setState({
          lastPosition: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          }
        });
      },
      (error) => console.info(error),
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );

    Location.startUpdatingLocation();

    this.eventLocation = DeviceEventEmitter.addListener(
      'locationUpdated',
      (location) => {
        const coords = Platform.OS === 'ios' ? location.coords : location;
        this.setState({
          lastPosition: coords
        });
      }
    );

    if (Platform.OS === 'ios') {
      Location.startUpdatingHeading();
      this.eventOrientation = DeviceEventEmitter.addListener(
        'headingUpdated',
        (data) => {
          this.setState({ heading: parseInt(data.heading, 10) });
        }
      );
    } else {
      SensorManager.startOrientation(1000);
      this.eventOrientation = DeviceEventEmitter.addListener(
        'Orientation',
        (data) => {
          this.setState({
            heading: parseInt(data.azimuth, 10)
          });
        }
      );
    }
  }

  animateGeo() {
    Animated.sequence([
      Animated.timing(this.state.geoMarkerOpacity, {
        toValue: 0.4,
        easing: Easing.in(Easing.quad),
        duration: 800
      }),
      Animated.timing(this.state.geoMarkerOpacity, {
        toValue: 0.15,
        easing: Easing.out(Easing.quad),
        duration: 1000
      })
    ]).start(event => {
      if (event.finished) {
        this.animateGeo();
      }
    });
  }

  createReport = () => {
    const { lastPosition } = this.state;
    const form = `New-report-${Math.floor(Math.random() * 1000)}`;
    let latLng = '0,0';
    if (lastPosition) {
      latLng = `${lastPosition.latitude},${lastPosition.longitude}`;
    }
    this.props.createReport(form, latLng);
    this.props.navigate('NewReport', { form });
  };

  renderMap() {
    if (!this.state.renderMap) {
      this.setState({
        renderMap: true
      });
    }
  }

  renderFooter() {
    let distanceText = I18n.t('commonText.notAvailable');
    let positionText = '';
    let distance = 999999;
    const { lastPosition } = this.state;

    if (lastPosition) {
      const geoPoint = new GeoPoint(this.state.alertSelected.lat, this.state.alertSelected.long);
      const currentPoint = new GeoPoint(lastPosition.latitude, lastPosition.longitude);
      positionText = `${I18n.t('commonText.yourPosition')}: ${lastPosition.latitude}, ${lastPosition.longitude}`;
      distance = currentPoint.distanceTo(geoPoint, true).toFixed(4);
      distanceText = `${distance} ${I18n.t('commonText.kmAway')}`; // in Kilometers
    }

    const reportBtn = (
      <ActionBtn
        style={styles.footerButton}
        text={I18n.t('report.title')}
        onPress={this.createReport}
      />
    );
    return (
      <View style={styles.footer}>
        <Image
          style={styles.footerBg}
          source={backgroundImage}
        />
        <Text style={styles.footerTitle}>
          {distanceText}
        </Text>
        <Text style={[styles.footerTitle, styles.footerSubtitle]}>
          {positionText}
        </Text>
        {reportBtn}
      </View>
    );
  }

  renderFooterLoading() {
    return (!this.state.lastPosition &&
      <View style={styles.footer}>
        <Image
          style={styles.footerBg}
          source={backgroundImage}
        />
        <View style={styles.signalNotice}>
          <View style={styles.geoLocationContainer}>
            <Image
              style={styles.marker}
              source={markerCompassRedImage}
            />
            <Animated.View
              style={[styles.geoLocation, { opacity: this.state.geoMarkerOpacity }]}
            />
          </View>
          <Text style={styles.signalNoticeText}>{I18n.t('alerts.satelliteSignal')}</Text>
        </View>
      </View>
    );
  }

  render() {
    const { params } = this.props.navigation.state;

    // const stopPropagation = thunk => e => {
    //   e.stopPropagation();
    //   thunk();
    // };

    return (
      this.state.renderMap
      ?
        <View style={styles.container}>
          <View
            style={styles.header}
            pointerEvents={'box-none'}
          >
            {this.props.isConnected ?
              <Image
                style={styles.headerBg}
                source={backgroundImage}
              /> : null}
            <Text style={styles.headerTitle}>
              {params.title}
            </Text>
            {this.state.alertSelected &&
              <Text style={styles.headerSubtitle}>
                {this.state.alertSelected.lat}, {this.state.alertSelected.long}
              </Text>
            }
            <TouchableHighlight
              style={styles.headerBtn}
              onPress={() => this.props.navigation.goBack()}
              underlayColor="transparent"
              activeOpacity={0.8}
            >
              <Image style={Theme.icon} source={backIconWhite} />
            </TouchableHighlight>
          </View>
          <MapView
            ref={(ref) => { this.map = ref; }}
            style={styles.map}
            provider={MapView.PROVIDER_GOOGLE}
            mapType="hybrid"
            rotateEnabled={false}
            initialRegion={this.state.region}
            onLayout={this.onLayout}
            moveOnMarkerPress={false}
          >
            {this.state.lastPosition &&
              <MapView.Marker.Animated
                image={markerImage}
                coordinate={this.state.lastPosition}
                style={{ zIndex: 2 }}
                pointerEvents={'none'}
              />
            }
            {this.state.lastPosition && this.state.heading
              ?
                <MapView.Marker
                  key={'compass'}
                  coordinate={this.state.lastPosition}
                  zIndex={1}
                  anchor={{ x: 0.5, y: 0.6 }}
                  pointerEvents={'none'}
                >
                  <Animated.Image
                    style={{
                      width: 94,
                      height: 94,
                      transform: [
                        { rotate: `${this.state.heading ? this.state.heading : '0'}deg` }
                      ]
                    }}
                    source={compassImage}
                  />
                </MapView.Marker>
              : null
            }
            <MapView.CanvasUrlTile
              urlTemplate="http://wri-tiles.s3.amazonaws.com/glad_prod/tiles/{z}/{x}/{y}.png"
              zIndex={-1}
              maxZoom={12}
              areaId={params.areaId}
              isConnected={false}
              minDate="2017/01/01"
              maxDate="2017/03/01"
            />
          </MapView>
          {this.state.alertSelected
            ? this.renderFooter()
            : this.renderFooterLoading()
          }
        </View>
      :
        renderLoading()
    );
  }
}

Map.propTypes = {
  navigation: React.PropTypes.object.isRequired,
  navigate: React.PropTypes.func.isRequired,
  createReport: React.PropTypes.func.isRequired,
  isConnected: React.PropTypes.bool
};

Map.navigationOptions = {
  header: {
    visible: false
  }
};

export default Map;
