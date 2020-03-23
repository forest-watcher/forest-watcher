// @flow

import React, { Component } from 'react';

import { View, Text, TouchableHighlight, TouchableOpacity, Image } from 'react-native';
import styles from './styles';
import Theme from 'config/theme';

import SettingsButton from 'components/common/settings-button';
import Callout from 'components/common/callout';

const nextIcon = require('assets/next.png');
const checkboxOff = require('assets/checkbox_off.png');
const checkboxOn = require('assets/checkbox_on.png');
const downloadIcon = require('assets/download.png');

type Props = {
  downloadCalloutBody?: ?boolean,
  downloadCalloutVisible?: ?boolean,
  downloadCalloutTitle?: ?string,
  downloadVisible?: ?boolean,
  imageSrc?: ?string,
  onDownloadPress: void => void,
  onPress: void => void,
  onSettingsPress: void => void,
  selected?: ?boolean,
  subtitle?: ?string,
  title: string
};

export default class VerticalSplitRow extends Component<Props> {
  render() {
    const { selected, downloadVisible } = this.props;
    const icon = selected != null ? (selected ? checkboxOn : checkboxOff) : nextIcon;
    const inShareMode = selected === true || selected === false;

    return (
      <TouchableHighlight disabled={this.props.onPress == null} activeOpacity={0.5} underlayColor="transparent" onPress={this.props.onPress}>
        <View style={styles.item}>
          <View style={styles.imageContainer}>
            {this.props.imageSrc ? <Image style={styles.image} source={{ uri: this.props.imageSrc }} /> : null}
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
          <View style={styles.contentContainer}>
            <View style={styles.nameContainer}>
              <View>
                <Text style={styles.title} numberOfLines={2}>
                  {this.props.title}
                </Text>
                {!!this.props.subtitle && <Text style={styles.subtitle}>{this.props.subtitle}</Text>}
              </View>
              <Image style={[Theme.icon, styles.disclosureIndicator]} source={icon} />
            </View>
            <SettingsButton disabled={inShareMode || this.props.onSettingsPress == null} onPress={this.props.onSettingsPress} style={styles.settingsButton} />
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}
