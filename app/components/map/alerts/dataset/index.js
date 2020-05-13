// @flow
import type { Alert, AlertDatasetConfig } from 'types/alerts.types';

import React, { PureComponent } from 'react';

import { mapboxStyles } from './styles';
import MapboxGL from '@react-native-mapbox-gl/maps';
import { type FeatureCollection, type Point, featureCollection, point } from '@turf/helpers';
import i18n from 'i18next';
import _ from 'lodash';
import moment from 'moment';
import queryAlerts from 'helpers/alert-store/queryAlerts';
import generateUniqueID from 'helpers/uniqueId';
import { DATASETS } from 'config/constants';
import { getNeighboursSelected } from 'helpers/map';
import kdbush from 'kdbush';

export type AlertsIndex = {|
  +ids: Array<number>,
  +coords: Array<number>,
  +points: Array<Alert>,
  +nodeSize: number
|};

type AlertProperties = {|
  type: 'alert',
  clusterId: 'reported' | 'recent' | 'other',
  name: string,
  date: number,
  icon: string,
  reported: boolean
|};

type Props = {|
  +areaId?: ?string,
  +isActive: boolean,
  +onPress?: ?() => any,
  +slug: 'umd_as_it_happens' | 'viirs',
  +reportedAlerts: Array<string>,
  +selectedAlerts: Array<Alert>,
  +timeframe: number,
  +timeframeUnit: 'days' | 'months'
|};

type State = {|
  +recentAlerts: FeatureCollection<Point>,
  +reportedAlerts: FeatureCollection<Point>,
  +otherAlerts: FeatureCollection<Point>
|};

/**
 * Displays the alerts corresponding to the specified dataset and other criteria
 */
export default class AlertDataset extends PureComponent<Props, State> {
  activeRequestId: ?string;
  datasets: {
    [string]: AlertDatasetConfig & {
      name: string,
      recencyTimestamp: number
    }
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      recentAlerts: featureCollection([]),
      reportedAlerts: featureCollection([]),
      otherAlerts: featureCollection([]),
      alertsIndex: {},
      alertsFromDb: []
    };

    const now = moment();
    this.datasets = _.mapValues(DATASETS, config => ({
      ...config,
      name: i18n.t(config.nameKey),
      recencyTimestamp: now
        .clone()
        .subtract(config.recencyThreshold, 'days')
        .valueOf()
    }));
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
    } else if (
      this.props.selectedAlerts !== prevProps.selectedAlerts ||
      this.props.reportedAlerts !== prevProps.reportedAlerts
    ) {
      if (this.state.alertsFromDb && this.state.alertsIndex?.nodeSize) {
        // if alerts are already cached - only refresh alert properties
        const updatedAlertState = this._createFeaturesForAlerts(this.state.alertsFromDb, this.state.alertsIndex);

        this.setState({
          ...updatedAlertState
        });
      } else {
        this._loadAlertsFromDb();
      }
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
      recentAlerts: featureCollection([]),
      reportedAlerts: featureCollection([]),
      otherAlerts: featureCollection([])
    });

    if (!isActive) {
      return;
    }

    try {
      const requestId = generateUniqueID();
      this.activeRequestId = requestId;
      const alertsFromDb = await queryAlerts({
        areaId: areaId ?? undefined,
        dataset: slug,
        timeAgo: { max: timeframe, unit: timeframeUnit },
        distinctLocations: true
      });

      const alertsIndex: AlertsIndex = kdbush(alertsFromDb, p => p.long, p => p.lat);
      const updatedAlertState = this._createFeaturesForAlerts(alertsFromDb, alertsIndex);
      if (requestId !== this.activeRequestId) {
        return;
      }

      this.setState({
        alertsFromDb,
        ...updatedAlertState,
        alertsIndex: alertsIndex
      });
    } catch (err) {
      console.warn(err);
    }
  };

  _getAlertProperties = (alert: Alert, selectedNeighbours: Array<Alert>): AlertProperties => {
    const { name, recencyTimestamp, iconPrefix } = this.datasets[alert.slug];
    const reported = this.props.reportedAlerts.includes(`${alert.long}${alert.lat}`);
    const isRecent = alert.date > recencyTimestamp;
    const selected = this._isAlertSelected(alert);
    const alertInClusterSelected = selectedNeighbours.includes(alert);
    const icon = this._getAlertIconName(iconPrefix, isRecent, reported, alertInClusterSelected, selected);
    return {
      // need to pass these as strings as they are rounded in onShapeSourcePressed method.
      lat: '' + alert.lat,
      long: '' + alert.long,
      icon,
      date: alert.date,
      type: 'alert',
      name,
      reported,
      selected,
      clusterId: reported ? 'reported' : isRecent ? 'recent' : 'other'
    };
  };

  _isAlertSelected = (alertToCheck: Alert) => {
    return !!this.props.selectedAlerts.find(
      alert => alert.lat === alertToCheck.lat && alert.long === alertToCheck.long
    );
  };

  _getAlertIconName = (
    iconPrefix: string,
    recent: boolean,
    reported: boolean,
    alertInClusterSelected: boolean,
    selected: boolean
  ) => {
    if (selected) {
      return 'selected';
    }
    let iconName = iconPrefix;
    if (reported) {
      iconName += 'Reported';
    } else if (recent) {
      iconName += 'Recent';
    }

    if (alertInClusterSelected) {
      iconName += 'Selected';
    }
    return iconName;
  };

  _createFeaturesForAlerts = (alerts: Array<Alert>, alertsIndex: AlertsIndex): State => {
    const selectedNeighbours = getNeighboursSelected(alertsIndex, this.props.selectedAlerts, alerts);
    const alertFeatures = alerts.map((alert: Alert) => {
      const properties = this._getAlertProperties(alert, selectedNeighbours);
      return point([alert.long, alert.lat], properties);
    });
    const alertsGroupedByCluster = _.groupBy(alertFeatures, feature => feature.properties?.['clusterId']);
    return {
      recentAlerts: featureCollection(alertsGroupedByCluster.recent ?? []),
      reportedAlerts: featureCollection(alertsGroupedByCluster.reported ?? []),
      otherAlerts: featureCollection(alertsGroupedByCluster.other ?? [])
    };
  };

  render() {
    // As tempted as you may be to make this function conditionally return `null` based on the
    // isActive prop, this causes issues with enabling/disabling alert types on iOS so please don't!
    const { slug } = this.props;

    const { recentAlerts, reportedAlerts, otherAlerts } = this.state;
    const { color, colorReported, colorRecent } = this.datasets[slug] ?? {};

    return (
      <React.Fragment>
        {this.renderCluster(`${slug}ReportedAlerts`, colorReported, reportedAlerts)}
        {this.renderCluster(`${slug}RecentAlerts`, colorRecent, recentAlerts, slug === 'umd_as_it_happens')}
        {this.renderCluster(`${slug}OtherAlerts`, color, otherAlerts)}
      </React.Fragment>
    );
  }

  renderCluster = (
    clusterName: string,
    clusterColor: any,
    alerts: FeatureCollection<Point>,
    darkTextOnCluster: boolean = false
  ) => {
    const idShapeSource = `${clusterName}Source`;
    const idClusterCountSymbolLayer = `${clusterName}PointCount`;
    const idClusterCircleLayer = `${clusterName}ClusteredPoints`;
    const idAlertSymbolLayer = `${clusterName}AlertLayer`;

    const clusterCountStyle = {
      ...mapboxStyles.clusterCount,
      ...(darkTextOnCluster ? mapboxStyles.darkTextClusterCount : {})
    };

    return (
      <MapboxGL.ShapeSource
        id={idShapeSource}
        cluster
        clusterRadius={120}
        clusterMaxZoomLevel={15}
        shape={alerts}
        onPress={this.props.onPress}
      >
        <MapboxGL.SymbolLayer id={idClusterCountSymbolLayer} style={clusterCountStyle} />
        <MapboxGL.CircleLayer
          id={idClusterCircleLayer}
          belowLayerID={idClusterCountSymbolLayer}
          filter={['has', 'point_count']}
          style={{ ...mapboxStyles.clusteredPoints, circleColor: clusterColor }}
        />
        <MapboxGL.SymbolLayer
          id={idAlertSymbolLayer}
          filter={['!', ['has', 'point_count']]}
          style={mapboxStyles.alert}
        />
      </MapboxGL.ShapeSource>
    );
  };
}
