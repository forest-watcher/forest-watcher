import React, { Component } from 'react';

import { View, Text, TouchableHighlight, Image } from 'react-native';
import styles from './styles';
import Theme from 'config/theme';

import SettingsButton from 'components/common/settings-button';

const nextIcon = require('assets/next.png');

type Props = {
  imageSrc:? string,
  onPress: void => void,
  onSettingsPress: void => void,
  subtitle:? string,
  title: string
};

export default class VerticalSplitRow extends Component<Props> {

  render() {
    return (
      <TouchableHighlight
        activeOpacity={0.5}
        underlayColor="transparent"
        onPress={this.props.onPress}
        key={this.props.key}    
      >            
        <View style={styles.item}>
          <View style={styles.imageContainer}>
            {this.props.imageSrc ? <Image style={styles.image} source={{ uri: this.props.imageSrc }} /> : null}
          </View>
          <View style={styles.contentContainer}>
            <View style={styles.nameContainer}>
              <View>
                <Text style={styles.title} numberOfLines={2}>
                  {this.props.title}
                </Text>
                {!!this.props.subtitle && (
                  <Text style={styles.subtitle}>
                    {this.props.subtitle}
                  </Text>
                )}
              </View>
              <Image style={[Theme.icon, styles.disclosureIndicator]} source={nextIcon} />
            </View>
            <SettingsButton 
              onPress={this.props.onSettingsPress}
              style={styles.settingsButton}
            />
          </View>
        </View>
      </TouchableHighlight>
    )
  }
}