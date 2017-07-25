import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Image,
  TouchableHighlight
} from 'react-native';

import Theme from 'config/theme';
import I18n from 'locales';
import styles from './styles';

const backIcon = require('assets/previous.png');
const backIconWhite = require('assets/previous_white.png');

function SetupHeader(props) {
  const showBackStyle = props.showBack ? '' : styles.margin;
  const titleColor = props.transparent ? { color: 'white' } : { color: Theme.fontColors.main };
  return (
    <View style={styles.container}>
      {props.showBack &&
        <TouchableHighlight
          style={styles.backIcon}
          onPress={props.onBackPress}
          activeOpacity={0.5}
          underlayColor="transparent"
        >
          <Image style={Theme.icon} source={props.transparent ? backIconWhite : backIcon} />
        </TouchableHighlight>
      }
      <Text style={[styles.title, showBackStyle, titleColor]}>
        {props.title}
      </Text>
    </View>
  );
}

SetupHeader.propTypes = {
  title: PropTypes.string,
  showBack: PropTypes.bool,
  onBackPress: (props, propName, componentName) => {
    if (props.showBack && !props[propName]) {
      return new Error(`${I18n.t('setupHeader.errorFirst')} ${propName} 
      ${I18n.t('setupHeader.errorSecond')}  ${componentName}. ${I18n.t('setupHeader.errorThird')}`);
    }
    return null;
  },
  transparent: PropTypes.bool
};

export default SetupHeader;
