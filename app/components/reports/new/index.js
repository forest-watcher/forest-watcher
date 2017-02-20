import React, { Component } from 'react';
import {
  View
} from 'react-native';
import I18n from 'locales';
import Theme from 'config/theme';
import Header from './header';
import LeftBtn from 'components/common/header/left-btn';
import RightBtn from 'containers/reports/new/header-right';
import ReportsForm from 'containers/reports/new/form';

// Component necessary to set the navigationOptions
class Reports extends Component {
  static navigationOptions = {
    header: {
      visible: false
    }
  };

  render() {
    return (
      <ReportsForm />
    );
  }
}


export default Reports;
