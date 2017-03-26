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
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

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

  componentDidMount() {
    tracker.trackScreenView('Boundaries');
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
    tracker.trackEvent('Set-up', 'Choose area type', { label: 'Protected Area', value: 0 });
  }
  setDrawAreasStatus(status) {
    this.setState({ showDrawAreas: status });
    tracker.trackEvent('Set-up', 'Choose area type', { label: 'Custom Area', value: 0 });
  }

  storeGeostore = (id, data) => {
    this.props.storeGeostore(id, data);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.selector}>
          <Text style={styles.selectorLabel}>{I18n.t('boundaries.chooseBoundaries')}</Text>

          <View style={styles.actions}>
            <TouchableHighlight
              style={[styles.section, styles.sectionDisabled]}
              onPress={() => console.log('TODO: this.setProtectedAreasStatus(true)')}
              activeOpacity={1}
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
                  {I18n.t('boundaries.selectProtectedArea')}
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
                  {I18n.t('boundaries.drawArea')}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
        {this.state.showProtectedAreas &&
          <MapModal
            visible
            onClosePress={() => this.setProtectedAreasStatus(false)}
            title={I18n.t('boundaries.selectProtectedArea')}
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
              storeGeostore={this.storeGeostore}
              onDrawAreaFinish={this.onDrawAreaFinish}
            />
          </MapModal>
        }
        {this.props.area && (this.props.area.wdpaid || this.props.area.geostore)
          ? <ActionButton style={styles.buttonPos} onPress={this.props.onNextPress} text={I18n.t('commonText.next')} />
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
  storeGeostore: React.PropTypes.func.isRequired,
  area: React.PropTypes.shape({
    wdpaid: React.PropTypes.number,
    geostore: React.PropTypes.string
  })
};

export default SetupBoundaries;
