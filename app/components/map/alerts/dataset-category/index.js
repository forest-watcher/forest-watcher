// @flow
import type { Alert, AlertDatasetConfig, SelectedAlert } from 'types/alerts.types';
import type { AlertFeatureProperties, Coordinates, MapboxFeaturePressEvent } from 'types/common.types';

import React, { PureComponent } from 'react';

import { mapboxStyles } from './styles';
import MapboxGL from '@react-native-mapbox-gl/maps';
import { type FeatureCollection, type Point, featureCollection, point } from '@turf/helpers';
import i18n from 'i18next';
import _ from 'lodash';
import queryAlerts from 'helpers/alert-store/queryAlerts';
import generateUniqueID from 'helpers/uniqueId';
import { DATASETS, DATASET_CATEGORIES, MAP_LAYER_INDEXES } from 'config/constants';
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
  +activeSlugs: Array<string>,
  +onPress?: ?(MapboxFeaturePressEvent<AlertFeatureProperties>) => any,
  +categoryId: 'fires' | 'deforestation',
  +reportedAlerts: $ReadOnlyArray<Coordinates>,
  +selectedAlerts: $ReadOnlyArray<SelectedAlert>,
  +highlightedAlerts: $ReadOnlyArray<Alert>,
  +timeframe: FilterThreshold
|};

type FeatureCollectionState = {|
  +reportedAlerts: FeatureCollection<Point>,
  +otherAlerts: FeatureCollection<Point>
|};

type State = {|
  ...FeatureCollectionState,
  +alertsIndex: ?AlertsIndex,
  +alertsFromDb: Array<Alert>
|};

const initalState = {
  reportedAlerts: featureCollection([]),
  otherAlerts: featureCollection([]),
  alertsIndex: null,
  alertsFromDb: []
};

/**
 * Displays the alerts corresponding to the specified dataset category and other criteria
 */
export default class AlertDatasetCategory extends PureComponent<Props, State> {
  activeRequestId: ?string;
  datasets: {
    [string]: AlertDatasetConfig & {
      name: string
    }
  };

  constructor(props: Props) {
    super(props);
    this.state = initalState;
    this.datasets = _.mapValues(DATASETS, config => ({
      ...config,
      name: i18n.t(config.nameKey)
    }));
  }

  componentDidMount() {
    this._loadAlertsFromDb();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (
      this.props.categoryId !== prevProps.categoryId ||
      this.props.timeframe.value !== prevProps.timeframe.value ||
      this.props.timeframe.units !== prevProps.timeframe.units ||
      this.props.areaId !== prevProps.areaId ||
      !_.isEqual(this.props.activeSlugs.sort(), prevProps.activeSlugs.sort())
    ) {
      this._loadAlertsFromDb();
    } else if (
      this.props.selectedAlerts !== prevProps.selectedAlerts ||
      this.props.reportedAlerts !== prevProps.reportedAlerts ||
      this.props.highlightedAlerts !== prevProps.highlightedAlerts
    ) {
      if (this.state.alertsFromDb?.length && this.state.alertsIndex?.nodeSize) {
        if (this.props.activeSlugs.length === 0) {
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
    const { activeSlugs, areaId, categoryId, timeframe } = this.props;

    const datasetCategory = DATASET_CATEGORIES[categoryId];
    if (!datasetCategory) {
      return;
    }
    // Reset the data in state before retrieving the updated data
    this.setState(initalState);

    if (this.props.activeSlugs.length === 0) {
      return;
    }

    try {
      const requestId = generateUniqueID();
      this.activeRequestId = requestId;
      const alertsFromDb = queryAlerts({
        areaId: areaId ?? undefined,
        dataset: activeSlugs.length > 1 ? null : activeSlugs[0],
        datasets: activeSlugs.length > 1 ? activeSlugs : null,
        timeAgo: { max: timeframe.value, unit: timeframe.units },
        limitAlerts: true,
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

  getHighlightedAlerts: (selectedAlerts: $ReadOnlyArray<SelectedAlert>) => $ReadOnlyArray<Alert> = (
    selectedAlerts: $ReadOnlyArray<SelectedAlert>
  ): $ReadOnlyArray<Alert> => {
    if (!this.state.alertsIndex) {
      return [];
    }
    const allAlerts = [...(this.state.alertsFromDb ?? [])];
    const selectedNeighbours = getNeighboursSelected(this.state.alertsIndex, selectedAlerts, allAlerts);
    return selectedNeighbours;
  };

  _getAlertProperties = (alert: Alert, selectedNeighbours: $ReadOnlyArray<Alert>): AlertFeatureProperties => {
    const { categoryId } = this.props;
    const datasetCategory = DATASET_CATEGORIES[categoryId];
    const { iconPrefix } = datasetCategory;

    const { name, minIconSize, maxIconSize, sortKey } = this.datasets[alert.slug];

    const reported = this.props.reportedAlerts.some(
      coordinates => coordinates.latitude === alert.lat && coordinates.longitude === alert.long
    );
    const selected = this._isAlertSelected(alert);
    const alertInClusterSelected = selectedNeighbours.includes(alert);
    const icon = this._getAlertIconName(iconPrefix, reported, alertInClusterSelected, selected);
    // Icon size has to be defined here and pulled out in style using expressions
    // because all alerts are rendered by the same SymbolLayer
    return {
      // need to pass these as strings as they are rounded in onShapeSourcePressed method.
      lat: '' + alert.lat,
      long: '' + alert.long,
      icon,
      confidence: alert.confidence,
      date: alert.date,
      type: 'alert',
      name,
      reported,
      selected,
      clusterId: reported ? 'reported' : 'other',
      datasetId: alert.slug,
      minIconSize,
      maxIconSize,
      sortKey
    };
  };

  _isAlertSelected = (alertToCheck: Alert) => {
    return !!this.props.selectedAlerts.find(
      alert => alert.lat === alertToCheck.lat && alert.long === alertToCheck.long
    );
  };

  _getAlertIconName = (iconPrefix: string, reported: boolean, alertInClusterSelected: boolean, selected: boolean) => {
    if (selected) {
      return 'selected';
    }
    let iconName = iconPrefix;
    if (reported) {
      iconName += 'Reported';
    }

    if (alertInClusterSelected) {
      iconName += 'Selected';
    }
    return iconName;
  };

  _createFeaturesForAlerts = (alerts: Array<Alert>, alertsIndex: AlertsIndex): FeatureCollectionState => {
    const selectedNeighbours = this.props.selectedAlerts;
    const alertFeatures = alerts.map((alert: Alert) => {
      const properties = this._getAlertProperties(alert, selectedNeighbours);
      return point([alert.long, alert.lat], properties);
    });
    const alertsGroupedByCluster = _.groupBy(alertFeatures, feature => feature.properties?.['clusterId']);
    return {
      reportedAlerts: featureCollection(alertsGroupedByCluster.reported ?? []),
      otherAlerts: featureCollection(alertsGroupedByCluster.other ?? [])
    };
  };

  render() {
    // As tempted as you may be to make this function conditionally return `null` based on the
    // activeSlugs prop, this causes issues with enabling/disabling alert types on iOS so please don't!
    const { categoryId } = this.props;

    const { reportedAlerts, otherAlerts } = this.state;
    const { color, colorReported } = DATASET_CATEGORIES[categoryId] ?? {};

    return (
      <React.Fragment>
        {this.renderCluster(`${categoryId}ReportedAlerts`, colorReported, reportedAlerts)}
        {this.renderCluster(`${categoryId}OtherAlerts`, color, otherAlerts)}
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
