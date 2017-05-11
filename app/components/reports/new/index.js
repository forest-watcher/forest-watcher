import React, { Component } from 'react';
import {
  Text,
  View
} from 'react-native';

import Theme from 'config/theme';
import I18n from 'locales';
import ReportsForm from 'containers/reports/new/form';
import tracker from 'helpers/googleAnalytics';
import styles from '../styles';

const saveReportIcon = require('assets/save_for_later.png');

// Component necessary to set the navigationOptions
class Reports extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };
  static navigatorButtons = {
    rightButtons: [
      {
        icon: saveReportIcon,
        id: 'draft'
      }
    ]
  };

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  componentDidMount() {
    tracker.trackScreenView('Reports');
  }

  onNavigatorEvent = (event) => {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'draft') {
        this.props.navigator.push({
          screen: 'ForestWatcher.Settings',
          title: 'Settings'
        });
      }
    }
  }

  render() {
    const form = this.props && this.props.form;
    const index = (this.props && this.props.step) || 0 + 4; // TODO import from constants
    if (form) return <ReportsForm form={form} index={index} navigator={this.props.navigator} />;
    return (
      <View style={[styles.container, styles.containerCenter]}>
        <Text>{I18n.t('report.reportIdRequired')}</Text>
      </View>
    );
  }
}

Reports.propTypes = {
  navigator: React.PropTypes.object.isRequired,
  form: React.PropTypes.string.isRequired,
  step: React.PropTypes.number.isRequired
};

export default Reports;
