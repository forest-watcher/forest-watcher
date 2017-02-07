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
<<<<<<< HEAD

  onNext() {

  }
=======
>>>>>>> c7c8a423fbfd38bdf99e8b88155449fc79ff8c1f

  render() {
    return (
      <View style={styles.container}>
<<<<<<< HEAD
        <View style={styles.header}>
          <Image
            style={styles.iconBack}
            source={require('assets/previous.png')}
          />
          <Text style={styles.title}>Set up</Text>
        </View>
=======
>>>>>>> c7c8a423fbfd38bdf99e8b88155449fc79ff8c1f

        <View style={styles.selector}>
          <Text style={styles.selectorLabel}>Now, choose the boundaries</Text>

          <View style={styles.actions}>
            <TouchableHighlight
              style={styles.section}
              onPress={() => this.onShowProtectedAreas()}
              activeOpacity={0.8}
              underlayColor={Theme.background.white}
            >
<<<<<<< HEAD
              <View style={styles.buttonContainer}>
                <Image
                  style={styles.iconProtected}
                  source={require('assets/select_pa.png')}
                />
=======
              <View style={styles.sectionTextContainer}>
>>>>>>> c7c8a423fbfd38bdf99e8b88155449fc79ff8c1f
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
<<<<<<< HEAD
              <View style={styles.buttonTextContainer}>
                <Image
                  style={styles.iconDraw}
                  source={require('assets/draw_pa.png')}
                />
=======
              <View style={styles.sectionTextContainer}>
>>>>>>> c7c8a423fbfd38bdf99e8b88155449fc79ff8c1f
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
<<<<<<< HEAD
  setSetupWdpaid: React.PropTypes.func.isRequired,
  setupCountry: React.PropTypes.func.isRequired
=======
  onNextPress: React.PropTypes.func.isRequired
>>>>>>> c7c8a423fbfd38bdf99e8b88155449fc79ff8c1f
};

export default SetupBoundaries;
