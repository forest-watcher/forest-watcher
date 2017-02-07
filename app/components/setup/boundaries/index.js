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

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.selector}>
          <Text style={styles.selectorLabel}>Now, choose the boundaries</Text>

          <View style={styles.actions}>
            <TouchableHighlight
              style={styles.section}
              onPress={() => this.onShowProtectedAreas()}
              activeOpacity={0.8}
              underlayColor={Theme.background.white}
            >
              <View style={styles.sectionTextContainer}>
                <Image
                  style={styles.iconProtected}
                  source={require('assets/select_pa.png')}
                />
                <Text
                  style={styles.sectionText}
                  numberOfLines={2}
                >
                  Select a protected area
                </Text>
              </View>
            </TouchableHighlight>

            <TouchableHighlight
              style={styles.section}
              onPress={this.props.onNextPress}
              activeOpacity={0.8}
              underlayColor={Theme.background.white}
            >
              <View style={styles.sectionTextContainer}>
                <Image
                  style={styles.iconDraw}
                  source={require('assets/draw_pa.png')}
                />
                <Text
                  style={styles.sectionText}
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
  setupCountry: React.PropTypes.object.isRequired,
  onNextPress: React.PropTypes.func.isRequired
};

export default SetupBoundaries;
