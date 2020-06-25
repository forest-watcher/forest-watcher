// @flow
import type { ViewStyle } from 'types/reactElementStyles.types';

import React, { Component } from 'react';
import { Image, Platform, Text, TouchableHighlight, TouchableNativeFeedback, View } from 'react-native';
import styles from './styles';
import Theme from 'config/theme';
import debounceUI from 'helpers/debounceUI';
import { Navigation } from 'react-native-navigation';
import { formatInfoBannerDate } from 'helpers/date';
import i18n from 'i18next';

const rightArrow = require('assets/next.png');

type Props = {
  tappedOnFeatures: Array<{
    date: number,
    name: string,
    type: string,
    featureId: string,
    lat?: string,
    long?: string,
    reportAreaName?: string
  }>,
  style: ViewStyle
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
      const { type, name, featureId } = tappedOnFeatures[0];
      if (type === 'route') {
        this.openRoute(featureId, name);
      } else if (type === 'report') {
        this.openReport(featureId);
      }
    } else {
      Navigation.showModal({
        stack: {
          children: [
            {
              component: {
                name: 'ForestWatcher.MultipleItems',
                passProps: {
                  tappedOnFeatures
                }
              }
            }
          ]
        }
      });
    }
  });

  render() {
    const { tappedOnFeatures } = this.props;
    if (tappedOnFeatures.length === 0) {
      return null;
    }
    const Touchable = Platform.select({
      android: TouchableNativeFeedback,
      ios: TouchableHighlight
    });
    let title, subtitle, showRightArrow;
    if (tappedOnFeatures.length === 1) {
      const { name, date, type } = tappedOnFeatures[0];
      title = name ?? '';
      subtitle = formatInfoBannerDate(date, type);
      showRightArrow = type === 'route' || type === 'report';
    } else {
      showRightArrow = true;
      title = i18n.t('map.selectedItems.multipleItems');
      const reportCount = tappedOnFeatures.filter(feature => feature.type === 'report').length;
      const reportString = i18n.t(reportCount === 1 ? 'map.selectedItems.oneReport' : 'map.selectedItems.manyReports', {
        count: reportCount
      });
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
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          {showRightArrow && <Image source={rightArrow} />}
        </View>
      </Touchable>
    );
  }
}
