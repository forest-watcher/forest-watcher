// @flow

import React, { Component } from 'react';
import { Image, Platform, Text, TouchableHighlight, TouchableNativeFeedback, View } from 'react-native';
import styles from './styles';
import Theme from 'config/theme';
import debounceUI from 'helpers/debounceUI';
import { Navigation } from 'react-native-navigation';

const rightArrow = require('assets/next.png');

type Props = {
  title: string,
  subtitle: string,
  type: string,
  featureId: string,
  style: any
};

export default class InfoBanner extends Component<Props> {
  openRoute = (routeId: string, routeName: string) => {
    Navigation.showModal({
      stack: {
        children: [
          {
            component: {
              name: 'ForestWatcher.RouteDetail',
              passProps: {
                routeId,
                routeName
              }
            }
          }
        ]
      }
    });
  };

  onPress = debounceUI(() => {
    if (this.props.type === 'route') {
      this.openRoute(this.props.featureId, this.props.title);
    }
  });

  render() {
    const Touchable = Platform.select({
      android: TouchableNativeFeedback,
      ios: TouchableHighlight
    });

    return (
      <Touchable
        background={Platform.select({
          android: TouchableNativeFeedback.Ripple(Theme.background.gray),
          ios: undefined
        })}
        underlayColor="transparent"
        onPress={this.onPress}
      >
        <View style={[styles.container, this.props.style]}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{this.props.title || ''}</Text>
            <Text style={styles.subtitle}>{this.props.subtitle || ''}</Text>
          </View>
          {this.props.type === 'route' && <Image source={rightArrow} />}
        </View>
      </Touchable>
    );
  }
}
