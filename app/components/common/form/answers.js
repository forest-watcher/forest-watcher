import React, { Component } from 'react';
import {
  Text,
  View,
  Alert
} from 'react-native';
import Theme from 'config/theme';
import CONSTANTS from 'config/constants';
import I18n from 'locales';

const saveReportIcon = require('assets/save_for_later.png');

class Answers extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  static propTypes = {
    navigator: React.PropTypes.object.isRequired,
    enableDraft: React.PropTypes.bool.isRequired,
    saveReport: React.PropTypes.func.isRequired,
    form: React.PropTypes.object.isRequired
  };

  static defaultProps = {
    enableDraft: true
  }

  constructor(props) {
    super(props);
    if (this.props.enableDraft) {
      this.props.navigator.setButtons({
        rightButtons: [
          {
            icon: saveReportIcon,
            id: 'draft'
          }
        ]
      });
      this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
    }
  }

  onPressDraft = () => {
    const { form } = this.props;
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
            if (this.props.saveReport) {
              this.props.saveReport(form, {
                status: CONSTANTS.status.draft
              });
            }
            this.props.navigator.popToRoot({ animate: true });
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
    return (
      <View>
        <Text>Hello</Text>
      </View>
    );
  }
}

export default Answers;
