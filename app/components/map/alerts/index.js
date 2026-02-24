// @flow

import type { AlertLayerSettingsType } from 'types/layerSettings.types';
import type { Alert, SelectedAlert } from 'types/alerts.types';
import type { AlertFeatureProperties, Coordinates, MapboxFeaturePressEvent } from 'types/common.types';

import React, { Component } from 'react';

import { View } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import AlertDatasetCategory from 'components/map/alerts/dataset-category';
import type { AssignmentLocation } from 'types/assignments.types';

type Props = {|
  +alertLayerSettings: AlertLayerSettingsType,
  +areaId?: ?string,
  +reportedAlerts: $ReadOnlyArray<Coordinates>,
  +selectedAlerts: $ReadOnlyArray<SelectedAlert>,
  +onShapeSourcePressed?: (MapboxFeaturePressEvent<AlertFeatureProperties>) => void,
  +onHighlightedAlertsChanged?: ($ReadOnlyArray<Alert>, $ReadOnlyArray<Alert>) => void,
  +setLoading?: (loading: boolean) => void,
  +preSelectedAlerts?: ?Array<AssignmentLocation>
|};

type State = {|
  +highlightedAlerts: $ReadOnlyArray<Coordinates>
|};

export default class Alerts extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      /*
       * The alerts highlighted by any directly bordering selected alerts
       * this does not include alerts highlighted by alerts that are highlighted
       * in different dataset categories
       */
      highlightedAlerts: []
    };
  }

  highlightAlerts() {
    const { selectedAlerts } = this.props;
    let highlightedAlerts = [];
    if (this.refs.firesCategory) {
      highlightedAlerts = highlightedAlerts.concat(this.refs.firesCategory.getHighlightedAlerts(selectedAlerts));
    }
    if (this.refs.deforestationCategory) {
      highlightedAlerts = highlightedAlerts.concat(
        this.refs.deforestationCategory.getHighlightedAlerts(selectedAlerts)
      );
    }
    // Need to use the highlighted alerts array to fetch the cross category
    // connected alerts because alerts can be highlighted due to being
    // contiguous with other alerts that are highlighted in a seperate category
    let connectedAlerts = [];
    const highlightedAndSelectedAlerts = highlightedAlerts.concat(selectedAlerts);

    if (this.refs.firesCategory) {
      connectedAlerts = connectedAlerts.concat(
        this.refs.firesCategory.getHighlightedAlerts(highlightedAndSelectedAlerts)
      );
    }
    if (this.refs.deforestationCategory) {
      connectedAlerts = connectedAlerts.concat(
        this.refs.deforestationCategory.getHighlightedAlerts(highlightedAndSelectedAlerts)
      );
    }

    const selectedAlertIds = selectedAlerts.map(alert => (alert.slug || alert.datasetId) + alert.lat + alert.long);

    // Make sure highlighted alerts doesn't include already selected alerts!
    const crossCategoryHighlightedAlerts = connectedAlerts.filter(alert => {
      const alertId = (alert.slug || alert.datasetId) + alert.lat + alert.long;
      return !selectedAlertIds.includes(alertId);
    });
    highlightedAlerts = highlightedAlerts.filter(alert => {
      const alertId = (alert.slug || alert.datasetId) + alert.lat + alert.long;
      return !selectedAlertIds.includes(alertId);
    });
    this.props.onHighlightedAlertsChanged(crossCategoryHighlightedAlerts, connectedAlerts);
    this.props.setLoading?.(false);
    this.setState({ highlightedAlerts });
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.props.selectedAlerts !== prevProps.selectedAlerts) {
      this.props.setLoading?.(true);
      /* Allow for the loading state to reach the destination
       * A better approach would be to make highlightAlerts asychronous */
      setTimeout(() => this.highlightAlerts(), 500);
    }
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
            deforestation: require('assets/alertMapIcons/deforestationAlertMapIcon.png'),
            deforestationSelected: require('assets/alertMapIcons/deforestationSelectedAlertMapIcon.png'),
            deforestationReported: require('assets/alertMapIcons/deforestationReportedAlertMapIcon.png'),
            deforestationReportedSelected: require('assets/alertMapIcons/deforestationReportedSelectedAlertMapIcon.png'),
            fires: require('assets/alertMapIcons/firesAlertMapIcon.png'),
            firesSelected: require('assets/alertMapIcons/firesSelectedAlertMapIcon.png'),
            firesReported: require('assets/alertMapIcons/firesReportedAlertMapIcon.png'),
            firesReportedSelected: require('assets/alertMapIcons/firesReportedSelectedAlertMapIcon.png'),
            selected: require('assets/alertMapIcons/selectedAlertMapIcon.png'),
            assigment: require('assets/alertMapIcons/assignments_marker.png'),
            assignmentSelected: require('assets/alertMapIcons/assignments_selected_marker.png')
          }}
        />
        <AlertDatasetCategory
          activeSlugs={this.props.alertLayerSettings.fires.activeSlugs}
          key={'fires'}
          categoryId={'fires'}
          areaId={this.props.areaId}
          timeframe={this.props.alertLayerSettings.fires.timeFrame}
          onPress={this.props.onShapeSourcePressed}
          reportedAlerts={this.props.reportedAlerts}
          selectedAlerts={this.props.selectedAlerts}
          highlightedAlerts={this.state.highlightedAlerts}
          preSelectedAlerts={this.props.preSelectedAlerts}
          ref={'firesCategory'}
        />
        <AlertDatasetCategory
          activeSlugs={this.props.alertLayerSettings.deforestation.activeSlugs}
          key={'deforestation'}
          categoryId={'deforestation'}
          areaId={this.props.areaId}
          timeframe={this.props.alertLayerSettings.deforestation.timeFrame}
          onPress={this.props.onShapeSourcePressed}
          reportedAlerts={this.props.reportedAlerts}
          selectedAlerts={this.props.selectedAlerts}
          highlightedAlerts={this.state.highlightedAlerts}
          preSelectedAlerts={this.props.preSelectedAlerts}
          ref={'deforestationCategory'}
        />
      </View>
    );
  }
}
