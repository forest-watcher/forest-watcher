import React, { Component } from 'react';
import {
  Text,
  View
} from 'react-native';

import ReportsForm from 'containers/reports/new/form';
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
    const form = state && state.params && state.params.form;
    if (form) return <ReportsForm form={form} />;
    return (
      <View style={[styles.container, styles.containerCenter]}>
        <Text>Report id is neccesary</Text>
      </View>
    );
  }
}

Reports.propTypes = {
  navigation: React.PropTypes.object.isRequired
};

export default Reports;
