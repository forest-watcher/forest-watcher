import React, { Component } from 'react';
import {
  View,
  Text
} from 'react-native';

import Theme from 'config/theme';
import AppIntro from 'react-native-app-intro';
import SetupCountry from 'containers/setup/country';
import SetupBoundaries from 'components/setup/boundaries';
import styles from './styles';

class Setup extends Component {
  static navigationOptions = {
    header: {
      visible: false
    }
  }
  
  render() {
    return (
      <SetupBoundaries />
    );
  }
}

Setup.propTypes = {
  user: React.PropTypes.any,
  countries: React.PropTypes.any,
  showNavHeader: React.PropTypes.func.isRequired
};

export default Setup;
