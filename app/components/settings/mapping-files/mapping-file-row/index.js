// @flow
import type { ViewStyle } from 'types/reactElementStyles.types';
import React, { Component } from 'react';

import {
  View,
  Text,
  TouchableHighlight,
  Image,
  ImageBackground,
  Platform,
  TouchableNativeFeedback
} from 'react-native';
import styles from './styles';

const infoIcon = require('assets/info.png');
const downloadIcon = require('assets/downloadGrey.png');
const checkboxOff = require('assets/checkbox_off.png');
const checkboxOn = require('assets/checkbox_on.png');

type Props = {
  image?: ?string | ?number,
  onDownloadPress?: () => void,
  onPress?: ?() => void,
  onInfoPress?: () => void,
  selected?: ?boolean,
  style?: ?ViewStyle,
  subtitle?: ?string,
  title: string
};

export default class MappingFileRow extends Component<Props> {
  renderIcons = () => {
    if (this.props.selected === false) {
      return this.renderIcon(checkboxOff, this.props.onPress);
    } else if (this.props.selected === true) {
      return this.renderIcon(checkboxOn, this.props.onPress);
    }
    if (!this.props.onDownloadPress) {
      return this.renderIcon(infoIcon, this.props.onPress);
    }
    return (
      <React.Fragment>
        {this.renderIcon(infoIcon, this.props.onPress)}
        {this.renderIcon(downloadIcon, this.props.onPress)}
      </React.Fragment>
    );
  };

  renderIcon = (icon, onPress: ?() => void) => {
    const Touchable = Platform.select({
      android: TouchableNativeFeedback,
      ios: TouchableHighlight
    });
    return (
      <Touchable
        onPress={onPress}
        background={Platform.select({
          // hide ripple as hitbox is wider than icon
          android: TouchableNativeFeedback.Ripple('rgba(0, 0, 0, 0)'),
          ios: undefined
        })}
        underlayColor={Platform.select({
          android: undefined,
          ios: 'white'
        })}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Image source={icon} />
        </View>
      </Touchable>
    );
  };

  render() {
    return (
      <View style={styles.item}>
        <View style={styles.imageContainer}>
          {this.props.image && <ImageBackground resizeMode={'cover'} style={styles.image} source={this.props.image} />}
        </View>
        <View style={styles.contentContainer}>
          <Text numberOfLines={2} style={styles.title}>
            {this.props.title}
          </Text>
          {!!this.props.subtitle && (
            <View style={styles.subtitleContainer}>
              <Text style={styles.title}>{this.props.subtitle}</Text>
            </View>
          )}
        </View>
        <View style={styles.iconsContainer}>{this.renderIcons()}</View>
      </View>
    );
  }
}
