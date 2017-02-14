import React from 'react';
import {
  View,
  TouchableHighlight,
  Text
} from 'react-native';
import I18n from 'locales';
import styles from './styles';

function Header(props) {
  return (
    <View style={styles.container}>
      <TouchableHighlight
        underlayColor="transparent"
        style={styles.backButton}
        onPress={props.navigateBack}
        hitSlop={{ top: 12, left: 12, bottom: 12, right: 12 }}
      >
        <Text style={styles.backButtonText}>{I18n.t('commonText.back')}</Text>
      </TouchableHighlight>
      <Text style={styles.title}>{I18n.t('commonText.appTitle')}</Text>
    </View>
  );
}

Header.propTypes = {
  navigateBack: React.PropTypes.func.isRequired
};

export default Header;
