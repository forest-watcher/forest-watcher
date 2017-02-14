import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableHighlight
} from 'react-native';

import Theme from 'config/theme';
import I18n from 'locales';
import styles from './styles';

const sections = [
  {
    title: I18n.t('setupHeader.errorFirst'),
    section: '',
    image: ''
  },
  {
    title: I18n.t('setupHeader.errorSecond'),
    section: '',
    image: ''
  },
  {
    title: I18n.t('setupHeader.errorThird'),
    section: '',
    image: ''
  }
];

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
      return new Error(`${sections[0].title} ${propName} ${sections[1].title}  ${componentName}. ${sections[2].title}`);
    }
    return null;
  }

};

export default SetupHeader;
