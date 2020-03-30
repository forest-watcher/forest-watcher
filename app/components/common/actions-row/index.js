//@flow

import React, { Component, type ElementConfig } from 'react';
import { View, TouchableHighlight, Image, Platform, TouchableNativeFeedback } from 'react-native';

import Theme from 'config/theme';
import styles from './styles';

type Action = {
  icon: string | number,
  onPress: void => void
};

type Props = {
  actions?: ?Array<Action>,
  onPress?: ?(void => void),
  imageSrc?: ?string | ?number,
  ...ElementConfig<typeof View>
};

class ActionsRow extends Component<Props> {
  render() {
    const Touchable = Platform.select({
      android: TouchableNativeFeedback,
      ios: TouchableHighlight
    });

    return (
      <Touchable
        activeOpacity={this.props.onPress ? this.props.opacity || 0.5 : 1}
        background={Platform.select({
          android: TouchableNativeFeedback.Ripple(Theme.background.gray),
          ios: undefined
        })}
        underlayColor="transparent"
        onPress={this.props.onPress}
      >
        <View style={[styles.row, this.props.rowStyle]}>
          {!!this.props.imageSrc && (
            <Image
              resizeMode={'cover'}
              style={styles.image}
              source={typeof this.props.imageSrc === 'string' ? { uri: this.props.imageSrc } : this.props.imageSrc}
            />
          )}
          <View style={[styles.content, this.props.style]}>{this.props.children}</View>
          {this.props.actions && this.props.actions.length > 0 && <View />}
        </View>
      </Touchable>
    );
  }
}

export default ActionsRow;
