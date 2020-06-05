// @flow
import React, { PureComponent } from 'react';
import { Image, View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { Navigation } from 'react-native-navigation';
import { withSafeArea } from 'react-native-safe-area';

import styles from './styles';

const SafeAreaView = withSafeArea(View, 'padding');

const closeIcon = require('assets/close_white.png');

type Props = {
  title: string,
  body: string,
  componentId: string
};

export default class Information extends PureComponent<Props> {
  static options(passProps: {}) {
    return {
      topBar: {
        drawBehind: true,
        visible: false,
        background: {
          color: 'transparent'
        }
      }
    };
  }

  dismiss = () => {
    Navigation.dismissModal(this.props.componentId);
  };

  shouldSetResponder = () => {
    console.log("Should set responder");
    this.dismiss();
    return true;
  };

  render() {
    return (
      <React.Fragment>
        <View style={StyleSheet.absoluteFill} onStartShouldSetResponder={this.shouldSetResponder} />
        <SafeAreaView pointerEvents={'box-none'} style={styles.container}>
          <TouchableOpacity style={styles.closeIconTouchable} onPress={this.dismiss}>
            <Image style={styles.closeIcon} source={closeIcon} />
          </TouchableOpacity>
          <View onStartShouldSetResponder={null} style={styles.contentContainer}>
            <Text style={styles.titleText}>{this.props.title}</Text>
            <ScrollView alwaysBounceVertical={false}>
              <Text style={styles.bodyText}>{this.props.body}</Text>
            </ScrollView>
          </View>
          <View style={styles.closeIconTouchable}>
            <Image style={[styles.closeIcon, { opacity: 0 }]} source={closeIcon} />
          </View>
        </SafeAreaView>
      </React.Fragment>
    );
  }
}
