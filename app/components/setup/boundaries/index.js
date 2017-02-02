import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableHighlight
} from 'react-native';

import ProtectedAreas from 'components/common/protected-areas';
import Theme from 'config/theme';
import styles from './styles';

class SetupBoundaries extends Component {
  static navigationOptions = {
    header: {
      visible: false
    }
  }
  
  constructor() {
    super();
    this.state = {
      showProtectedAreas: false
    };
  }

  onShowProtectedAreas() {
    this.setState({ showProtectedAreas: true });
  }
  onNext() {

  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Set up</Text>

        <View style={styles.selector}>
          <Text style={styles.selectorLabel}>Now, choose the boundaries</Text>

          <View style={styles.actions}>
            <TouchableHighlight
              style={styles.button}
              onPress={() => this.onShowProtectedAreas()}
              activeOpacity={0.8}
              underlayColor={Theme.background.white}
            >
              <View style={styles.buttonTextContainer}>
                <Text
                  style={styles.buttonText}
                  numberOfLines={2}
                >
                  Select a protected area
                </Text>
              </View>
            </TouchableHighlight>

            <TouchableHighlight
              style={styles.button}
              onPress={() => this.onNext()}
              activeOpacity={0.8}
              underlayColor={Theme.background.white}
            >
              <View style={styles.buttonTextContainer}>
                <Text
                  style={styles.buttonText}
                  numberOfLines={2}
                >
                  Draw an area
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
        <ProtectedAreas
          iso={'VEN'}
          visible={this.state.showProtectedAreas}
        />
      </View>
    );
  }
}

SetupBoundaries.propTypes = {
};

export default SetupBoundaries;
