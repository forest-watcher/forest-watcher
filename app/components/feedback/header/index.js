import React from 'react';
import {
  View,
  Text
} from 'react-native';

import LeftBtn from 'components/common/header/left-btn';
import RightBtn from './right';
import styles from './styles';


function FeedbackHeader(props) {
  return (
    <View style={styles.container}>
      <LeftBtn light={props.light} goBack={props.onBackPress} />
      <Text style={[styles.title, props.light ? styles.light : '']}>{props.title}</Text>
      <RightBtn light={props.light} />
    </View>
  );
}

FeedbackHeader.propTypes = {
  light: React.PropTypes.bool,
  title: React.PropTypes.string,
  onBackPress: React.PropTypes.func.isRequired
};

export default FeedbackHeader;
