import React from 'react';
import {
  Alert,
  Image,
  TouchableHighlight
} from 'react-native';

import I18n from 'locales';
import Theme from 'config/theme';

const saveReportIcon = require('assets/save_for_later.png');

function RightBtn(props) {
  function onSavePress() {
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
            props.saveReport(props.answers);
            props.goBack();
          }
        }
      ],
      { cancelable: false }
    );
  }
  return (
    <TouchableHighlight
      onPress={onSavePress}
      underlayColor="transparent"
      activeOpacity={0.8}
    >
      <Image style={Theme.icon} source={saveReportIcon} />
    </TouchableHighlight>
  );
}

RightBtn.propTypes = {
  answers: React.PropTypes.object.isRequired,
  saveReport: React.PropTypes.func.isRequired,
  goBack: React.PropTypes.func.isRequired
};


export default RightBtn;
