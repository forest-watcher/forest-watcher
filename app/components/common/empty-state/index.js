// @flow

import React, { Component } from 'react';
import { Image, View, Text } from 'react-native';

import styles from './styles';

type Props = {
  actionTitle: string,
  body: string,
  icon: *,
  onActionPress: void => void,
  title: string
};

export default class EmptyState extends Component<Props> {
  render() {
    const { icon, title, body, onActionPress, actionTitle } = this.props;
    return (
      <View style={styles.container}>
        <Image style={styles.icon} source={icon} />
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.bodyText}>{body}</Text>
        <Text style={styles.actionText} onPress={onActionPress}>
          {actionTitle}
        </Text>
      </View>
    );
  }
}
