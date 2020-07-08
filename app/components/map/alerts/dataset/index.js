// @flow
import type { Alert, AlertDatasetConfig, SelectedAlert } from 'types/alerts.types';
import type { AlertFeatureProperties, Coordinates, MapboxFeaturePressEvent } from 'types/common.types';

import React, { PureComponent } from 'react';

import { mapboxStyles } from './styles';
import MapboxGL from '@react-native-mapbox-gl/maps';
import { type FeatureCollection, type Point, featureCollection, point } from '@turf/helpers';
import i18n from 'i18next';
import _ from 'lodash';
import moment from 'moment';
import queryAlerts from 'helpers/alert-store/queryAlerts';
import generateUniqueID from 'helpers/uniqueId';
import { DATASETS, MAP_LAYER_INDEXES } from 'config/constants';
import { getNeighboursSelected } from 'helpers/map';
import kdbush from 'kdbush';

// eslint-disable-next-line import/no-unused-modules
export type AlertsIndex = {|
  +ids: Array<number>,
  +coords: Array<number>,
  +points: Array<Alert>,
  +nodeSize: number
|};

type Props = {|
  +areaId?: ?string,
  +isActive: boolean,
  +onPress?: ?(MapboxFeaturePressEvent<AlertFeatureProperties>) => any,
  +slug: 'umd_as_it_happens' | 'viirs',
  +reportedAlerts: $ReadOnlyArray<Coordinates>,
  +selectedAlerts: $ReadOnlyArray<SelectedAlert>,
  +timeframe: number,
  +timeframeUnit: 'days' | 'months'
|};

type FeatureCollectionState = {|
  +recentAlerts: FeatureCollection<Point>,
  +reportedAlerts: FeatureCollection<Point>,
  +otherAlerts: FeatureCollection<Point>
|};

type State = {|
  ...FeatureCollectionState,
  +alertsIndex: ?AlertsIndex,
  +alertsFromDb: Array<Alert>
|};

const initalState = {
  recentAlerts: featureCollection([]),
  reportedAlerts: featureCollection([]),
  otherAlerts: featureCollection([]),
  alertsIndex: null,
  alertsFromDb: []
};

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
    this.state = initalState;

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
      if (this.state.alertsFromDb?.length && this.state.alertsIndex?.nodeSize) {
        if (!this.props.isActive) {
          return;
        }
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
  _loadAlertsFromDb = () => {
    const { areaId, isActive, slug, timeframe, timeframeUnit } = this.props;

    // Reset the data in state before retrieving the updated data
    this.setState(initalState);

    if (!isActive) {
      return;
    }

    try {
      const requestId = generateUniqueID();
      this.activeRequestId = requestId;
      const alertsFromDb = queryAlerts({
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

  _getAlertProperties = (alert: Alert, selectedNeighbours: $ReadOnlyArray<Alert>): AlertFeatureProperties => {
    const { name, recencyTimestamp, iconPrefix } = this.datasets[alert.slug];
    const reported = this.props.reportedAlerts.some(
      coordinates => coordinates.latitude === alert.lat && coordinates.longitude === alert.long
    );
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
      clusterId: reported ? 'reported' : isRecent ? 'recent' : 'other',
      datasetId: alert.slug
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

  _createFeaturesForAlerts = (alerts: Array<Alert>, alertsIndex: AlertsIndex): FeatureCollectionState => {
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
        <MapboxGL.SymbolLayer
          id={idClusterCountSymbolLayer}
          style={clusterCountStyle}
          layerIndex={MAP_LAYER_INDEXES.alerts}
        />
        <MapboxGL.CircleLayer
          id={idClusterCircleLayer}
          belowLayerID={idClusterCountSymbolLayer}
          filter={['has', 'point_count']}
          style={{ ...mapboxStyles.clusteredPoints, circleColor: clusterColor }}
          layerIndex={MAP_LAYER_INDEXES.alerts}
        />
        <MapboxGL.SymbolLayer
          id={idAlertSymbolLayer}
          filter={['!', ['has', 'point_count']]}
          style={mapboxStyles.alert}
          layerIndex={MAP_LAYER_INDEXES.alerts}
        />
      </MapboxGL.ShapeSource>
    );
  };
}
