import React, { Component } from 'react';
import {
  View,
  Animated,
  Easing
} from 'react-native';

import styles from './styles';

class AlertsListLoader extends Component {
  constructor() {
    super();

    this.state = {
      bounceValue: new Animated.Value(1)
    };
  }

  componentDidMount() {
    this.startAnimation();
  }

  startAnimation() {
    Animated.sequence([
      Animated.timing(this.state.bounceValue, {
        toValue: 1,
        easing: Easing.easeInOut,
        duration: 700,
        delay: this.props.index * 50
      }),
      Animated.timing(this.state.bounceValue, {
        toValue: 1.02,
        easing: Easing.easeInOut,
        duration: 700,
        delay: this.props.index * 50
      })
    ]).start(() => {
      this.startAnimation();
    });
  }

  render() {
    return (
      <View style={styles.content}>
        <Animated.View
          style={[styles.item, { transform: [{ scale: this.state.bounceValue }] }]}
        >
          <View style={styles.image} />
        </Animated.View>
      </View>
    );
  }
}

AlertsListLoader.propTypes = {
  index: React.PropTypes.number.isRequired
};

export default AlertsListLoader;
