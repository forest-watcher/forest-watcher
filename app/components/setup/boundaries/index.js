import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  Image
} from 'react-native';

import MapModal from 'components/common/map-modal';
import ProtectedAreas from 'components/setup/protected-areas';
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
        <View style={styles.header}>
          <Image
            style={styles.iconBack}
            source={require('assets/previous.png')}
          />
          <Text style={styles.title}>Set up</Text>
        </View>

        <View style={styles.selector}>
          <Text style={styles.selectorLabel}>Now, choose the boundaries</Text>

          <View style={styles.actions}>
            <TouchableHighlight
              style={styles.button}
              onPress={() => this.onShowProtectedAreas()}
              activeOpacity={0.8}
              underlayColor={Theme.background.white}
            >
              <View style={styles.buttonContainer}>
                <Image
                  style={styles.iconProtected}
                  source={require('assets/select_pa.png')}
                />
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
                <Image
                  style={styles.iconDraw}
                  source={require('assets/draw_pa.png')}
                />
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
        <MapModal
          visible={this.state.showProtectedAreas}
          onClosePress={() => this.setState({ showProtectedAreas: false })}
        >
          <ProtectedAreas
            country={this.props.setupCountry}
            onAreaSelected={(area) => { this.props.setSetupWdpaid(area); }}
          />
        </MapModal>
      </View>
    );
  }
}

SetupBoundaries.propTypes = {
  setSetupWdpaid: React.PropTypes.func.isRequired,
  setupCountry: React.PropTypes.func.isRequired
};

export default SetupBoundaries;
