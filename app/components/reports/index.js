import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
const uploadIcon = require('assets/upload.png');

function getItems(data, image, onPress) {
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

class Reports extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  static propTypes = {
    navigator: PropTypes.object.isRequired,
    reports: PropTypes.shape({
      draft: PropTypes.array,
      uploaded: PropTypes.array,
      complete: PropTypes.array
    }).isRequired,
    getLastStep: PropTypes.func.isRequired,
    finish: PropTypes.func.isRequired
  };

  componentDidMount() {
    tracker.trackScreenView('Reports');
  }

  onClickNext = (reportName) => {
    this.props.navigator.push({
      title: 'Review report',
      screen: 'ForestWatcher.Answers',
      passProps: {
        form: reportName,
        readOnly: true
      }
    });
  }

  onClickUpload = (reportName) => {
    this.props.finish(reportName);
  }

  getCompleted = (completed) => {
    const { isConnected } = this.props;
    const onClick = isConnected ? this.onClickUpload : this.onClickNext;
    const icon = isConnected ? uploadIcon : nextIcon;
    return (
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{I18n.t('report.completed')}</Text>
        </View>
        {getItems(completed, icon, onClick)}
      </View>
    );
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
    return (
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{I18n.t('report.drafts')}</Text>
        </View>
        {getItems(drafts, editIcon, onActionPress)}
      </View>
    );
  }

  getUploaded = (uploaded) => (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>{I18n.t('report.uploaded')}</Text>
      </View>
      {getItems(uploaded, nextIcon, this.onClickNext)}
    </View>
  );

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
