// @flow
import type { Alert } from 'types/alerts.types';
import type { MapItemFeatureProperties } from 'types/common.types';
import type { ViewStyle } from 'types/reactElementStyles.types';

import React, { Component } from 'react';
import {
  Image,
  Platform,
  Text,
  TouchableHighlight,
  TouchableNativeFeedback,
  View,
  ActivityIndicator
} from 'react-native';
import ActionButton from 'components/common/action-button';
import styles from './styles';
import Theme from 'config/theme';
import debounceUI from 'helpers/debounceUI';
import { Navigation } from 'react-native-navigation';
import { formatInfoBannerDates } from 'helpers/date';
import { formatSelectedAlertTypeCounts, formatSelectedAlertCategories } from 'helpers/map';
import i18n from 'i18next';
import { trackSelectAllConnectedAlerts } from 'helpers/analytics';

const rightArrow = require('assets/next.png');

type Props = {
  connectedAlerts: $ReadOnlyArray<Alert>,
  highlightedAlerts: $ReadOnlyArray<Alert>,
  onSelectAllConnectedAlertsPress: ($ReadOnlyArray<Alert>) => void,
  tappedOnFeatures: $ReadOnlyArray<MapItemFeatureProperties>,
  style: ViewStyle,
  loading: boolean
};

export default class InfoBanner extends Component<Props> {
  openRoute = (routeId: string, routeName: string) => {
    Navigation.showModal({
      stack: {
        children: [
          {
            component: {
              name: 'ForestWatcher.RouteDetail',
              passProps: {
                routeId,
                routeName
              }
            }
          }
        ]
      }
    });
  };

  openReport = (reportName: string) => {
    Navigation.showModal({
      stack: {
        children: [
          {
            component: {
              name: 'ForestWatcher.Answers',
              passProps: {
                reportName,
                readOnly: true
              }
            }
          }
        ]
      }
    });
  };

  onPress = debounceUI(() => {
    const { tappedOnFeatures } = this.props;
    if (tappedOnFeatures.length === 0) {
      return;
    }
    if (tappedOnFeatures.length === 1) {
      const feature = tappedOnFeatures[0];
      switch (feature.type) {
        case 'route': {
          this.openRoute(feature.featureId, feature.name);
          break;
        }
        case 'report': {
          this.openReport(feature.featureId);
          break;
        }
        default: {
          break;
        }
      }
    } else {
      const reportFeatures = tappedOnFeatures.filter(feature => feature.type === 'report');
      if (reportFeatures.length !== 0) {
        Navigation.showModal({
          stack: {
            children: [
              {
                component: {
                  name: 'ForestWatcher.MultipleItems',
                  passProps: {
                    tappedOnFeatures: reportFeatures
                  }
                }
              }
            ]
          }
        });
      }
    }
  });

  onSelectAllConnectedAlertsPress = () => {
    trackSelectAllConnectedAlerts(this.props.highlightedAlerts);
    this.props.onSelectAllConnectedAlertsPress(this.props.highlightedAlerts);
  };

  render() {
    const { connectedAlerts, tappedOnFeatures, highlightedAlerts } = this.props;
    if (tappedOnFeatures.length === 0) {
      return null;
    }
    const Touchable = Platform.select({
      android: TouchableNativeFeedback,
      ios: TouchableHighlight
    });
    let title,
      subtitle,
      secondarySubtitle,
      showRightArrow,
      showSelectAllConnectedAlerts = false,
      selectAllConnectedAlertsEnabled = false;
    if (tappedOnFeatures.length === 1) {
      const { name, confidence, date, type } = tappedOnFeatures[0];
      const isAlert = type === 'alert';
      // Show select all if there are any highlighted alerts as this means
      // there are more alerts to be selected
      showSelectAllConnectedAlerts = isAlert && highlightedAlerts.length > 0 && connectedAlerts.length > 0;
      selectAllConnectedAlertsEnabled = highlightedAlerts.length > 0;
      title = isAlert ? formatSelectedAlertCategories(tappedOnFeatures) : name ?? '';
      subtitle = isAlert
        ? i18n.t('map.selectedItems.alertSubtitle', {
            alerts: formatSelectedAlertTypeCounts(tappedOnFeatures),
            date: formatInfoBannerDates([date], [type])
          })
        : formatInfoBannerDates([date], [type]);
      showRightArrow = type === 'route' || type === 'report';
      if (type === 'alert' && confidence === 'high') {
        secondarySubtitle = i18n.t('map.selectedItems.highConfidenceAlert');
      }
    } else {
      const tappedItemsAreExclusivelyAlerts = !tappedOnFeatures.find(feature => feature.type !== 'alert');
      showRightArrow = !tappedItemsAreExclusivelyAlerts;
      title = tappedItemsAreExclusivelyAlerts
        ? formatSelectedAlertCategories(tappedOnFeatures)
        : i18n.t('map.selectedItems.multipleItems');

      if (tappedItemsAreExclusivelyAlerts) {
        subtitle = i18n.t('map.selectedItems.alertSubtitle', {
          alerts: formatSelectedAlertTypeCounts(tappedOnFeatures),
          date: formatInfoBannerDates(
            tappedOnFeatures.map(feature => feature.date),
            tappedOnFeatures.map(feature => feature.type)
          )
        });
        showSelectAllConnectedAlerts = connectedAlerts.length > 0;
        selectAllConnectedAlertsEnabled = highlightedAlerts.length > 0;
        const highConfidenceAlerts = tappedOnFeatures.filter(feature => feature.confidence === 'high');
        if (highConfidenceAlerts.length !== 0) {
          secondarySubtitle = i18n.t(
            highConfidenceAlerts.length === tappedOnFeatures.length
              ? 'map.selectedItems.allHighConfidenceAlerts'
              : 'map.selectedItems.someHighConfidenceAlerts'
          );
        }
      } else {
        // TODO: Investigate if it's possible to get here any more!
        const reportCount = tappedOnFeatures.filter(feature => feature.type === 'report').length;
        const reportString = i18n.t(
          reportCount === 1 ? 'map.selectedItems.oneReport' : 'map.selectedItems.manyReports',
          {
            count: reportCount
          }
        );
        const alertCount = tappedOnFeatures.filter(feature => feature.type === 'alert').length;
        const alertString = i18n.t(alertCount === 1 ? 'map.selectedItems.oneAlert' : 'map.selectedItems.manyAlerts', {
          count: alertCount
        });
        if (reportCount) {
          subtitle = alertCount ? `${reportString}, ${alertString}` : reportString;
        } else {
          subtitle = alertCount ? alertString : '';
        }
      }
    }
    return (
      <Touchable
        background={Platform.select({
          android: TouchableNativeFeedback.Ripple(Theme.background.gray),
          ios: undefined
        })}
        underlayColor="transparent"
        onPress={this.onPress}
      >
        <View style={[styles.container, this.props.style]}>
          <View style={[styles.topContainer, showSelectAllConnectedAlerts ? { paddingBottom: 8 } : null]}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
              {secondarySubtitle && <Text style={styles.subtitle}>{secondarySubtitle}</Text>}
            </View>
            {showRightArrow && <Image source={rightArrow} />}
            {this.props.loading && <ActivityIndicator color={Theme.colors.turtleGreen} size="small" />}
          </View>
          {showSelectAllConnectedAlerts && (
            <View style={styles.actionContainer}>
              <ActionButton
                disabled={!selectAllConnectedAlertsEnabled}
                compact
                onPress={this.onSelectAllConnectedAlertsPress}
                style={[
                  styles.buttonContainer,
                  !selectAllConnectedAlertsEnabled ? { borderColor: Theme.colors.veryLightPinkTwo } : null
                ]}
                textStyle={[styles.buttonText, !selectAllConnectedAlertsEnabled ? { color: 'white' } : null]}
                noIcon
                text={i18n.t('map.selectedItems.selectAll')}
              />
            </View>
          )}
        </View>
      </Touchable>
    );
  }
}
