import React, { Component } from 'react';
import {
  View
} from 'react-native';

import SetupArea from 'containers/setup/area';
import styles from './styles';

class Setup extends Component {
  render() {
    return (
      <View style={styles.container}>
        <SetupArea />
      </View>
    );
  }
}

Setup.propTypes = {
  user: React.PropTypes.any,
  countries: React.PropTypes.any,
  showNavHeader: React.PropTypes.func.isRequired
};

export default Setup;
