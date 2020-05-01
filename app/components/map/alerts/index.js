// @flow
import React, { Component } from 'react';

import { View } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import AlertDataset from 'components/map/alerts/dataset';

type AlertLayerSettingsType = {
  layerIsActive: boolean,
  glad: {
    active: boolean,
    timeFrame: number
  },
  viirs: {
    active: boolean,
    timeFrame: number
  }
};

type Props = {|
  +alertLayerSettings: AlertLayerSettingsType,
  +onShapeSourcePressed?: () => void
|};

export default class Alerts extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    if (!this.props.alertLayerSettings.layerIsActive) {
      return null;
    }
    return (
      <View>
        <MapboxGL.Images
          images={{
            // Add all images to map so we cn dynamically change the icon for alerts
            glad: require('assets/alertMapIcons/gladAlertMapIcon.png'),
            gladSelected: require('assets/alertMapIcons/gladSelectedAlertMapIcon.png'),
            gladRecent: require('assets/alertMapIcons/gladRecentAlertMapIcon.png'),
            gladRecentSelected: require('assets/alertMapIcons/gladRecentSelectedAlertMapIcon.png'),
            gladReported: require('assets/alertMapIcons/gladReportedAlertMapIcon.png'),
            gladReportedSelected: require('assets/alertMapIcons/gladReportedSelectedAlertMapIcon.png'),
            viirs: require('assets/alertMapIcons/viirsAlertMapIcon.png'),
            viirsSelected: require('assets/alertMapIcons/viirsSelectedAlertMapIcon.png'),
            viirsReported: require('assets/alertMapIcons/viirsReportedAlertMapIcon.png'),
            viirsReportedSelected: require('assets/alertMapIcons/viirsReportedSelectedAlertMapIcon.png'),
            selected: require('assets/alertMapIcons/selectedAlertMapIcon.png')
          }}
        />
        <AlertDataset
          slug={'viirs'}
          isActive={this.props.alertLayerSettings.viirs.active}
          timeframe={this.props.alertLayerSettings.viirs.timeFrame}
          timeframeUnit={'days'}
          onPress={this.props.onShapeSourcePressed}
        />
        <AlertDataset
          slug={'umd_as_it_happens'}
          isActive={this.props.alertLayerSettings.glad.active}
          timeframe={this.props.alertLayerSettings.glad.timeFrame}
          timeframeUnit={'months'}
          onPress={this.props.onShapeSourcePressed}
        />
      </View>
    );
  }
}
