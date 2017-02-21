import React, { Component } from 'react';
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
