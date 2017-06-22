import React from 'react';
import {
  Alert
} from 'react-native';

import Form from 'components/common/form';
import CONSTANTS from 'config/constants';
import I18n from 'locales';

const saveReportIcon = require('assets/save_for_later.png');

class ReportForm extends Form {

  static get navigatorStyle() {
    return super.navigatorStyle;
  }

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
}

ReportForm.propTypes = {
  saveReport: React.PropTypes.func
};

export default ReportForm;
