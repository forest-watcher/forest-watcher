import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableHighlight
} from 'react-native';

import I18n from 'locales';
import Theme from 'config/theme';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

const editIcon = require('assets/edit.png');
const checkIcon = require('assets/check.png');
const uploadIcon = require('assets/upload.png');

function getItems(data, image, onPress) {
  return data.map((item, index) => (
    <View
      key={index}
      style={styles.listItem}
    >
      <View style={styles.listItemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemText}>{item.position}</Text>
        <Text style={styles.itemText}>{item.date}</Text>
      </View>
      <View style={styles.listBtn}>
        {image &&
        <TouchableHighlight
          onPress={() => typeof onPress === 'function' && onPress(item.title)}
          underlayColor="transparent"
          activeOpacity={0.8}
        >
          <Image style={Theme.icon} source={image} />
        </TouchableHighlight>
        }
      </View>
    </View>
  ));
}

class Reports extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  componentDidMount() {
    tracker.trackScreenView('Reports');
  }

  getCompleted(completed) {
    const onActionPress = (reportName) => {
      tracker.trackEvent('Report', 'Complete Report', { label: 'Click Done', value: 0 });
      // this.props.uploadReport(reportName);
    };
    return (
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{I18n.t('report.completed')}</Text>
          <Text style={[styles.listTitle, styles.listAction]}>{I18n.t('report.uploadAll').toUpperCase()}</Text>
        </View>
        {getItems(completed, uploadIcon, onActionPress)}
      </View>
    );
  }

  getDrafts(drafts) {
    const onActionPress = (reportName) => {
      const screen = 'ForestWatcher.NewReport';
      const title = 'Report';
      this.props.navigator.push({
        screen,
        title,
        passProps: {
          screen,
          title,
          form: reportName,
          questionsToSkip: 4,
          texts: {
            saveLaterTitle: 'report.saveLaterTitle',
            saveLaterDescription: 'report.saveLaterDescription',
            requiredId: 'report.reportIdRequired'
          }
        }
      });
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

  getUploaded(uploaded) { // eslint-disable-line
    return (
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{I18n.t('report.uploaded')}</Text>
        </View>
        {getItems(uploaded, checkIcon)}
      </View>
    );
  }

  render() {
    const { complete, draft, uploaded } = this.props.reports;
    return (
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.container}>
          {complete && complete.length > 0 &&
            this.getCompleted(complete)
          }
          {draft && draft.length > 0 &&
            this.getDrafts(draft)
          }
          {uploaded && uploaded.length > 0 &&
            this.getUploaded(uploaded)
          }
        </View>
      </ScrollView>
    );
  }
}

Reports.propTypes = {
  uploadReport: React.PropTypes.func.isRequired,
  navigator: React.PropTypes.object.isRequired,
  reports: React.PropTypes.shape({
    draft: React.PropTypes.array,
    uploaded: React.PropTypes.array,
    complete: React.PropTypes.array
  }).isRequired
};


export default Reports;
