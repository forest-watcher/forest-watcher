// @flow

import React, { PureComponent } from 'react';
import { View, Text, ScrollView } from 'react-native';

import Row from 'components/common/row';
import moment from 'moment';
import i18n from 'i18next';
import debounceUI from 'helpers/debounceUI';
import styles from './styles';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';
import { readableNameForReportName } from 'helpers/reports';
import Theme from 'config/theme';

const nextIcon = require('assets/next.png');

type AlertItem = {
  date: number,
  type: 'alert',
  name: string,
  featureId: string,
  lat: string,
  long: string
};

type ReportItem = {
  date: number,
  type: 'report',
  name: string,
  featureId: string,
  lat: string,
  long: string,
  imported: boolean,
  reportAreaName: string
};

type Props = {|
  +componentId: string,
  +tappedOnFeatures: Array<AlertItem | ReportItem>
|};

export default class MultipleItems extends PureComponent<Props, null> {
  static options(passProps: {}) {
    return {
      topBar: {
        background: {
          color: Theme.colors.veryLightPink
        },
        title: {
          text: i18n.t('map.selectedItems.multipleItems')
        },
        rightButtons: [
          {
            id: 'done',
            text: i18n.t('commonText.done'),
            ...styles.topBarTextButton
          }
        ]
      }
    };
  }

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);
  }

  navigationButtonPressed({ buttonId }: NavigationButtonPressedEvent) {
    if (buttonId === 'done') {
      Navigation.dismissModal(this.props.componentId);
    }
  }

  /**
   * Handles a completed report row being selected.
   */
  onClickReport = debounceUI((reportName: string) =>
    Navigation.showModal({
      stack: {
        children: [
          {
            component: {
              name: 'ForestWatcher.Answers',
              passProps: {
                reportName,
                readOnly: true,
                showUploadButton: true
              }
            }
          }
        ]
      }
    })
  );

  renderReports(features: Array<ReportItem>): any {
    return features.map((report: ReportItem) => {
      const dateParsed = moment(report.date).format('YYYY-MM-DD - HH:mm:ss');
      const timeSinceParsed = moment(report.date).fromNow();
      const title = readableNameForReportName(report.name);
      const action = {
        icon: nextIcon,
        callback: () => {
          this.onClickReport(report.featureId);
        },
        position: 'center'
      };
      return (
        <Row key={report.name} action={action}>
          <Text style={styles.itemTitle}>{title}</Text>
          {report.reportAreaName && <Text style={styles.itemText}>{report.reportAreaName}</Text>}
          <Text style={styles.itemText}>{dateParsed}</Text>
          <Text style={styles.itemText}>{timeSinceParsed}</Text>
        </Row>
      );
    });
  }

  renderAlerts(features: Array<AlertItem>): any {
    return features.map((alert: AlertItem) => {
      const dateParsed = moment(alert.date).format('YYYY-MM-DD');
      const timeSinceParsed = moment(alert.date).fromNow();
      const title = alert.name;
      return (
        <Row key={alert.name}>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={styles.itemText}>{dateParsed}</Text>
          <Text style={styles.itemText}>{timeSinceParsed}</Text>
        </Row>
      );
    });
  }

  renderSection(type: 'alert' | 'report', title: string, features: Array<ReportItem>) {
    if (features.length === 0) {
      return null;
    }
    return (
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>{title}</Text>
        {type === 'report' ? this.renderReports(features) : this.renderAlerts(features)}
      </View>
    );
  }

  render() {
    const features = this.props.tappedOnFeatures.map(feature => feature.properties);
    const alerts = features.filter(feature => feature.type === 'alert');
    const reports = features.filter(feature => feature.type === 'report');
    const myReports = reports.filter(reports => !reports.imported);
    const importedReports = reports.filter(reports => reports.imported);
    const location = i18n.t('map.selectedItems.location', {
      lat: parseFloat(features[0].lat).toFixed(4),
      long: parseFloat(features[0].long).toFixed(4)
    });
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Row>
            <Text style={styles.itemText}>{location}</Text>
          </Row>
          {this.renderSection('report', i18n.t('map.layerSettings.myReports'), myReports)}
          {this.renderSection('report', i18n.t('map.layerSettings.importedReports'), importedReports)}
          {this.renderSection('alert', i18n.t('map.layerSettings.alerts'), alerts)}
        </View>
      </ScrollView>
    );
  }
}
