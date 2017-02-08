import React from 'react';
import {
  View,
  Text,
  Image
} from 'react-native';

import ActionButton from 'components/common/action-button';
import styles from './styles';

function SetupOverview(props) {
  return (
    <View style={styles.container}>

      <View style={styles.selector}>
        <Text style={styles.selectorLabel}>Name the area</Text>
        <Image style={styles.image} source={{ uri: props.snapshot }} />
      </View>

      <ActionButton style={styles.buttonPos} onPress={props.onNextPress} text="FINISH" />
    </View>
  );
}

SetupOverview.propTypes = {
  snapshot: React.PropTypes.string.isRequired,
  onNextPress: React.PropTypes.func.isRequired
};

export default SetupOverview;
