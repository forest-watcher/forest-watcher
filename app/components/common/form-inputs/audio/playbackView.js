//@flow

import React from 'react';
import { Image, Text, View, TouchableHighlight } from 'react-native';
import styles from './styles';
import Slider from '@sharcoux/slider';
const deleteRoundIcon = require('assets/deleteRound.png');

interface Props {
  filename: string;
  date: string;
  playSpec: any;
  onDeletePressed: () => void;
  onSeek: (ms: number) => Promise<void>;
}

export const PlayBackView = (props: Props): React$Element<any> => {
  return (
    <View
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 33, paddingHorizontal: 24 }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          alignSelf: 'flex-start'
        }}
      >
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          <Text style={styles.recordingBoxTitle}>{props.filename}</Text>
          <Text style={[styles.recordingBoxDescription, { marginTop: 8 }]}>{props.date}</Text>
          <Text style={styles.recordingBoxDescription}>{props.playSpec.duration}</Text>
        </View>
        <TouchableHighlight onPress={props.onDeletePressed} underlayColor="transparent">
          <Image source={deleteRoundIcon} />
        </TouchableHighlight>
      </View>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, marginTop: 30 }}
      >
        <Text>{props.playSpec.playTime}</Text>
        <Slider
          maximumValue={props.playSpec.currentDurationSec}
          minimumValue={0}
          style={{ marginHorizontal: 12 }}
          value={props.playSpec.currentPositionSec}
          thumbTintColor={'#94BE43'}
          minimumTrackTintColor="#94BE43"
          maximumTrackTintColor="#E3ECC6"
          onValueChange={props.onSeek}
        />
        <Text>{props.playSpec.duration}</Text>
      </View>
    </View>
  );
};
