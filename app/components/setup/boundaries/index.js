import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  Image
} from 'react-native';

import MapModal from 'components/common/map-modal';
import ActionButton from 'components/common/action-button';
import ProtectedAreas from 'components/setup/protected-areas';
import DrawAreas from 'components/setup/draw-areas';
import Theme from 'config/theme';
import I18n from 'locales';
import styles from './styles';

const sections = [
  {
    title: I18n.t('boundaries.chooseBoundaries'),
    section: '',
    image: ''
  },
  {
    title: I18n.t('boundaries.selectProtectedArea'),
    section: '',
    image: ''
  },
  {
    title: I18n.t('boundaries.drawArea'),
    section: '',
    image: ''
  },
  {
    title: I18n.t('commonText.next'),
    section: '',
    image: ''
  }
];

const protectedAreaImage = require('assets/select_pa.png');
const drawAreaImage = require('assets/draw_pa.png');

class SetupBoundaries extends Component {
  static navigationOptions = {
    header: {
      visible: false
    }
  }

  constructor() {
    super();
    this.state = {
      showProtectedAreas: false,
      showDrawAreas: false
    };
  }

  onAreaSelected = (area, snapshot) => {
    this.props.setSetupArea(area, snapshot);
    this.setProtectedAreasStatus(false);
    this.props.onNextPress();
  }

  onDrawAreaFinish = (area, snapshot) => {
    this.props.setSetupArea(area, snapshot);
    this.setDrawAreasStatus(false);
    this.props.onNextPress();
  }

  setProtectedAreasStatus(status) {
    this.setState({ showProtectedAreas: status });
  }
  setDrawAreasStatus(status) {
    this.setState({ showDrawAreas: status });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.selector}>
          <Text style={styles.selectorLabel}>{sections[0].title}</Text>

          <View style={styles.actions}>
            <TouchableHighlight
              style={styles.section}
              onPress={() => this.setProtectedAreasStatus(true)}
              activeOpacity={0.8}
              underlayColor={Theme.background.white}
            >
              <View style={styles.sectionTextContainer}>
                <Image
                  style={styles.iconProtected}
                  source={protectedAreaImage}
                />
                <Text
                  style={styles.sectionText}
                  numberOfLines={2}
                >
                  {sections[1].title}
                </Text>
              </View>
            </TouchableHighlight>

            <TouchableHighlight
              style={styles.section}
              onPress={() => this.setDrawAreasStatus(true)}
              activeOpacity={0.8}
              underlayColor={Theme.background.white}
            >
              <View style={styles.sectionTextContainer}>
                <Image
                  style={styles.iconDraw}
                  source={drawAreaImage}
                />
                <Text
                  style={styles.sectionText}
                  numberOfLines={2}
                >
                  {sections[2].title}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
        {this.state.showProtectedAreas &&
          <MapModal
            visible
            onClosePress={() => this.setProtectedAreasStatus(false)}
            title={I18n.t('boundaries.selectArea')}
          >
            <ProtectedAreas
              country={this.props.setupCountry}
              onAreaSelected={this.onAreaSelected}
            />
          </MapModal>
        }
        {this.state.showDrawAreas &&
          <MapModal
            visible
            onClosePress={() => this.setDrawAreasStatus(false)}
            title={I18n.t('boundaries.drawArea')}
          >
            <DrawAreas
              country={this.props.setupCountry}
              onDrawAreaFinish={this.onDrawAreaFinish}
            />
          </MapModal>
        }
        {this.props.area && (this.props.area.wdpaid || this.props.area.geostore)
          ? <ActionButton style={styles.buttonPos} onPress={this.props.onNextPress} text={sections[3].title} />
          : null
        }
      </View>
    );
  }
}

SetupBoundaries.propTypes = {
  setSetupArea: React.PropTypes.func.isRequired,
  setupCountry: React.PropTypes.object.isRequired,
  onNextPress: React.PropTypes.func.isRequired,
  area: React.PropTypes.shape({
    wdpaid: React.PropTypes.number,
    geostore: React.PropTypes.string
  })
};

export default SetupBoundaries;
