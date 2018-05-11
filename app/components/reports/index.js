// @flow

import React, { PureComponent } from 'react';
import {
  View,
  Text,
  ScrollView
} from 'react-native';

import Row from 'components/common/row';
import moment from 'moment';
import I18n from 'locales';
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
  getLastStep: string => number,
  finish: () => void
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
          <Text style={styles.listTitle}>{I18n.t(title)}</Text>
        </View>
        {Reports.getItems(...options)}
      </View>
    );
  }

  componentDidMount() {
    tracker.trackScreenView('Reports');
  }

  onClickNext = (reportName: string) => this.props.navigator.push({
    title: 'Review report',
    screen: 'ForestWatcher.Answers',
    passProps: {
      form: reportName,
      readOnly: true
    }
  });

  onClickUpload = (reportName: string) => this.props.navigator.push({
    title: 'Review report',
    screen: 'ForestWatcher.Answers',
    passProps: {
      form: reportName,
      readOnly: true,
      showUploadButton: true,
      finish: this.props.finish
    }
  });

  getCompleted(completed) {
    return Reports.renderSection('report.completed', completed, nextIcon, this.onClickUpload);
  }

  getUploaded(uploaded) {
    return Reports.renderSection('report.uploaded', uploaded, nextIcon, this.onClickNext);
  }

  getDrafts(drafts) {
    const onActionPress = (reportName) => {
      const lastStep = this.props.getLastStep(reportName);
      if (lastStep !== null) {
        const screen = 'ForestWatcher.NewReport';
        const title = 'Report';
        this.props.navigator.push({
          screen,
          title,
          passProps: {
            screen,
            title,
            form: reportName,
            step: lastStep,
            texts: {
              saveLaterTitle: 'report.saveLaterTitle',
              saveLaterDescription: 'report.saveLaterDescription',
              requiredId: 'report.reportIdRequired'
            }
          }
        });
      } else {
        this.props.navigator.push({
          title: 'Review report',
          screen: 'ForestWatcher.Answers',
          passProps: {
            form: reportName,
            finish: this.props.finish
          }
        });
      }
    };

    return Reports.renderSection('report.drafts', drafts, editIcon, onActionPress);
  }

  render() {
    const { complete, draft, uploaded } = this.props.reports;
    const hasReports = !!complete.length || !!draft.length || !!uploaded.length;
    return (
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
                {I18n.t('report.empty')}
              </Text>
            </View>
          )
        }
      </ScrollView>
    );
  }
}

export default Reports;
