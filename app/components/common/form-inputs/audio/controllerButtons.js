// @flow
import React from 'react';
import { Image, TouchableHighlight, View } from 'react-native';
import styles from './styles';

interface Props {
  canSubmit: boolean;
  permitted: boolean;
  submitted: boolean;
  leftButtonPress: () => Promise<void>;
  middleButtonPress: () => Promise<void>;
  rightButtonPress: () => Promise<void>;
  leftButtonIcon: number;
  middleButtonIcon: number;
  rightButtonIcon: number;
}

export const ControllerButtons = (props: Props) => {
  return (
    <View style={styles.recordingBoxFooter}>
      <TouchableHighlight disabled={!props.canSubmit} underlayColor="transparent" onPress={props.leftButtonPress}>
        <Image style={{ width: 36, height: 36 }} source={props.leftButtonIcon} />
      </TouchableHighlight>
      <TouchableHighlight
        disabled={!props.permitted && !props.submitted}
        onPress={props.middleButtonPress}
        underlayColor="transparent"
      >
        <Image source={props.middleButtonIcon} style={{ marginHorizontal: 60 }} />
      </TouchableHighlight>
      <TouchableHighlight disabled={!props.canSubmit} onPress={props.rightButtonPress} underlayColor="transparent">
        <Image style={{ width: 36, height: 36 }} source={props.rightButtonIcon} />
      </TouchableHighlight>
    </View>
  );
};
