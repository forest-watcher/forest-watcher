import React from 'react';
import {
  Alert,
  Image,
  TouchableHighlight
} from 'react-native';
import { withNavigation } from 'react-navigation';
import I18n from 'locales';
import Theme from 'config/theme';

const saveReportIconWhite = require('assets/save_for_later_white.png');
const saveReportIcon = require('assets/save_for_later.png');

function FeedbackRightBtn(props) {
  function onSavePress() {
    Alert.alert(
      I18n.t('feedback.saveLaterTitle'),
      I18n.t('feedback.saveLaterDescription'),
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: () => {
            props.navigation.goBack();
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
      <Image style={Theme.icon} source={props.light ? saveReportIconWhite : saveReportIcon} />
    </TouchableHighlight>
  );
}

FeedbackRightBtn.propTypes = {
  light: React.PropTypes.bool
};

export default withNavigation(FeedbackRightBtn);
