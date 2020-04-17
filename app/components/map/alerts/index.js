// @flow
import React, { Component } from 'react';

import { View } from 'react-native';
import Theme from 'config/theme';
import { mapboxStyles } from './styles';
import MapboxGL from '@react-native-mapbox-gl/maps';
import type { Alert } from 'types/alerts.types';
import { DATASETS } from 'config/constants';

const selectedAlert = require('assets/alertMapIcons/selectedAlertMapIcon.png');

type Props = {
  featureId: string,
  areaId: string,
  gladAlerts: Array<Alert>,
  viirsAlerts: Array<Alert>
};

export default class Alerts extends Component<Props> {
  renderAlerts = (alerts: Array<Alert>, alertType: string) => {
    const alertFeatures = alerts?.map((alert: Alert) => MapboxGL.geoUtils.makePoint([alert.lon, alert.lat]));
    const alertsFeatureCollection = MapboxGL.geoUtils.makeFeatureCollection(alertFeatures);
    const viirsAlertType = alertType === DATASETS.VIIRS; // if false, use GLAD alert Styles
    const alertIcon = viirsAlertType ? selectedAlert : selectedAlert;
    const circleColor = viirsAlertType ? Theme.colors.viirs : Theme.colors.turtleGreen;
    return (
      <MapboxGL.ShapeSource id={alertType + 'alertSource'} cluster clusterRadius={40} shape={alertsFeatureCollection}>
        <MapboxGL.SymbolLayer id={alertType + 'pointCount'} style={mapboxStyles.clusterCount} />
        <MapboxGL.CircleLayer
          id={alertType + 'clusteredPoints'}
          belowLayerID={alertType + 'pointCount'}
          filter={['has', 'point_count']}
          style={{ ...mapboxStyles.clusteredPoints, circleColor }}
        />
        <MapboxGL.SymbolLayer
          id={alertType + 'alertLayer'}
          filter={['!has', 'point_count']}
          style={{ ...mapboxStyles.alert, iconImage: alertIcon }}
        />
      </MapboxGL.ShapeSource>
    );
  };

  render() {
    return (
      <View>
        {this.renderAlerts(this.props.gladAlerts, DATASETS.GLAD)}
        {this.renderAlerts(this.props.viirsAlerts, DATASETS.VIIRS)}
      </View>
    );
  }
}
