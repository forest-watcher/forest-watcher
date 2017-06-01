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
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';

import Theme from 'config/theme';
import { daysToDate } from 'helpers/date';
import { getUrlTile } from 'helpers/map';
import ActionBtn from 'components/common/action-button';
import AreaCarousel from 'containers/map/area-carousel/';
import tracker from 'helpers/googleAnalytics';
import I18n from 'locales';
import MapView from 'react-native-maps';
import styles from './styles';

import { SensorManager } from 'NativeModules'; // eslint-disable-line

const geoViewport = require('@mapbox/geo-viewport');
const tilebelt = require('@mapbox/tilebelt');

const { RNLocation: Location } = require('NativeModules'); // eslint-disable-line

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

    const { center } = props;
    const initialCoords = center || { lat: CONSTANTS.maps.lat, lon: CONSTANTS.maps.lng };
    this.eventLocation = null;
    this.eventOrientation = null;
    // Google maps lon and lat are inverted
    this.state = {
      renderMap: false,
      lastPosition: null,
      hasCompass: false,
      compassFallback: null,
      heading: null,
      geoMarkerOpacity: new Animated.Value(0.3),
      region: {
        latitude: initialCoords.lon,
        longitude: initialCoords.lat,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },
      coordinates: {
        tile: [], // tile coordinates x, y, z + precision x, y
        precision: [] // tile precision x, y
      },
      alertSelected: null,
      urlTile: null
    };
  }

  componentDidMount() {
    tracker.trackScreenView('Map');

    if (Platform.OS === 'ios') {
      Location.requestWhenInUseAuthorization();
      StatusBar.setBarStyle('light-content');
    }

    const { datasetSlug } = this.props;
    this.setUrlTile(datasetSlug);
    this.renderMap();
    this.geoLocate();
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.alertSelected !== nextState.alertSelected && this.state.lastPosition !== null) {
      this.setCompassLine();
    }

    if (this.props.datasetSlug !== nextProps.datasetSlug) {
      this.updateSelectedArea();
    }

    if (this.props.startDate !== nextProps.startDate ||
        this.props.endDate !== nextProps.endDate) {
      this.updateSelectedArea();
    }
  }

  componentWillUnmount() {
    Location.stopUpdatingLocation();

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
    if (!this.state.alertSelected) {
      const fitOptions = { edgePadding: { top: 250, right: 250, bottom: 250, left: 250 }, animated: true };
      if (this.props.area.coordinates) {
        this.map.fitToCoordinates(this.props.area.coordinates, fitOptions);
      }
    }
  }

  onMapPress = (e) => {
    this.selectAlert(e.nativeEvent.coordinate);
  }

  async setUrlTile(datasetSlug) {
    const url = await getUrlTile(datasetSlug);
    this.setState({ urlTile: url });
  }

  getMapZoom() {
    const position = this.state.region;

    const bounds = [
      position.longitude - (position.longitudeDelta / 2),
      position.latitude - (position.latitudeDelta / 2),
      position.longitude + (position.longitudeDelta / 2),
      position.latitude + (position.latitudeDelta / 2)
    ];

    return geoViewport.viewport(bounds, [width, height], 0, 21, 256).zoom || 0;
  }

  setCompassLine = () => {
    this.setState((prevState) => {
      const state = {};
      if (prevState.alertSelected !== null) {
        // extract not needed props
        // eslint-disable-next-line no-unused-vars
        const { accuracy, altitude, speed, course, ...rest } = this.state.lastPosition;
        state.compassFallback = [{ ...rest }, { ...this.state.alertSelected }];
      }
      if (prevState.compassFallback !== null && prevState.alertSelected === null) {
        state.compassFallback = null;
      }
      return state;
    });
  }

  updateSelectedArea = () => {
    this.setState({
      coordinates: {
        tile: [], // tile coordinates x, y, z + precision x, y
        precision: [] // tile precision x, y
      },
      alertSelected: null,
      urlTile: null
    }, () => {
      const options = { edgePadding: { top: 250, right: 250, bottom: 250, left: 250 }, animated: false };
      this.map.fitToCoordinates(this.props.area.coordinates, options);
      if (this.props.datasetSlug) {
        this.setUrlTile(this.props.datasetSlug);
      }
    });
  }

  selectAlert = (coordinates) => {
    const zoom = this.getMapZoom();
    if (zoom) {
      const tile = tilebelt.pointToTile(coordinates.longitude, coordinates.latitude, zoom, true);
      this.setState({
        alertSelected: coordinates,
        coordinates: {
          tile: [tile[0], tile[1], tile[2]],
          precision: [tile[3], tile[4]]
        }
      });
    }
  }

  updateSelectedAlertZoom = () => {
    const zoom = this.getMapZoom();
    const { latitude, longitude } = this.state.alertSelected;
    if (zoom) {
      const tile = tilebelt.pointToTile(longitude, latitude, zoom, true);
      this.setState({
        coordinates: {
          tile: [tile[0], tile[1], tile[2]],
          precision: [tile[3], tile[4]]
        }
      });
    }
  }

  updateRegion = (region) => {
    this.setState({ region });
    if (this.state.alertSelected) {
      this.updateSelectedAlertZoom();
    }
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
      throttle((location) => {
        const coords = Platform.OS === 'ios' ? location.coords : location;
        this.setState({
          lastPosition: coords
        });
      }, 300)
    );

    const updateHeading = heading => (prevState) => {
      const state = {
        heading: parseInt(heading, 10)
      };
      if (!prevState.hasCompass) state.hasCompass = true;
      return state;
    };

    if (Platform.OS === 'ios') {
      Location.startUpdatingHeading();
      this.eventOrientation = DeviceEventEmitter.addListener(
        'headingUpdated',
        (data) => {
          this.setState(updateHeading(data.heading));
        }
      );
    } else {
      SensorManager.startOrientation(300);
      this.eventOrientation = DeviceEventEmitter.addListener(
        'Orientation',
        throttle((data) => {
          this.setState(updateHeading(data.azimuth));
        }, 16)
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
    const { alertSelected } = this.state;
    let latLng = '0,0';
    if (alertSelected) {
      latLng = `${alertSelected.latitude},${alertSelected.longitude}`;
    }
    const screen = 'ForestWatcher.NewReport';
    const title = 'Report';
    const form = `New-report-${Math.floor(Math.random() * 1000)}`;
    this.props.createReport(form, latLng);
    this.props.navigator.push({
      screen,
      title,
      passProps: {
        screen,
        title,
        form,
        questionsToSkip: 4,
        texts: {
          saveLaterTitle: 'report.saveLaterTitle',
          saveLaterDescription: 'report.saveLaterDescription',
          requiredId: 'report.reportIdRequired'
        }
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
    const { coordinates, alertSelected, urlTile, hasCompass, lastPosition, compassFallback } = this.state;
    const { datasetSlug, startDate, endDate } = this.props;
    const hasCoordinates = (coordinates.tile && coordinates.tile.length > 0) || false;
    const showCompassFallback = !hasCompass && lastPosition && alertSelected && compassFallback;

    const dates = {
      min: datasetSlug === 'viirs' ? String(startDate) : daysToDate(startDate),
      max: datasetSlug === 'viirs' ? String(endDate) : daysToDate(endDate)
    };

    return (
      this.state.renderMap
      ?
        <View style={styles.container}>
          <View
            style={styles.header}
            pointerEvents={'box-none'}
          >
            {alertSelected &&
              <Text style={styles.headerSubtitle}>
                {alertSelected.latitude.toFixed(4)}, {alertSelected.longitude.toFixed(4)}
              </Text>
            }
          </View>
          <MapView
            ref={(ref) => { this.map = ref; }}
            style={styles.map}
            provider={MapView.PROVIDER_GOOGLE}
            mapType="hybrid"
            rotateEnabled={false}
            onPress={this.onMapPress}
            initialRegion={this.state.region}
            onRegionChange={debounce(region => this.updateRegion(region), 100)}
            onRegionChangeComplete={this.updateRegion}
            onLayout={this.onLayout}
            moveOnMarkerPress={false}
          >
            {showCompassFallback &&
              <MapView.Polyline
                coordinates={this.state.compassFallback}
                strokeColor={Theme.colors.color5}
                strokeWidth={2}
              />
            }
            <MapView.Polyline
              coordinates={this.props.area.coordinates}
              strokeColor={Theme.colors.color1}
              strokeWidth={2}
            />
            {this.state.lastPosition &&
              <MapView.Marker.Animated
                image={markerImage}
                coordinate={this.state.lastPosition}
                style={{ zIndex: 2 }}
                anchor={{ x: 0.5, y: 0.5 }}
                pointerEvents={'none'}
              />
            }
            {this.state.lastPosition && this.state.heading
              ?
                <MapView.Marker
                  key={'compass'}
                  coordinate={this.state.lastPosition}
                  zIndex={1}
                  anchor={{ x: 0.5, y: 0.5 }}
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
            {urlTile &&
              <MapView.CanvasUrlTile
                urlTemplate={urlTile}
                zIndex={-1}
                maxZoom={12}
                areaId={this.props.area.id}
                alertType={datasetSlug}
                isConnected={this.props.isConnected}
                minDate={dates.min}
                maxDate={dates.max}
              />
            }
            {urlTile && hasCoordinates && // TODO: include the interaction and remove the false
              <MapView.CanvasInteractionUrlTile
                coordinates={coordinates}
                urlTemplate={urlTile}
                zIndex={1}
                maxZoom={12}
                areaId={this.props.area.id}
                alertType={datasetSlug}
                isConnected={this.props.isConnected}
                minDate={dates.min}
                maxDate={dates.max}
              />
            }
          </MapView>
          {this.state.alertSelected
            ? this.renderFooter()
            : this.renderFooterLoading()
          }
          <AreaCarousel
            navigator={this.props.navigator}
            alertSelected={this.state.alertSelected}
            lastPosition={this.state.lastPosition}
          />
        </View>
      : renderLoading()
    );
  }
}

Map.propTypes = {
  navigator: React.PropTypes.object.isRequired,
  createReport: React.PropTypes.func.isRequired,
  isConnected: React.PropTypes.bool,
  area: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    coordinates: React.PropTypes.array.isRequired
  }).isRequired,
  center: React.PropTypes.shape({
    lat: React.PropTypes.number.isRequired,
    lng: React.PropTypes.number.isRequired
  }),
  startDate: React.PropTypes.string.isRequired,
  endDate: React.PropTypes.string.isRequired,
  datasetSlug: React.PropTypes.string.isRequired
};

export default Map;
