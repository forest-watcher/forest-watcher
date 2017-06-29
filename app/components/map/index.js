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
import moment from 'moment';

import Theme from 'config/theme';
// import { daysToDate } from 'helpers/date';
import ActionBtn from 'components/common/action-button';
import AreaCarousel from 'containers/map/area-carousel/';
import Clusters from 'components/map/clusters/';
import tracker from 'helpers/googleAnalytics';
import I18n from 'locales';
import MapView from 'react-native-maps';
import styles from './styles';

import { SensorManager } from 'NativeModules'; // eslint-disable-line

const Timer = require('react-native-timer');
const geoViewport = require('@mapbox/geo-viewport');

const { RNLocation: Location } = require('NativeModules'); // eslint-disable-line

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 10;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const markerImage = require('assets/marker.png');
const alertWhite = require('assets/alert-white.png');
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
    drawUnderNavBar: true,
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
    this.hasSetCoordinates = false;
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
      urlTile: null,
      markers: []
    };
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentDidMount() {
    tracker.trackScreenView('Map');

    if (Platform.OS === 'ios') {
      Location.requestWhenInUseAuthorization();
      StatusBar.setBarStyle('light-content');
    }

    this.geoLocate();
    this.updateMarkers();
    Timer.setTimeout(this, 'renderMap', this.renderMap, 500);
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.selectedAlertCoordinates !== nextState.selectedAlertCoordinates && this.state.lastPosition !== null) {
      this.setCompassLine();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.areaCoordinates !== prevProps.areaCoordinates) {
      this.updateSelectedArea();
    }
    if (this.state.selectedAlertCoordinates !== prevState.selectedAlertCoordinates) {
      this.setHeaderTitle();
    }
  }

  componentWillUnmount() {
    Location.stopUpdatingLocation();

    Timer.clearTimeout(this, 'renderMap');
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

  onNavigatorEvent(event) {
    const { actionsPending, syncModalOpen, syncSkip, setCanDisplayAlerts, canDisplayAlerts } = this.props;
    if (event.id === 'didAppear') {
      if (actionsPending > 0 && !syncModalOpen && !syncSkip && !this.syncModalOpen) {
        this.syncModalOpen = true;
        this.props.setSyncModal(true);
        this.props.navigator.showModal({
          screen: 'ForestWatcher.Sync',
          passProps: {
            goBackDisabled: true
          }
        });
      }
      if (!canDisplayAlerts) {
        setCanDisplayAlerts(true);
      }
    }
  }

  onLayout = () => {
    if (this.hasSetCoordinates === false && this.props.areaCoordinates) {
      const options = { edgePadding: { top: 250, right: 250, bottom: 250, left: 250 }, animated: false };
      this.map.fitToCoordinates(this.props.areaCoordinates, options);
      this.hasSetCoordinates = true;
    }
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
      if (prevState.selectedAlertCoordinates !== null) {
        // extract not needed props
        // eslint-disable-next-line no-unused-vars
        const { accuracy, altitude, speed, course, ...rest } = this.state.lastPosition;
        state.compassFallback = [{ ...rest }, { ...this.state.selectedAlertCoordinates }];
      }
      if (prevState.compassFallback !== null && prevState.selectedAlertCoordinates === null) {
        state.compassFallback = null;
      }
      return state;
    });
  }

  setHeaderTitle = () => {
    const { selectedAlertCoordinates } = this.state;
    const headerText = selectedAlertCoordinates
      ? `${selectedAlertCoordinates.latitude.toFixed(4)}, ${selectedAlertCoordinates.longitude.toFixed(4)}`
      : I18n.t('dashboard.map');
    this.props.navigator.setTitle({
      title: headerText
    });
  }

  updateMarkers() {
    const markers = this.props.cluster && this.props.cluster.getClusters([
      this.state.region.longitude - (this.state.region.longitudeDelta / 2),
      this.state.region.latitude - (this.state.region.latitudeDelta / 2),
      this.state.region.longitude + (this.state.region.longitudeDelta / 2),
      this.state.region.latitude + (this.state.region.latitudeDelta / 2)
    ], this.getMapZoom());
    this.setState({
      markers: markers || []
    });
  }

  createReport = () => {
    const { selectedAlertCoordinates } = this.state;
    this.props.setCanDisplayAlerts(false);
    const { area } = this.props;
    let latLng = '0,0';
    if (selectedAlertCoordinates) {
      latLng = `${selectedAlertCoordinates.latitude},${selectedAlertCoordinates.longitude}`;
    }
    const screen = 'ForestWatcher.NewReport';
    const title = 'Report';
    const form = `${area.name.toUpperCase()}-${area.dataset.name}-REPORT--${moment().format('YYYY-MM-DDTHH:mm:ss')}`;
    this.props.createReport({
      area,
      name: form,
      userPosition: this.lastPosition || '0,0',
      clickedPosition: latLng
    });
    this.props.navigator.push({
      screen,
      title,
      passProps: {
        screen,
        title,
        form
      }
    });
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

  updateRegion = (region) => {
    this.setState({ region }, () => {
      this.updateMarkers();
    });
  }

  zoomTo = (coordinates) => {
    const zoomCoordinates = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      latitudeDelta: this.state.region.latitudeDelta / 2,
      longitudeDelta: this.state.region.longitudeDelta / 2
    };
    this.map.animateToRegion(zoomCoordinates);
  }

  selectAlert = (e) => {
    const { coordinate } = e.nativeEvent;
    if (coordinate) {
      this.setState((state) => ({
        selectedAlertCoordinates: state.selectedAlertCoordinates ? null : coordinate
      }));
    }
  }

  updateSelectedArea = () => {
    this.setState({
      selectedAlertCoordinates: null
    }, () => {
      this.updateMarkers();
      const options = { edgePadding: { top: 250, right: 250, bottom: 250, left: 250 }, animated: false };
      if (this.map) this.map.fitToCoordinates(this.props.areaCoordinates, options);
    });
  }

  renderMap = () => {
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
      <View pointerEvents="box-none" style={styles.footer}>
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
    const { hasCompass, lastPosition, compassFallback, selectedAlertCoordinates } = this.state;
    const { areaCoordinates, datasetSlug } = this.props;
    const showCompassFallback = !hasCompass && lastPosition && selectedAlertCoordinates && compassFallback;
    return (
      this.state.renderMap
      ?
        <View style={styles.container}>
          <MapView
            ref={(ref) => { this.map = ref; }}
            style={styles.map}
            provider={MapView.PROVIDER_GOOGLE}
            mapType="hybrid"
            rotateEnabled={false}
            initialRegion={this.state.region}
            onRegionChangeComplete={this.updateRegion}
            onLayout={this.onLayout}
            moveOnMarkerPress={false}
            onPress={this.selectAlert}
          >
            {datasetSlug &&
              <Clusters
                markers={this.state.markers}
                selectAlert={this.selectAlert}
                zoomTo={this.zoomTo}
                datasetSlug={datasetSlug}
              />
            }
            {showCompassFallback &&
              <MapView.Polyline
                coordinates={this.state.compassFallback}
                strokeColor={Theme.colors.color5}
                strokeWidth={2}
              />
            }
            {areaCoordinates &&
              <MapView.Polyline
                coordinates={areaCoordinates}
                strokeColor={Theme.colors.color1}
                strokeWidth={2}
              />
            }
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
            {selectedAlertCoordinates &&
              <MapView.Marker
                key={'selectedAlert'}
                coordinate={selectedAlertCoordinates}
                image={alertWhite}
                anchor={{ x: 0.5, y: 0.5 }}
                zIndex={10}
              />
            }
          </MapView>
          <AreaCarousel
            navigator={this.props.navigator}
            alertSelected={selectedAlertCoordinates}
            lastPosition={this.state.lastPosition}
          />
          {selectedAlertCoordinates
            ? this.renderFooter()
            : this.renderFooterLoading()
          }
        </View>
      : renderLoading()
    );
  }
}

Map.propTypes = {
  navigator: React.PropTypes.object.isRequired,
  createReport: React.PropTypes.func.isRequired,
  cluster: React.PropTypes.object,
  center: React.PropTypes.shape({
    lat: React.PropTypes.number.isRequired,
    lon: React.PropTypes.number.isRequired
  }),
  datasetSlug: React.PropTypes.string,
  areaCoordinates: React.PropTypes.array,
  actionsPending: React.PropTypes.number.isRequired,
  syncModalOpen: React.PropTypes.bool.isRequired,
  syncSkip: React.PropTypes.bool.isRequired,
  setSyncModal: React.PropTypes.func.isRequired,
  setCanDisplayAlerts: React.PropTypes.func.isRequired,
  canDisplayAlerts: React.PropTypes.bool.isRequired,
  area: React.PropTypes.object.isRequired
};

export default Map;
