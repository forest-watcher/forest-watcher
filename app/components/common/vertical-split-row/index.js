// @flow

import React, { Component } from 'react';

import { View, Text, TouchableHighlight, TouchableOpacity, Image, ImageBackground } from 'react-native';
import styles from './styles';

import SettingsButton from 'components/common/settings-button';
import Callout from 'components/common/callout';

const nextIcon = require('assets/next.png');
const checkboxOff = require('assets/checkbox_off.png');
const checkboxOn = require('assets/checkbox_on.png');
const radioOn = require('assets/radio_button.png');
const downloadIcon = require('assets/download.png');

type ViewProps = React.ElementProps<typeof View>;
type ViewStyleProp = $PropertyType<ViewProps, 'style'>;

type Legend = {
  color: string,
  title: string
};

type Props = {
  disableSettingsButton?: ?string | ?boolean,
  disableStyleSettingsButton?: boolean,
  downloadCalloutBody?: ?boolean,
  downloadCalloutVisible?: ?boolean,
  downloadCalloutTitle?: ?string,
  downloadVisible?: ?boolean,
  hideDivider?: ?boolean,
  hideImage?: ?boolean,
  imageSrc?: ?string | ?number,
  largeImage?: ?boolean,
  largerLeftPadding?: ?boolean,
  legend?: ?Legend,
  onDownloadPress?: void => void,
  onPress: void => void,
  onSettingsPress?: void => void,
  useRadioIcon?: ?boolean,
  renderImageChildren?: (?void) => React.Node,
  selected?: ?boolean,
  settingsTitle?: ?string,
  smallerVerticalPadding?: ?boolean,
  style?: ?ViewStyleProp,
  subtitle?: ?string,
  title: string,
  backgroundImageResizeMode?: ?string
};

export default class VerticalSplitRow extends Component<Props> {
  render() {
    const { selected, downloadVisible, useRadioIcon } = this.props;
    let icon = nextIcon;
    if (selected === false) {
      icon = checkboxOff;
    } else if (selected === true) {
      icon = useRadioIcon ? radioOn : checkboxOn;
    }

    return (
      <TouchableHighlight
        activeOpacity={0.5}
        disabled={this.props.onPress == null}
        underlayColor="transparent"
        onPress={this.props.onPress}
        style={this.props.style}
      >
        <View style={styles.item}>
          {!this.props.hideImage && (
            <View style={[styles.imageContainer, this.props.largeImage ? styles.largeImageContainer : {}]}>
              {!!this.props.imageSrc && (
                <ImageBackground
                  resizeMode={this.props.backgroundImageResizeMode || 'cover'}
                  style={styles.image}
                  source={typeof this.props.imageSrc === 'string' ? { uri: this.props.imageSrc } : this.props.imageSrc}
                >
                  {this.props.renderImageChildren && this.props.renderImageChildren()}
                </ImageBackground>
              )}
              {downloadVisible && (
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
          <View style={[styles.contentContainer, this.props.largerLeftPadding ? styles.largerLeftPadding : {}]}>
            <View
              style={[
                styles.nameContainer,
                !this.props.hideDivider ? styles.bottomBorder : {},
                this.props.smallerVerticalPadding ? styles.smallerVerticalPadding : {}
              ]}
            >
              <View style={styles.titleContainer}>
                <Text numberOfLines={2} style={styles.title}>
                  {this.props.title}
                </Text>
                <Image style={styles.disclosureIndicator} source={icon} />
              </View>
              {!!this.props.subtitle && <Text style={styles.subtitle}>{this.props.subtitle}</Text>}
            </View>
            {(this.props.settingsTitle || this.props.onSettingsPress) && (
              <SettingsButton
                title={this.props.settingsTitle}
                disabledStyle={this.props.disableStyleSettingsButton}
                disabled={this.props.disableSettingsButton || this.props.onSettingsPress == null}
                onPress={this.props.onSettingsPress}
                style={styles.settingsButton}
              />
            )}
            {this.props.legend?.length && (
              <View style={styles.legendContainer}>
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
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}
