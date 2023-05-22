// @flow
import type { ViewStyle, TextStyle } from 'types/reactElementStyles.types';

import React, { Component, type Node } from 'react';

import {
  View,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  ImageBackground,
  Platform,
  TouchableNativeFeedback
} from 'react-native';
import styles from './styles';

import SettingsButton from 'components/common/settings-button';
import Callout from 'components/common/callout';
import Theme from 'config/theme';

const nextIcon = require('assets/next.png');
const checkboxOff = require('assets/checkbox_off.png');
const checkboxOn = require('assets/checkbox_on.png');
const radioOn = require('assets/radio_button.png');
const downloadIcon = require('assets/download.png');

type Legend = {
  color: string,
  title: string
};

type Props = {
  disabled?: boolean,
  disableSettingsButton?: ?string | ?boolean,
  disableStyleSettingsButton?: boolean,
  downloadCalloutBody?: ?string,
  downloadCalloutVisible?: ?boolean,
  downloadCalloutTitle?: ?string,
  downloadVisible?: ?boolean,
  hideDivider?: ?boolean,
  hideImage?: ?boolean,
  imageSrc?: ?string | ?number,
  largeImage?: ?boolean,
  largerPadding?: ?boolean,
  legend?: ?Array<Legend>,
  onDownloadPress?: () => void,
  onPress?: ?() => void,
  onIconPress?: () => void,
  onSettingsPress?: ?() => void,
  useRadioIcon?: ?boolean,
  renderImageChildren?: (?void) => Node,
  selected?: ?boolean,
  settingsTitle?: ?string,
  smallerVerticalPadding?: ?boolean,
  style?: ?ViewStyle,
  subtitle?: ?string,
  subtitleBelowLegend?: ?boolean,
  subtitleStyle?: ?TextStyle,
  title: string,
  backgroundImageResizeMode?: ?string,
  nameContainerStyle?: ?ViewStyle,
  defaultImage?: ?any
};

export default class VerticalSplitRow extends Component<Props> {
  renderIcon = (selected: ?boolean, useRadioIcon: ?boolean, onIconPress: ?() => void) => {
    const iconStyle = [styles.disclosureIndicator, this.props.disabled ? { opacity: 0.6 } : {}];
    let icon = nextIcon;
    if (selected === false) {
      icon = checkboxOff;
    } else if (selected === true) {
      icon = useRadioIcon ? radioOn : checkboxOn;
    }

    if (!onIconPress) {
      return <Image style={iconStyle} source={icon} />;
    }
    const Touchable = Platform.select({
      android: TouchableNativeFeedback,
      ios: TouchableHighlight
    });
    return (
      <Touchable
        onPress={onIconPress}
        background={Platform.select({
          android: TouchableNativeFeedback.Ripple(Theme.background.secondary),
          ios: undefined
        })}
        underlayColor={Platform.select({
          android: undefined,
          ios: 'white'
        })}
        activeOpacity={0.8}
      >
        <Image style={iconStyle} source={icon} />
      </Touchable>
    );
  };

  render() {
    return (
      <TouchableHighlight
        activeOpacity={0.5}
        disabled={!this.props.onPress && !this.props.onIconPress}
        underlayColor="transparent"
        onPress={!this.props.disabled ? this.props.onPress : null}
        style={this.props.style}
      >
        <View style={styles.item}>
          {!this.props.hideImage && (
            <View style={[styles.imageContainer, this.props.largeImage ? styles.largeImageContainer : {}]}>
              {this.props.imageSrc !== null ? (
                <ImageBackground
                  resizeMode={this.props.backgroundImageResizeMode || 'cover'}
                  style={[styles.image, this.props.disabled ? { opacity: 0.6 } : {}]}
                  source={typeof this.props.imageSrc === 'string' ? { uri: this.props.imageSrc } : this.props.imageSrc}
                  defaultSource={this.props.defaultImage}
                >
                  {this.props.renderImageChildren && this.props.renderImageChildren()}
                </ImageBackground>
              ) : null}
              {this.props.downloadVisible && (
                <Callout
                  body={this.props.downloadCalloutBody}
                  offset={4}
                  title={this.props.downloadCalloutTitle}
                  visible={this.props.downloadCalloutVisible}
                >
                  <TouchableOpacity onPress={this.props.onDownloadPress} style={styles.downloadButton}>
                    <Image source={downloadIcon} />
                  </TouchableOpacity>
                </Callout>
              )}
            </View>
          )}
          <View style={[styles.contentContainer, this.props.largerPadding ? styles.largerPadding : {}]}>
            <View
              style={[
                styles.nameContainer,
                !this.props.hideDivider ? styles.bottomBorder : {},
                this.props.smallerVerticalPadding ? styles.smallerVerticalPadding : {},
                this.props.nameContainerStyle
              ]}
            >
              <View style={styles.titleContainer}>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={[styles.title, this.props.disabled ? { opacity: 0.6 } : {}]}>
                    {this.props.title}
                  </Text>
                  {this.props.subtitle && !this.props.subtitleBelowLegend && (
                    <Text numberOfLines={0} style={[styles.subtitle, this.props.subtitleStyle]}>
                      {this.props.subtitle}
                    </Text>
                  )}
                </View>
                {this.renderIcon(this.props.selected, this.props.useRadioIcon, this.props.onIconPress)}
              </View>
            </View>
            {(this.props.settingsTitle || this.props.onSettingsPress) && (
              <SettingsButton
                title={this.props.settingsTitle}
                disabledStyle={this.props.disableStyleSettingsButton}
                disabled={!!this.props.disableSettingsButton || this.props.onSettingsPress == null}
                onPress={this.props.onSettingsPress}
                style={styles.settingsButton}
              />
            )}
            {(this.props.legend?.length ?? 0) > 0 && (
              <View
                style={[
                  styles.legendContainer,
                  this.props.subtitle && this.props.subtitleBelowLegend ? { marginBottom: 8 } : {}
                ]}
              >
                {/* $FlowFixMe */}
                {this.props.legend?.map(item => {
                  return (
                    <React.Fragment key={item.title}>
                      <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                      <Text style={styles.legendTitle}>{item.title}</Text>
                    </React.Fragment>
                  );
                })}
              </View>
            )}
            {this.props.subtitle && this.props.subtitleBelowLegend && (
              <Text numberOfLines={0} style={[styles.subtitle, styles.subtitleBottom, this.props.subtitleStyle]}>
                {this.props.subtitle}
              </Text>
            )}
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}
