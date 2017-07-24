import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View
} from 'react-native';

import Theme from 'config/theme';
import ActionButton from 'components/common/action-button';
import DrawAreas from 'components/setup/draw-areas';
import I18n from 'locales';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

class SetupBoundaries extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color5,
    navBarButtonColor: Theme.colors.color5,
    drawUnderNavBar: true,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main,
    navBarTransparent: true,
    navBarTranslucent: true
  };

  static propTypes = {
    setSetupArea: PropTypes.func.isRequired,
    setupCountry: PropTypes.object.isRequired,
    onNextPress: PropTypes.func.isRequired,
    storeGeostore: PropTypes.func.isRequired,
    area: PropTypes.shape({
      wdpaid: PropTypes.number,
      geostore: PropTypes.string
    })
  };

  componentDidMount() {
    tracker.trackScreenView('Boundaries');
  }

  onDrawAreaFinish = (area, snapshot) => {
    this.props.setSetupArea(area, snapshot);
    this.props.onNextPress();
  }
  storeGeostore = (id, data) => {
    this.props.storeGeostore(id, data);
  }

  render() {
    return (
      <View style={styles.container}>
        <DrawAreas
          country={this.props.setupCountry}
          storeGeostore={this.storeGeostore}
          onDrawAreaFinish={this.onDrawAreaFinish}
        />
        {this.props.area && (this.props.area.wdpaid || this.props.area.geostore)
          ?
            <ActionButton
              style={styles.buttonPos}
              onPress={this.props.onNextPress}
              text={I18n.t('commonText.next')}
            />
          : null
        }
      </View>
    );
  }
}

export default SetupBoundaries;
