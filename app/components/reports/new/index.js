import React, { Component } from 'react';

import I18n from 'locales';
import Theme from 'config/theme';
import LeftBtn from 'components/common/header/left-btn';
import RightBtn from 'containers/reports/new/header-right';
import ReportsForm from 'containers/reports/new/form';

// Component necessary to set the navigationOptions
class Reports extends Component {
  static navigationOptions = {
    header: (navigation) => ({
      left: <LeftBtn goBack={navigation.goBack} />,
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
    })
  };

  render() {
    return (
      <ReportsForm />
    );
  }
}


export default Reports;
