import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, Image, TextInput, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Navigation } from 'react-native-navigation';

import Theme from 'config/theme';
import ActionButton from 'components/common/action-button';
import i18n from 'i18next';
import MapboxGL from '@react-native-mapbox-gl/maps';
import debounceUI from 'helpers/debounceUI';
import { trackScreenView } from 'helpers/analytics';
import styles, { mapboxStyles } from './styles';
const turf = require('@turf/turf');

const editImage = require('assets/edit.png');

class SetupOverview extends Component {
  geojson;
  static options(passProps) {
    return {
      topBar: {
        title: {
          text: i18n.t('commonText.setup')
        }
      }
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      name: this.props.area ? this.props.area.name : '',
      navigateToAreasWhenReady: false
    };
    this.geojson = this.props.area.geojson;
  }

  componentDidMount() {
    trackScreenView('Overview Set Up');
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.navigateToAreasWhenReady && !this.props.syncingAreas && prevProps.syncingAreas) {
      this.navigateToAreaScreen();
    }
  }

  navigateToAreaScreen = async () => {
    await Navigation.setStackRoot(this.props.componentId, {
      component: {
        id: 'ForestWatcher.Dashboard',
        name: 'ForestWatcher.Dashboard'
      }
    });

    Navigation.push('ForestWatcher.Dashboard', {
      component: {
        name: 'ForestWatcher.Areas',
        passProps: {
          scrollToBottom: true
        }
      }
    });
  };

  onNextPress = debounceUI(async () => {
    if (!this.props.isConnected) {
      this.props.showNotConnectedNotification();
      return;
    }
    const uri = await this.map.takeSnap(true);
    const params = {
      area: {
        ...this.props.area,
        name: this.state.name
      },
      snapshot: uri
    };

    this.props.setSetupArea(params);
    this.props.saveArea(params);
    this.setState({ navigateToAreasWhenReady: true });
  });

  textChange = name => {
    this.setState({ name });
  };

  render() {
    const bbox = turf.bbox(this.geojson);
    const bounds = {
      ne: [bbox[0], bbox[1]],
      sw: [bbox[2], bbox[3]],
      paddingLeft: 30,
      paddingRight: 30,
      paddingTop: 10,
      paddingBottom: 10
    };

    let btnEnabled = true;
    let btnText = i18n.t('commonText.finish');
    if (!this.state.name) {
      btnEnabled = false;
    } else if (this.state.saving) {
      btnEnabled = false;
      btnText = i18n.t('commonText.saving');
    }
    if (this.state.navigateToAreasWhenReady) {
      btnEnabled = false;
    }
    return (
      <KeyboardAwareScrollView>
        <View style={styles.container}>
          <View style={styles.selector}>
            <Text style={styles.selectorLabel}>{i18n.t('setupOverview.areaName')}</Text>
            <View style={styles.mapView}>
              <MapboxGL.MapView
                logoEnabled={false}
                zoomEnabled={false}
                scrollEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
                contentInset={10}
                styleURL={MapboxGL.StyleURL.SatelliteStreet}
                style={styles.mapbox}
                ref={ref => {
                  this.map = ref;
                }}
              >
                <MapboxGL.Camera animationDuration={0} minZoomLevel={1} bounds={bounds} />
                <MapboxGL.ShapeSource id="circleOverlay" type="geojson" belowLayerID="locationPin" shape={this.geojson}>
                  <MapboxGL.LineLayer id="circleLineOverlay" style={mapboxStyles.circleOutlineStyle} />
                  <MapboxGL.FillLayer id="circleFillOverlay" style={mapboxStyles.circleOverlayStyle} />
                </MapboxGL.ShapeSource>
              </MapboxGL.MapView>
            </View>
            <View style={styles.searchContainer}>
              <TextInput
                ref={ref => {
                  this.input = ref;
                }}
                autoFocus={false}
                autoCorrect={false}
                autoCapitalize="none"
                value={this.state.name}
                keyboardType="default"
                placeholder={i18n.t('setupOverview.placeholder')}
                style={styles.searchInput}
                onChangeText={this.textChange}
                onFocus={this.props.onTextFocus}
                onBlur={this.props.onTextBlur}
                underlineColorAndroid="transparent"
                selectionColor={Theme.colors.turtleGreen}
                placeholderTextColor={Theme.fontColors.light}
              />
              <Image style={Theme.icon} source={editImage} onPress={() => this.input.focus()} />
            </View>
          </View>
          <ActionButton
            style={styles.buttonPos}
            disabled={!btnEnabled}
            onPress={this.onNextPress}
            text={btnText.toUpperCase()}
          />
          {this.state.navigateToAreasWhenReady && this.props.syncingAreas && (
            <View style={styles.loading}>
              <ActivityIndicator color={Theme.colors.turtleGreen} style={{ height: 80 }} size="large" />
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

SetupOverview.propTypes = {
  area: PropTypes.object.isRequired,
  syncingAreas: PropTypes.bool.isRequired,
  componentId: PropTypes.string.isRequired,
  saveArea: PropTypes.func.isRequired,
  setSetupArea: PropTypes.func.isRequired,
  isConnected: PropTypes.bool.isRequired,
  showNotConnectedNotification: PropTypes.func,
  onTextFocus: PropTypes.func,
  onTextBlur: PropTypes.func
};
export default SetupOverview;
