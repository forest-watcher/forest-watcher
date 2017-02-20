import React from 'react';
import {
  View,
  Text
} from 'react-native';

import LeftBtn from 'components/common/header/left-btn';
import RightBtn from 'containers/reports/new/header-right';
import styles from './styles';


function SetupHeader(props) {
  return (
    <View style={styles.container}>
      <LeftBtn goBack={props.onBackPress} />
      <Text style={styles.title}>{props.title}</Text>
      <RightBtn />
    </View>
  );
}

SetupHeader.propTypes = {
  title: React.PropTypes.string,
  onBackPress: React.PropTypes.func.isRequired
};

export default SetupHeader;
