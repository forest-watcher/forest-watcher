// @flow
import React, { Component } from 'react';

import { View } from 'react-native';
import Theme from 'config/theme';
import { mapboxStyles } from './styles';
import MapboxGL from '@react-native-mapbox-gl/maps';
import type { Alert } from 'types/alerts.types';
import { DATASETS } from 'config/constants';
import i18n from 'i18next';
import moment from 'moment';
import { featureCollection, point } from '@turf/helpers';

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

type Props = {
  featureId: string,
  gladAlerts: Array<Alert>,
  viirsAlerts: Array<Alert>,
  alertLayerSettings: AlertLayerSettingsType,
  onShapeSourcePressed?: () => void
};

export default class Alerts extends Component<Props> {
  getAlertIcon = (viirsAlertType: boolean, date: number) => {
    if (
      !viirsAlertType &&
      date >
        moment()
          .subtract(7, 'days')
          .valueOf()
    ) {
      return 'gladRecent';
    }
    return viirsAlertType ? 'viirs' : 'glad';
  };

  renderAlerts = (alerts: Array<Alert>, alertType: string) => {
    const viirsAlertType = alertType === DATASETS.VIIRS; // if false, use GLAD alert Styles
    const { alertLayerSettings } = this.props;
    const { active, timeFrame } = viirsAlertType ? alertLayerSettings.viirs : alertLayerSettings.glad;
    if (!active || !alerts?.length) {
      return null;
    }
    const alertDateStart = moment()
      .subtract(timeFrame, viirsAlertType ? 'days' : 'months')
      .valueOf();
    const alertsToDisplay = alerts.filter(alert => alert.date >= alertDateStart);
    const alertFeatures = alertsToDisplay.map((alert: Alert) => {
      const alertName = viirsAlertType ? i18n.t('map.viirsAlert') : i18n.t('map.gladAlert');
      const properties = {
        icon: this.getAlertIcon(viirsAlertType, alert.date),
        date: alert.date,
        type: 'alert',
        name: alertName,
        reported: false
      };
      return point([alert.lon, alert.lat], properties);
    });
    const alertsFeatureCollection = featureCollection(alertFeatures);
    const circleColor = viirsAlertType ? Theme.colors.viirs : Theme.colors.glad;
    const onPress = this.props.onShapeSourcePressed || null;
    return (
      <MapboxGL.ShapeSource
        id={alertType + 'alertSource'}
        cluster
        clusterRadius={40}
        shape={alertsFeatureCollection}
        onPress={onPress}
      >
        <MapboxGL.SymbolLayer id={alertType + 'pointCount'} style={mapboxStyles.clusterCount} />
        <MapboxGL.CircleLayer
          id={alertType + 'clusteredPoints'}
          belowLayerID={alertType + 'pointCount'}
          filter={['has', 'point_count']}
          style={{ ...mapboxStyles.clusteredPoints, circleColor }}
        />
        <MapboxGL.SymbolLayer
          id={alertType + 'alertLayer'}
          filter={['!', ['has', 'point_count']]}
          style={mapboxStyles.alert}
        />
      </MapboxGL.ShapeSource>
    );
  };

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
        {this.renderAlerts(this.props.gladAlerts, DATASETS.GLAD)}
        {this.renderAlerts(this.props.viirsAlerts, DATASETS.VIIRS)}
      </View>
    );
  }
}
