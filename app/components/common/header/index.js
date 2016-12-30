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
      {props.back !== false
        ? <TouchableHighlight
          underlayColor="transparent"
          style={styles.backButton}
          onPress={props.onBack}
          hitSlop={{ top: 12, left: 12, bottom: 12, right: 12 }}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableHighlight>
        : null
      }
      <Text style={styles.title}>Forest Watcher</Text>
    </View>
  );
}

Header.propTypes = {
  onBack: React.PropTypes.func.isRequired,
  back: React.PropTypes.bool
};

export default Header;
