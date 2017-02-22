import React from 'react';
import {
  View,
  Text
} from 'react-native';
import { withNavigation } from 'react-navigation';

import I18n from 'locales';
import styles from './styles';
import LeftBtn from './left-btn';

function Header(props) {
  return (
    <View style={styles.container}>
      <LeftBtn goBack={() => props.navigation.goBack()} />
      <Text style={styles.title}>{I18n.t(props.title)}</Text>
    </View>
  );
}

Header.propTypes = {
  title: React.PropTypes.object.isRequired,
  navigation: React.PropTypes.object.isRequired
};

export default withNavigation(Header);
