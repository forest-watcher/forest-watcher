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
  Platform
} from 'react-native';
import CONSTANTS from 'config/constants';
import Carousel from 'react-native-snap-carousel';

import Theme from 'config/theme';
import daysSince from 'helpers/date';
import ActionBtn from 'components/common/action-button';
import tracker from 'helpers/googleAnalytics';
import I18n from 'locales';
import GeoPoint from 'geopoint';
import MapView from 'react-native-maps';
import { sliderWidth, itemWidth, styles } from './styles';

import { SensorManager } from 'NativeModules'; // eslint-disable-line

const { RNLocation: Location } = require('NativeModules'); // eslint-disable-line
const BoundingBox = require('boundingbox');

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 10;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const markerImage = require('assets/marker.png');
const markerCompassRedImage = require('assets/compass_circle_red.png');
const compassImage = require('assets/compass_direction.png');
const backgroundImage = require('assets/map_bg_gradient.png');

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
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color5,
    navBarButtonColor: Theme.colors.color5,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main,
    navBarTransparent: true,
    navBarTranslucent: true
  };

  constructor(props) {
    super(props);
    const intialCoords = props.center
      ? props.center
      : { lat: CONSTANTS.maps.lat, lon: CONSTANTS.maps.lng };

    const { geostores, areas } = props;
    const areaGeostoreIds = areas.map((area) => (area.geostoreId));
    const filteredGeostores = areaGeostoreIds.map((areaId) => (geostores[areaId]));
    this.areaFeatures = filteredGeostores.map((geostore) => geostore.features[0]);
    const center = new BoundingBox(this.areaFeatures[0]).getCenter();
    const initialCoords = center || { lat: CONSTANTS.maps.lat, lon: CONSTANTS.maps.lng };
    this.afterRenderTimer = null;
    this.eventLocation = null;
    this.eventOrientation = null;
    // Google maps lon and lat are inverted
    this.state = {
      renderMap: false,
      lastPosition: null,
      heading: null,
      geoMarkerOpacity: new Animated.Value(0.3),
      region: {
        latitude: initialCoords.lon,
        longitude: initialCoords.lat,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },
      areaCoordinates: this.getAreaCoordinates(this.areaFeatures[0]),
      areaId: areas[0].id,
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
    if (this.afterRenderTimer) {
      clearTimeout(this.afterRenderTimer);
    }
    this.afterRenderTimer = setTimeout(() => {
      if (this.areaFeatures && this.areaFeatures.length > 0) {
        this.map.fitToCoordinates(this.getAreaCoordinates(this.areaFeatures[0]),
          { edgePadding: { top: 200, right: 200, bottom: 200, left: 200 }, animated: true });
      }
    }, 1000);
  }

  getAreaCoordinates = (areaFeature) => (
    areaFeature.geometry.coordinates[0].map((coordinate) => (
      {
        longitude: coordinate[0],
        latitude: coordinate[1]
      }
    ))
  )

  updateSelectedArea(aId) {
    const area = this.props.areas[aId];
    this.setState({
      areaCoordinates: this.getAreaCoordinates(this.areaFeatures[aId]),
      areaId: area.id
    }, () => {
      this.map.fitToCoordinates(this.getAreaCoordinates(this.areaFeatures[aId]),
        { edgePadding: { top: 200, right: 200, bottom: 200, left: 200 }, animated: false });
    });
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
    this.props.navigator.push({
      screen: 'ForestWatcher.NewReport',
      title: 'Report',
      backButtonTitle: 'Back',
      passProps: {
        form
      }
    });
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
    const sliderItems = this.props.areas.map((area, index) => (
      <View key={`entry-${index}`} style={styles.slideInnerContainer}>
        <Text style={styles.textContainer}>{ area.name }</Text>
      </View>
    ));

    return (
      this.state.renderMap
      ?
        <View style={styles.container}>
          <View
            style={styles.header}
            pointerEvents={'box-none'}
          >
            {this.state.alertSelected &&
              <Text style={styles.headerSubtitle}>
                {this.state.alertSelected.lat}, {this.state.alertSelected.long}
              </Text>
            }
          </View>
          <MapView
            ref={(ref) => { this.map = ref; }}
            style={styles.map}
            provider={MapView.PROVIDER_GOOGLE}
            mapType="hybrid"
            rotateEnabled={false}
            region={this.state.region}
            onLayout={this.onLayout}
            moveOnMarkerPress={false}
          >
            <MapView.Polygon
              coordinates={this.state.areaCoordinates}
              strokeColor={Theme.colors.color1}
              strokeWidth={2}
            />
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
              areaId={this.props.areaId}
              isConnected={this.props.isConnected}
              minDate={daysSince('20170101')}
              maxDate={daysSince('20170301')}
            />
          </MapView>
          {this.state.alertSelected
            ? this.renderFooter()
            : this.renderFooterLoading()
          }
          <View style={{ position: 'absolute', bottom: 0, zIndex: 10 }}>
            <Carousel
              ref={(carousel) => { this.carousel = carousel; }}
              sliderWidth={sliderWidth}
              itemWidth={itemWidth}
              onSnapToItem={(index) => this.updateSelectedArea(index)}
              showsHorizontalScrollIndicator={false}
              slideStyle={styles.slideStyle}
            >
              { sliderItems }
            </Carousel>
          </View>
        </View>
      :
        renderLoading()
    );
  }
}

Map.propTypes = {
  navigator: React.PropTypes.object.isRequired,
  createReport: React.PropTypes.func.isRequired,
  isConnected: React.PropTypes.bool,
  center: React.PropTypes.any,
  areaId: React.PropTypes.any,
  geostores: React.PropTypes.object,
  areas: React.PropTypes.array
};

export default Map;
