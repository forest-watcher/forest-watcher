// @flow

import React, { PureComponent } from 'react';
import {
  View,
  Text,
  ScrollView
} from 'react-native';

import Row from 'components/common/row';
import moment from 'moment';
import i18n from 'locales';
import Theme from 'config/theme';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

const editIcon = require('assets/edit.png');
const nextIcon = require('assets/next.png');

type ReportItem = {
  title: string,
  date: string
};

type Props = {
  navigator: any,
  reports: {
    draft: Array<ReportItem>,
    uploaded: Array<ReportItem>,
    complete: Array<ReportItem>
  },
  getLastStep: string => number
};

class Reports extends PureComponent<Props> {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  static getItems(data: Array<ReportItem>, image: any, onPress: string => void) {
    return data.map((item, index) => {
      let positionParsed = '';
      if (item.position) {
        const latLng = item.position.split(',');
        if (latLng && latLng.length > 1) {
          positionParsed = `${parseFloat(latLng[0]).toFixed(4)}, ${parseFloat(latLng[1]).toFixed(4)}`;
        }
      }
      const dateParsed = moment(item.date).fromNow();
      const action = {
        icon: image,
        callback: () => onPress(item.title)
      };
      return (
        <Row key={index + item.title} rowStyle={{ height: 120 }} action={action}>
          <View style={styles.listItem}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemText}>{positionParsed}</Text>
            <Text style={styles.itemText}>{dateParsed}</Text>
          </View>
        </Row>
      );
    });
  }

  static renderSection(title: string, ...options: [Array<ReportItem>, any, string => void]) {
    return (
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{title}</Text>
        </View>
        {Reports.getItems(...options)}
      </View>
    );
  }

  componentDidMount() {
    tracker.trackScreenView('My Reports');
  }

  onClickNext = (reportName: string) => this.props.navigator.push({
    title: i18n.t('report.review'),
    screen: 'ForestWatcher.Answers',
    passProps: {
      reportName,
      readOnly: true
    }
  });

  onClickUpload = (reportName: string) => this.props.navigator.push({
    title: i18n.t('report.review'),
    screen: 'ForestWatcher.Answers',
    passProps: {
      reportName,
      readOnly: true,
      showUploadButton: true
    }
  });

  getCompleted(completed) {
    return Reports.renderSection(i18n.t('report.completed'), completed, nextIcon, this.onClickUpload);
  }

  getUploaded(uploaded) {
    return Reports.renderSection(i18n.t('report.uploaded'), uploaded, nextIcon, this.onClickNext);
  }

  getDrafts(drafts) {
    const onActionPress = (reportName) => {
      const lastStep = this.props.getLastStep(reportName);
      if (lastStep !== null) {
        const screen = 'ForestWatcher.NewReport';
        const title = i18n.t('report.title');
        this.props.navigator.push({
          screen,
          title,
          passProps: {
            screen,
            title,
            reportName,
            step: lastStep
          }
        });
      } else {
        this.props.navigator.push({
          title: i18n.t('report.review'),
          screen: 'ForestWatcher.Answers',
          passProps: { reportName }
        });
      }
    };

    return Reports.renderSection(i18n.t('report.drafts'), drafts, editIcon, onActionPress);
  }

  render() {
    const { complete, draft, uploaded } = this.props.reports;
    const hasReports = !!complete.length || !!draft.length || !!uploaded.length;
    return (
      /* View necessary to fix the swipe back on wix navigation */
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {hasReports
            ? (
              <View style={styles.container}>
                {draft && draft.length > 0 &&
                  this.getDrafts(draft)
                }
                {complete && complete.length > 0 &&
                  this.getCompleted(complete)
                }
                {uploaded && uploaded.length > 0 &&
                  this.getUploaded(uploaded)
                }
              </View>
            )
            : (
              <View style={styles.containerEmpty}>
                <Text style={styles.emptyTitle}>
                  {i18n.t('report.empty')}
                </Text>
              </View>
            )
          }
        </ScrollView>
      </View>
    );
  }
}

export default Reports;
