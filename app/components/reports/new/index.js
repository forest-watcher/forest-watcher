import React from 'react';
import {
  Alert,
  Image,
  TouchableHighlight
} from 'react-native';

import ReportsForm from 'containers/reports/new/form';
import Theme from 'config/theme';
import I18n from 'locales';

const backIcon = require('assets/previous.png');
const saveReportIcon = require('assets/save_for_later.png');

// Component necessary to set the navigationOptions
function Reports() {
  return (
    <ReportsForm />
  );
}

function onSavePress(navigation) {
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
          console.warn('TODO: save draft form');
          navigation.goBack();
        }
      }
    ],
    { cancelable: false }
  );
}

Reports.navigationOptions = {
  header: (navigation) => {
    const LeftBtn = (
      <TouchableHighlight
        onPress={() => navigation.goBack()}
        underlayColor="transparent"
        activeOpacity={0.8}
      >
        <Image style={Theme.icon} source={backIcon} />
      </TouchableHighlight>
    );
    const RightBtn = (
      <TouchableHighlight
        onPress={() => onSavePress(navigation)}
        underlayColor="transparent"
        activeOpacity={0.8}
      >
        <Image style={Theme.icon} source={saveReportIcon} />
      </TouchableHighlight>
    );
    return {
      left: LeftBtn,
      tintColor: Theme.colors.color1,
      style: {
        paddingLeft: 8,
        paddingRight: 8,
        backgroundColor: Theme.background.main
      },
      titleStyle: {
        textAlign: 'left',
        fontFamily: Theme.font,
        fontSize: 21,
        fontWeight: '400',
        height: 28
      },
      title: I18n.t('report.title'),
      right: RightBtn
    };
  }
};

export default Reports;
