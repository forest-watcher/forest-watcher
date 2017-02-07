import React from 'react';
import {
  View,
  Text
} from 'react-native';

import styles from './styles';
import ActionButton from 'components/common/action-button';

function SetupOverview(props) {
  return (
    <View style={styles.container}>

      <View style={styles.selector}>
        <Text style={styles.selectorLabel}>Name the area</Text>
      </View>

      <ActionButton style={styles.button} onPress={props.onNextPress} text="FINISH" />
    </View>
  );
}

SetupOverview.propTypes = {
  onNextPress: React.PropTypes.func.isRequired
};

export default SetupOverview;
