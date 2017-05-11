import React, { Component } from 'react';
import {
  Text,
  View,
  Alert
} from 'react-native';

import CONSTANTS from 'config/constants';
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

  onPressDraft = () => {
    Alert.alert(
      I18n.t('report.saveLaterTitle'),
      I18n.t('report.saveLaterDescription'),
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: () => {
            const { form } = this.props;
            this.props.saveReport(form, {
              status: CONSTANTS.status.draft
            });
            this.props.navigator.pop();
          }
        }
      ],
      { cancelable: false }
    );
  }

  onNavigatorEvent = (event) => {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'draft') this.onPressDraft();
    }
  }

  render() {
    const form = this.props && this.props.form;
    const index = (this.props && this.props.step) || CONSTANTS.report.questionsToSkip;
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
  step: React.PropTypes.number,
  saveReport: React.PropTypes.func.isRequired
};

export default Reports;
