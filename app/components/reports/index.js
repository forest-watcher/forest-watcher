import React, { Component } from 'react';
import {
  View,
  Text
} from 'react-native';

import styles from './styles';

class Reports extends Component {
  constructor() {
    super();

    this.state = {};
  }

  render() {
    return (
      <View style={styles.container}>
        <Text> Reports will be there </Text>
      </View>
    );
  }
}

Reports.propTypes = {};

export default Reports;
