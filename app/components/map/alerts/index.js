// @flow
import React, { Component } from 'react';

import { View } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import AlertDataset from 'components/map/alerts/dataset';
import type { AlertLayerSettingsType } from 'types/layerSettings.types';
import type { Alert } from 'types/common.types';

type Props = {|
  +alertLayerSettings: AlertLayerSettingsType,
  +areaId?: ?string,
  +reportedAlerts: Array<string>,
  +selectedAlerts: Array<Alert>,
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
          key={'viirs'}
          slug={'viirs'}
          areaId={this.props.areaId}
          isActive={this.props.alertLayerSettings.viirs.active}
          timeframe={this.props.alertLayerSettings.viirs.timeFrame}
          timeframeUnit={'days'}
          onPress={this.props.onShapeSourcePressed}
          reportedAlerts={this.props.reportedAlerts}
          selectedAlerts={this.props.selectedAlerts}
        />
        <AlertDataset
          key={'umd_as_it_happens'}
          slug={'umd_as_it_happens'}
          areaId={this.props.areaId}
          isActive={this.props.alertLayerSettings.glad.active}
          timeframe={this.props.alertLayerSettings.glad.timeFrame}
          timeframeUnit={'months'}
          onPress={this.props.onShapeSourcePressed}
          reportedAlerts={this.props.reportedAlerts}
          selectedAlerts={this.props.selectedAlerts}
        />
      </View>
    );
  }
}
