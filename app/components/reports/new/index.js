import React, { Component } from 'react';
import {
  Image,
  TouchableHighlight
} from 'react-native';

import I18n from 'locales';
import Theme from 'config/theme';
import RightBtn from 'containers/reports/new/header-right';
import ReportsForm from 'containers/reports/new/form';

const backIcon = require('assets/previous.png');

// Component necessary to set the navigationOptions
class Reports extends Component {
  static navigationOptions = {
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
        right: <RightBtn navigation={navigation} />
      };
    }
  };

  render() {
    return (
      <ReportsForm />
    );
  }
}


export default Reports;
