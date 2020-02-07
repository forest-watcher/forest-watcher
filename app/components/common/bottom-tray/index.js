import React, { Component } from 'react';

import { View } from 'react-native';
import styles from './styles';
import { withSafeArea } from 'react-native-safe-area';

const SafeAreaView = withSafeArea(View, 'margin', 'bottom')

type Props = {
  
};

class BottomTray extends Component<Props> {

  render() {  

    return (
      <View
        style={[styles.container, this.props.style]}
      >
        <SafeAreaView>
          {this.props.children}
        </SafeAreaView>
      </View>
    )
  }
}

export default BottomTray;

