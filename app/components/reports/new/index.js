import React, { Component } from 'react';
import {
  Text,
  View
} from 'react-native';

import I18n from 'locales';
import ReportsForm from 'containers/reports/new/form';
import tracker from 'helpers/googleAnalytics';
import styles from '../styles';

// Component necessary to set the navigationOptions
class Reports extends Component {
  static navigationOptions = {
    header: {
      visible: false
    }
  };

  componentDidMount() {
    tracker.trackScreenView('Reports');
  }

  render() {
    const { state } = this.props.navigation;
    const form = 'sorodrigoform';
    const index = (state && state.params && state.params.step) || 0 + 4; // TODO import from constants
    if (form) return <ReportsForm form={form} index={index} navigation={this.props.navigation} />;
    return (
      <View style={[styles.container, styles.containerCenter]}>
        <Text>{I18n.t('report.reportIdRequired')}</Text>
      </View>
    );
  }
}

Reports.propTypes = {
  navigation: React.PropTypes.object.isRequired
};

export default Reports;
