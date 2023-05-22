// @flow
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import styles from './styles';
import i18n from 'i18next';

const syncIcon = require('assets/sync.png');

type Props = {
  syncRemaining: number,
  areasLength: number
};

const SyncContainer = ({ syncRemaining, areasLength }: Props): React.FC => {
  const [loading, setLoading] = useState<number>(0); // %

  /**
   * Update Local Loading based on syncRemaining
   * Sequence: 9 8 7 196 195 194 ... 9 8 7 6 5 4 3 2 1 0
   * Calculation: Every step under 10 represents 3% -> 36% ; dispatchedAlerts -> 64%
   */
  const dispatchedAlerts = 2 + areasLength * 4; // ref: app/redux-modules/areas.js
  useEffect(
    () => {
      // 64%
      if (syncRemaining >= 10) {
        setLoading(9 + ((dispatchedAlerts - syncRemaining) * 64) / dispatchedAlerts);
      }
      // 12 steps -> 36% -> 3% each
      if (syncRemaining < 10 && syncRemaining !== 0) {
        setLoading(loading + 3);
      }
    },
    [syncRemaining]
  );

  /**
   * Spinning Animation
   */
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const rotate = rotateAnimation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  useEffect(
    () => {
      Animated.loop(
        Animated.timing(rotateAnimation, {
          toValue: 1,
          duration: 1350,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ).start();
    },
    [rotateAnimation]
  );

  return (
    <View>
      <View style={styles.contentContainer}>
        <Animated.Image source={syncIcon} style={{ transform: [{ rotate }] }} />
        <Text style={styles.text}>{i18n.t('dashboard.syncing')}</Text>
      </View>
      <View style={styles.loadingBarContainer}>
        <Animated.View style={[styles.loadingBar, { width: `${loading}%` }]} />
      </View>
    </View>
  );
};

export default SyncContainer;
