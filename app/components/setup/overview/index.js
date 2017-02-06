import React from 'react';
import {
  View,
  Text
} from 'react-native';

import styles from './styles';
import NextButton from '../next-button';

function SetupOverview(props) {
  return (
    <View style={styles.container}>

      <View style={styles.selector}>
        <Text style={styles.selectorLabel}>Name the area</Text>
      </View>

      <NextButton onPress={props.onNextClick} text="FINISH" />
    </View>
  );
}

SetupOverview.propTypes = {
  onNextClick: React.PropTypes.func.isRequired
};

export default SetupOverview;
