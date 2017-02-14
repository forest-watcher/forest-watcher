import React from 'react';
import {
  View,
  TouchableHighlight,
  Text
} from 'react-native';
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
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableHighlight>
      <Text style={styles.title}>FOREST WATCHER 2.0</Text>
    </View>
  );
}

Header.propTypes = {
  navigateBack: React.PropTypes.func.isRequired
};

export default Header;
