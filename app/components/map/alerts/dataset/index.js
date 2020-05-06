// @flow
import type { Alert } from 'types/alerts.types';

import React, { Component } from 'react';

import Theme from 'config/theme';
import { mapboxStyles } from './styles';
import MapboxGL from '@react-native-mapbox-gl/maps';
import { type FeatureCollection, type Point, featureCollection, point } from '@turf/helpers';
import i18n from 'i18next';
import moment from 'moment';
import queryAlerts from 'helpers/alert-store/queryAlerts';
import generateUniqueID from 'helpers/uniqueId';

type Props = {|
  +areaId?: ?string,
  +isActive: boolean,
  +onPress?: ?() => any,
  +slug: 'umd_as_it_happens' | 'viirs',
  +timeframe: number,
  +timeframeUnit: 'days' | 'months'
|};

type State = {|
  +alertsFeatures: FeatureCollection<Point>
|};

/**
 * Displays the alerts corresponding to the specified dataset and other criteria
 */
export default class AlertDataset extends Component<Props, State> {
  activeRequestId: ?string;
  datasets: {
    [string]: {
      recencyThreshold: number,
      name: string
    }
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      alertsFeatures: featureCollection([])
    };

    const now = moment();
    this.datasets = {
      umd_as_it_happens: {
        recencyThreshold: now.subtract(7, 'days').valueOf(),
        name: i18n.t('map.gladAlert')
      },
      viirs: {
        recencyThreshold: now.subtract(0, 'days').valueOf(),
        name: i18n.t('map.viirsAlert')
      }
    };
  }

  componentDidMount() {
    this._loadAlertsFromDb();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (
      this.props.slug !== prevProps.slug ||
      this.props.isActive !== prevProps.isActive ||
      this.props.timeframe !== prevProps.timeframe ||
      this.props.timeframeUnit !== prevProps.timeframeUnit ||
      this.props.areaId !== prevProps.areaId
    ) {
      this._loadAlertsFromDb();
    }
  }

  /**
   * Updates component state so that it holds the alerts from the local DB matching the constraints imposed by the
   * component props
   */
  _loadAlertsFromDb = async () => {
    const { areaId, isActive, slug, timeframe, timeframeUnit } = this.props;

    // Reset the data in state before retrieving the updated data
    this.setState({
      alertsFeatures: featureCollection([])
    });

    if (!isActive) {
      return;
    }

    try {
      const requestId = generateUniqueID();
      this.activeRequestId = requestId;
      const alerts = await queryAlerts({
        areaId: areaId ?? undefined,
        dataset: slug,
        timeAgo: { max: timeframe, unit: timeframeUnit },
        distinctLocations: true
      });
      const alertFeatures = this._createFeaturesForAlerts(alerts);

      if (requestId !== this.activeRequestId) {
        return;
      }

      this.setState({
        alertsFeatures: alertFeatures
      });
    } catch (err) {
      console.warn(err);
    }
  };

  _getAlertProperties = (alert: Alert) => {
    const alertName = this.datasets[alert.slug]?.name;
    switch (alert.slug) {
      case 'umd_as_it_happens': {
        const isRecent = alert.date > this.datasets[alert.slug].recencyThreshold;
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

  _createFeaturesForAlerts = (alerts: Array<Alert>) => {
    const alertFeatures = alerts.map((alert: Alert) => {
      const properties = this._getAlertProperties(alert);
      return point([alert.long, alert.lat], properties);
    });
    return featureCollection(alertFeatures);
  };

  render() {
    const { isActive, onPress, slug } = this.props;

    const viirsAlertType = slug === 'viirs';

    if (!isActive || !this.state.alertsFeatures) {
      return null;
    }

    const circleColor = viirsAlertType ? Theme.colors.viirs : Theme.colors.glad;
    return (
      <MapboxGL.ShapeSource
        id={slug + 'alertSource'}
        cluster
        clusterRadius={120}
        clusterMaxZoomLevel={15}
        shape={this.state.alertsFeatures}
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
