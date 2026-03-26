// @flow
import React, { useEffect, useState } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';

type Props = {|
  +animating: boolean,
  +animationDuration: number,
  +animationEasing: () => any,
  +count: number,
  +hideAnimationDuration: number,
  +hidesWhenStopped: boolean,
  +interaction: boolean,
  +color: string,
  +size: number
|};

// Max height for audio spectrum bars - see screen 03.13
const SPECTRUM_MAX_LEVELS = [14, 35, 30, 14, 55, 63, 36, 21, 50, 33, 18, 11];

/*
 *  0 -> 1
 *    | startAnimation
 *    | resumeAnimation
 *
 *  1 -> -1
 *    | stopAnimation
 *
 * -1 -> 0
 *    | saveAnimation
 */
let animationState = 0;
let savedValue = 0;

// Adapated from https://github.com/n4kz/react-native-indicators/blob/master/src/components/bar-indicator/index.js
const BarIndicator = (props: Props) => {
  const [progress] = useState<Animated.Value>(new Animated.Value(0));
  const [hideAnimation] = useState<Animated.Value>(new Animated.Value(props.animating ? 1 : 0));

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      opacity: 1
    }
  });

  useEffect(() => {
    const { animating } = props;
    animationState = 0;

    if (animating) {
      startAnimation();
    }
  }, []);

  useEffect(
    () => {
      const { animating } = props;

      if (animating === true) {
        resumeAnimation();
      } else {
        stopAnimation();
      }

      Animated.timing(hideAnimation, {
        toValue: animating ? 1 : 0,
        duration: props.hideAnimationDuration,
        useNativeDriver: true
      }).start();
    },
    [props.animating]
  );

  const outputRange = (base, index, count, samples) => {
    const range = Array.from(
      new Array(samples),
      (item, index) => base * Math.abs(Math.cos((Math.PI * index) / (samples - 1)))
    );

    for (let j = 0; j < index * (samples / count); j++) {
      range.unshift(range.pop());
    }

    range.unshift(...range.slice(-1));

    return range;
  };

  const renderComponent = (element, index) => {
    const { color: backgroundColor, animationDuration, count } = props;

    const frames = (60 * animationDuration) / 1000;
    let samples = 0;

    do samples += count;
    while (samples < frames);

    const inputRange = Array.from(new Array(samples + 1), (item, index) => index / samples);

    const width = 6,
      height = SPECTRUM_MAX_LEVELS[index] / 2,
      radius = Math.ceil(width / 2);

    const containerStyle = {
      height: SPECTRUM_MAX_LEVELS[index],
      width: width,
      marginHorizontal: 1.25
    };

    const topStyle = {
      width,
      height,
      backgroundColor,
      borderTopLeftRadius: radius,
      borderTopRightRadius: radius,
      transform: [
        {
          translateY: progress.interpolate({
            inputRange,
            outputRange: outputRange(+(height - radius) / 2, index, count, samples)
          })
        }
      ]
    };

    const bottomStyle = {
      width,
      height,
      backgroundColor,
      borderBottomLeftRadius: radius,
      borderBottomRightRadius: radius,
      transform: [
        {
          translateY: progress.interpolate({
            inputRange,
            outputRange: outputRange(-(height - radius) / 2, index, count, samples)
          })
        }
      ]
    };

    return (
      <View style={containerStyle} {...{ key: index }}>
        <Animated.View style={topStyle} />
        <Animated.View style={bottomStyle} />
      </View>
    );
  };

  const startAnimation = () => {
    const { interaction, animationEasing, animationDuration } = props;

    if (0 !== animationState) {
      return;
    }

    const animation = Animated.timing(progress, {
      duration: animationDuration,
      easing: animationEasing,
      useNativeDriver: true,
      isInteraction: interaction,
      toValue: 1
    });

    animationState = 1;

    Animated.loop(animation).start();
  };

  const stopAnimation = () => {
    if (1 !== animationState) {
      return;
    }

    const listener = progress.addListener(({ value }) => {
      progress.removeListener(listener);
      progress.stopAnimation(() => saveAnimation(value));
    });

    animationState = -1;
  };

  const saveAnimation = value => {
    const { animating } = props;

    savedValue = value;
    animationState = 0;

    if (animating) {
      resumeAnimation();
    }
  };

  const resumeAnimation = () => {
    const { interaction, animationDuration } = props;

    if (0 !== animationState) {
      return;
    }

    Animated.timing(progress, {
      useNativeDriver: true,
      isInteraction: interaction,
      duration: (1 - savedValue) * animationDuration,
      toValue: 1
    }).start(({ finished }) => {
      if (finished) {
        progress.setValue(0);

        animationState = 0;
        startAnimation();
      }
    });

    savedValue = 0;
    animationState = 1;
  };

  return <Animated.View style={styles.container}>{Array.from(new Array(props.count), renderComponent)}</Animated.View>;
};

BarIndicator.defaultProps = {
  animating: true,
  animationDuration: 1200,
  animationEasing: Easing.linear,
  color: 'rgb(0, 0, 0)',
  count: 3,
  hideAnimationDuration: 200,
  hidesWhenStopped: true,
  interaction: true,
  size: 40
};

export default BarIndicator;
