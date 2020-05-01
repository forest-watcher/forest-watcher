// @flow
import type { Alert } from 'types/common.types';

import React, { Component } from 'react';

import Theme from 'config/theme';
import { mapboxStyles } from './styles';
import MapboxGL from '@react-native-mapbox-gl/maps';
import i18n from 'i18next';
import moment from 'moment';
import queryAlerts from 'helpers/alert-store/queryAlerts';
import generateUniqueID from 'helpers/uniqueId';

type Props = {|
  +isActive: boolean,
  +onPress?: ?() => any,
  +slug: 'umd_as_it_happens' | 'viirs',
  +timeframe: number,
  +timeframeUnit: 'days' | 'months'
|};

type State = {|
  +alerts: Array<Alert>
|};

/**
 * Displays the alerts corresponding to the specified dataset and other criteria
 */
export default class AlertDataset extends Component<Props, State> {
  activeRequestId: ?string;

  constructor(props: Props) {
    super(props);
    this.state = {
      alerts: []
    };
  }

  componentDidMount() {
    this._refreshAlerts();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (
      this.props.slug !== prevProps.slug ||
      this.props.isActive !== prevProps.isActive ||
      this.props.timeframe !== prevProps.timeframe
    ) {
      this._refreshAlerts();
    }
  }

  _refreshAlerts = async () => {
    const { isActive, slug, timeframe, timeframeUnit } = this.props;

    // Reset the data in state before retrieving the updated data
    this.setState(state => ({
      alerts: []
    }));

    if (!isActive) {
      return;
    }

    try {
      const requestId = generateUniqueID();
      this.activeRequestId = requestId;
      const alerts = await queryAlerts({
        dataset: slug,
        timeAgo: { max: timeframe, unit: timeframeUnit },
        distinctLocations: true
      });
      if (requestId === this.activeRequestId) {
        this.setState(state => ({
          alerts
        }));
      }
    } catch (err) {
      console.warn(err);
    }
  };

  _getAlertProperties = (alert: Alert, alertName: string) => {
    switch (alert.slug) {
      case 'umd_as_it_happens': {
        const isRecent =
          alert.date >
          moment()
            .subtract(7, 'days')
            .valueOf();
        return {
          icon: isRecent ? 'gladRecent' : 'glad',
          date: alert.date,
          type: 'alert',
          name: alertName,
          reported: false
        };
      }
      case 'viirs':
      default: {
        return {
          icon: 'viirs',
          date: alert.date,
          type: 'alert',
          name: alertName,
          reported: false
        };
      }
    }
  };

  render() {
    const { isActive, onPress, slug } = this.props;
    const { alerts } = this.state;

    const viirsAlertType = slug === 'viirs';

    if (!isActive || !alerts?.length) {
      return null;
    }

    const alertName = viirsAlertType ? i18n.t('map.viirsAlert') : i18n.t('map.gladAlert');
    const alertFeatures = alerts.map((alert: Alert) => {
      const properties = this._getAlertProperties(alert, alertName);
      return MapboxGL.geoUtils.makePoint([alert.long, alert.lat], properties);
    });
    const alertsFeatureCollection = MapboxGL.geoUtils.makeFeatureCollection(alertFeatures);
    const circleColor = viirsAlertType ? Theme.colors.viirs : Theme.colors.glad;
    return (
      <MapboxGL.ShapeSource
        id={slug + 'alertSource'}
        cluster
        clusterRadius={40}
        shape={alertsFeatureCollection}
        onPress={onPress}
      >
        <MapboxGL.SymbolLayer id={slug + 'pointCount'} style={mapboxStyles.clusterCount} />
        <MapboxGL.CircleLayer
          id={slug + 'clusteredPoints'}
          belowLayerID={slug + 'pointCount'}
          filter={['has', 'point_count']}
          style={{ ...mapboxStyles.clusteredPoints, circleColor }}
        />
        <MapboxGL.SymbolLayer
          id={slug + 'alertLayer'}
          filter={['!', ['has', 'point_count']]}
          style={mapboxStyles.alert}
        />
      </MapboxGL.ShapeSource>
    );
  }
}
