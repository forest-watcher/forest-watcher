// @flow
import type { Alert, SelectedAlert } from 'types/alerts.types';
import type { MapItemFeatureProperties } from 'types/common.types';
import type { SelectedReport } from 'types/reports.types';
import type { LocationPoint } from 'types/routes.types';

import React, { Component } from 'react';
import { Animated, View } from 'react-native';

import CircleButton from 'components/common/circle-button';
import InfoBanner from 'components/map/info-banner';
import LocationErrorBanner from 'components/map/locationErrorBanner';

import { withSafeArea } from 'react-native-safe-area';
const FooterSafeAreaView = withSafeArea(View, 'margin', 'bottom');
const FooterBackgroundSafeAreaView = withSafeArea(View, 'padding', 'bottom');

const startTrackingIcon = require('assets/startTracking.png');
const stopTrackingIcon = require('assets/stopTracking.png');
const myLocationIcon = require('assets/my_location.png');
const createReportIcon = require('assets/createReport.png');
const addLocationIcon = require('assets/add_location.png');
const cancelIcon = require('assets/cancel.png');

import styles from './styles';

type Props = {|
  animatedPosition: Animated.Value,
  customReporting: boolean,
  isRouteTracking: boolean,
  locationError: ?number,
  onCustomReportingPress: () => void,
  onReportSelectionPress: () => void,
  onSelectAllConnectedAlertsPress: ($ReadOnlyArray<Alert>) => void,
  onSelectionCancelPress: () => void,
  onStartTrackingPress: () => void,
  onStopTrackingPress: () => void,
  onZoomToUserLocationPress: () => void,
  connectedAlerts: $ReadOnlyArray<SelectedAlert>,
  highlightedAlerts: $ReadOnlyArray<Alert>,
  selectedAlerts: $ReadOnlyArray<SelectedAlert>,
  selectedReports: $ReadOnlyArray<SelectedReport>,
  tappedOnFeatures: $ReadOnlyArray<MapItemFeatureProperties>,
  userLocation: ?LocationPoint,
  loading: boolean
|};

export default class MapFooter extends Component<Props> {
  renderButtonPanel() {
    const {
      animatedPosition,
      connectedAlerts,
      customReporting,
      isRouteTracking,
      userLocation,
      locationError,
      selectedAlerts,
      highlightedAlerts,
      selectedReports,
      tappedOnFeatures,
      onReportSelectionPress,
      onCustomReportingPress,
      onZoomToUserLocationPress,
      onSelectionCancelPress,
      onStartTrackingPress,
      onStopTrackingPress,
      onSelectAllConnectedAlertsPress
    } = this.props;
    const hasAlertsSelected = selectedAlerts && selectedAlerts.length > 0;
    const hasReportSelected = selectedReports?.length;
    const canReport = hasAlertsSelected || hasReportSelected || customReporting;

    // To fix the missing signal text overflow rendering in reverse row
    // last to render will be on top of the others
    return (
      <React.Fragment>
        <LocationErrorBanner
          style={styles.locationErrorBanner}
          locationError={locationError}
          mostRecentLocationTime={userLocation?.timestamp}
        />
        <Animated.View style={{ transform: [{ translateY: animatedPosition }] }}>
          <InfoBanner
            style={styles.infoBanner}
            tappedOnFeatures={tappedOnFeatures}
            connectedAlerts={connectedAlerts}
            highlightedAlerts={highlightedAlerts}
            onSelectAllConnectedAlertsPress={onSelectAllConnectedAlertsPress}
            loading={this.props.loading}
          />
        </Animated.View>
        <View style={styles.buttonPanel}>
          {canReport ? (
            <CircleButton shouldFillContainer onPress={onReportSelectionPress} light icon={createReportIcon} />
          ) : (
            <CircleButton shouldFillContainer onPress={onCustomReportingPress} icon={addLocationIcon} />
          )}
          {userLocation ? (
            <CircleButton shouldFillContainer onPress={onZoomToUserLocationPress} light icon={myLocationIcon} />
          ) : null}
          {canReport ? (
            <CircleButton shouldFillContainer onPress={onSelectionCancelPress} light icon={cancelIcon} />
          ) : null}
          {isRouteTracking || canReport ? (
            <CircleButton
              shouldFillContainer
              onPress={isRouteTracking ? onStopTrackingPress : onStartTrackingPress}
              light
              icon={isRouteTracking ? stopTrackingIcon : startTrackingIcon}
            />
          ) : null}
        </View>
      </React.Fragment>
    );
  }

  render() {
    return [
      <FooterBackgroundSafeAreaView key="bg" pointerEvents="none" style={styles.footerBGContainer}>
        <View style={styles.buttonPanelTray} />
      </FooterBackgroundSafeAreaView>,
      <FooterSafeAreaView key="footer" pointerEvents="box-none" style={styles.footer}>
        {this.renderButtonPanel()}
      </FooterSafeAreaView>
    ];
  }
}
