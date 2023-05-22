// @flow

import { Image, Platform, Text, TouchableHighlight, TouchableNativeFeedback, View } from 'react-native';
import Theme from 'config/theme';
import styles from './styles';
import * as React from 'react';
const nextIcon = require('assets/next.png');
import { type Assignment, ASSIGNMENTS_STATUS_TITLE } from 'types/assignments.types';
import { getAssignmentLocationTitle } from '../../types/assignments.types';

interface Props {
  onPress: () => void;
  assignment: Assignment;
  areaName: string;
}

export const AssignmentRow = (props: Props): React$Element<any> => {
  const Touchable = Platform.select({
    android: TouchableNativeFeedback,
    ios: TouchableHighlight
  });
  const location = getAssignmentLocationTitle(props.assignment)
    .filter(x => x)
    .join(', ');
  return (
    <Touchable activeOpacity={1} underlayColor="transparent" onPress={props.onPress} disabled={false}>
      <View style={styles.row}>
        <Image source={{ uri: props.assignment.image }} style={{ height: '100%', width: 128 }} />
        <View style={styles.tableRowContent}>
          <Text
            style={[
              styles.tableRowText,
              {
                marginBottom: 4
              }
            ]}
          >
            {props.assignment.name}
          </Text>
          <Text style={styles.tableRowText}>{props.areaName}</Text>
          <Text style={styles.tableRowText}>{props.assignment.createdAt.split('T')[0]}</Text>
          <Text style={styles.tableRowText}>{location}</Text>
          <Text style={styles.tableRowText}>{ASSIGNMENTS_STATUS_TITLE(props.assignment.status)}</Text>
        </View>
        <Image
          style={[
            Theme.icon,
            {
              marginRight: 24
            }
          ]}
          source={nextIcon}
        />
      </View>
    </Touchable>
  );
};
