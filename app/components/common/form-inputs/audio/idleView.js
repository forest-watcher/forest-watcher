//@flow

import React from 'react';
import { Text, View } from 'react-native';
import styles from './styles';
import i18n from 'i18next';

interface Props {}

export const IdleView = (props: Props) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 33 }}>
      <Text style={[styles.recordingBoxTitle, { opacity: 0.6 }]}>{i18n.t('report.voice.idleTitle')}</Text>
    </View>
  );
};
