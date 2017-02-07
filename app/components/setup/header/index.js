import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableHighlight
} from 'react-native';

import Theme from 'config/theme';
import styles from './styles';

const backIcon = require('assets/previous.png');

function SetupHeader(props) {
  return (
    <View style={styles.container}>
      {props.showBack &&
        <TouchableHighlight
          style={styles.backIcon}
          onPress={props.onBackPress}
          activeOpacity={0.5}
          underlayColor="transparent"
        >
          <Image style={Theme.icon} source={backIcon} />
        </TouchableHighlight>
      }
      <Text style={[styles.title, props.showBack ? '' : styles.margin]}>
        {props.title}
      </Text>
    </View>
  );
}

SetupHeader.propTypes = {
  title: React.PropTypes.string,
  showBack: React.PropTypes.bool,
  onBackPress: (props, propName, componentName) => {
    if (props.showBack && !props[propName]) {
      return new Error(`Invalid prop ${propName} supplied to  ${componentName}. It ss required if you show back button`);
    }
    return null;
  }

};

export default SetupHeader;
