// @flow

import React, { PureComponent } from 'react';
import { Image, Text, TouchableHighlight, View } from 'react-native';
import { Navigation } from 'react-native-navigation';

import styles from './styles';
import ActionButton from 'components/common/action-button';
import { withSafeArea } from 'react-native-safe-area';
import Row from 'components/common/row';
const closeImage = require('assets/close_gray.png');

const SafeAreaView = withSafeArea(View, 'margin', 'bottom');

type Props = {
  title: string,
  closeDialog: () => void,
  buttons: [{ text: string, onPress: () => void, style: 'main' | 'positive' | 'negative' }]
};

class BottomDialog extends PureComponent<Props> {
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Row rowStyle={styles.navRowContainer}>
          <View style={styles.navRow}>
            <TouchableHighlight
              style={styles.closeIconContainer}
              onPress={this.props.closeDialog}
              activeOpacity={0.5}
              underlayColor="transparent"
            >
              <Image style={styles.closeIcon} source={closeImage} />
            </TouchableHighlight>
            <Text style={styles.navRowText}>{this.props.title.toUpperCase()}</Text>
          </View>
        </Row>
        <View style={styles.bodyContainer}>
          {this.props.buttons.map((button, index) => (
            <ActionButton
              key={index}
              style={styles.actionButton}
              onPress={button.onPress}
              text={button.text.toUpperCase()}
              short
              noIcon
              delete={button.style == 'negative'}
            />
          ))}
        </View>
      </SafeAreaView>
    );
  }
}

export default BottomDialog;
