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
    const { form, texts } = this.props;
    Alert.alert(
      I18n.t(texts.saveLaterTitle),
      I18n.t(texts.saveLaterDescription),
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: () => {
            if (this.props.saveReport) {
              this.props.saveReport(form, {
                status: CONSTANTS.status.draft
              });
            }
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
    const { form, step, texts, title, questionsToSkip, finish, screen } = this.props;
    const index = step || questionsToSkip;
    if (form) {
      return (<ReportsForm
        form={form}
        index={index}
        navigator={this.props.navigator}
        texts={texts}
        title={title}
        screen={screen}
        questionsToSkip={questionsToSkip}
        finish={finish}
      />);
    }
    return (
      <View style={[styles.container, styles.containerCenter]}>
        <Text>{I18n.t(texts.requiredId)}</Text>
      </View>
    );
  }
}

Reports.propTypes = {
  navigator: React.PropTypes.object.isRequired,
  form: React.PropTypes.string.isRequired,
  step: React.PropTypes.number,
  saveReport: React.PropTypes.func,
  questionsToSkip: React.PropTypes.number,
  texts: React.PropTypes.object.isRequired,
  title: React.PropTypes.string.isRequired,
  screen: React.PropTypes.string.isRequired,
  finish: React.PropTypes.func.isRequired
};

export default Reports;
