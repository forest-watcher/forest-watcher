//@flow

import React from 'react';
import { Text, View } from 'react-native';
import styles from './styles';
import RecordingIndicator from './recordingAnimation';
import i18n from 'i18next';

interface Props {
  status: 'RECORDING' | 'PAUSED';
  time: string;
}

export const RecordingView = (props: Props) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 33 }}>
      <Text style={styles.recordingBoxTitle}>
        {props.status === 'RECORDING' ? i18n.t('report.voice.recording') : i18n.t('report.voice.paused')}
      </Text>
      <RecordingIndicator animating={props.status === 'RECORDING'} color="#94BE43" count={12} />
      <Text>{props.time}</Text>
    </View>
  );
};
