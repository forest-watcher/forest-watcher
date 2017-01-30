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
  render() {
    return (
      <AppIntro
        dotColor={Theme.background.white}
        activeDotColor={Theme.background.secondary}
        nextBtnLabel={''}
        doneBtnLabel={''}
        customStyles={{
          activeDotStyle: {
            width: 12,
            height: 12,
            borderWidth: 0
          },
          dotStyle: {
            width: 11,
            height: 11,
            borderWidth: 2,
            borderColor: Theme.colors.color6
          },
          paginationContainer: {
            bottom: 0
          }
        }}
        showSkipButton={false}
      >
        <View style={styles.container}>
          <SetupCountry />
        </View>
        <View style={styles.container}>
          <SetupBoundaries />
        </View>
        <View style={[styles.slide, { backgroundColor: '#a4b602' }]}>
          <View level={10}><Text style={styles.text}>Page 2</Text></View>
        </View>
      </AppIntro>
    );
  }
}

Setup.propTypes = {
  user: React.PropTypes.any,
  countries: React.PropTypes.any,
  showNavHeader: React.PropTypes.func.isRequired
};

export default Setup;
