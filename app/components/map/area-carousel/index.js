import React, { Component } from 'react';
import I18n from 'locales';
import {
  View,
  Text,
  TouchableHighlight,
  Image
} from 'react-native';
import throttle from 'lodash/throttle';
import Theme from 'config/theme';

import Carousel from 'react-native-snap-carousel';
import { enabledDatasetName } from 'helpers/area';
import GeoPoint from 'geopoint';
import { sliderWidth, itemWidth, styles } from './styles';

const settingsIcon = require('assets/settings.png');

const NO_ALERT_SELECTED = I18n.t('commonText.noAlertSystem');

class AreaCarousel extends Component {
  handleLink(area) {
    this.props.navigator.push({
      screen: 'ForestWatcher.AreaDetail',
      title: area.name,
      passProps: {
        id: area.id,
        disableDelete: true
      }
    });
  }

  render() {
    const { alertSelected, lastPosition, selectedArea } = this.props;
    let distanceText = I18n.t('commonText.notAvailable');
    let positionText = '';
    let datasetName = I18n.t('commonText.notAvailable');
    let distance = 999999;
    const containerTextSyle = alertSelected
      ? [styles.textContainer, styles.textContainerSmall]
      : styles.textContainer;
    if (lastPosition && (alertSelected && alertSelected.latitude && alertSelected.longitude)) {
      const geoPoint = new GeoPoint(alertSelected.latitude, alertSelected.longitude);
      const currentPoint = new GeoPoint(lastPosition.latitude, lastPosition.longitude);
      positionText = `${I18n.t('commonText.yourPosition')}: ${lastPosition.latitude.toFixed(4)}, ${lastPosition.longitude.toFixed(4)}`;
      distance = currentPoint.distanceTo(geoPoint, true).toFixed(4);
      distanceText = `${distance} ${I18n.t('commonText.kmAway')}`; // in Kilometers
    }

    const settingsButton = (area) => (
      <View style={styles.settingsButton}>
        <TouchableHighlight
          onPress={() => this.handleLink(area)}
          underlayColor="transparent"
          activeOpacity={0.8}
        >
          <Image style={Theme.icon} source={settingsIcon} />
        </TouchableHighlight>
      </View>
    );

    const sliderItems = this.props.areas.map((area, index) => {
      datasetName = enabledDatasetName(area) || NO_ALERT_SELECTED;
      return (
        <View key={`entry-${index}`} style={styles.slideInnerContainer}>
          <Text style={containerTextSyle}>{ area.name } - { datasetName }</Text>
          {alertSelected &&
            <View style={styles.currentPosition}>
              <Text style={styles.coordinateDistanceText}>
                {distanceText}
              </Text>
              <Text style={styles.coordinateDistanceText}>
                {positionText}
              </Text>
            </View>
          }
          {settingsButton(area)}
        </View>
      );
    });

    return (
      <View style={{ position: 'absolute', bottom: 0, zIndex: 10 }}>
        <Carousel
          ref={(carousel) => { this.carousel = carousel; }}
          firstItem={selectedArea}
          sliderWidth={sliderWidth}
          itemWidth={itemWidth}
          onSnapToItem={throttle((index) => this.props.updateSelectedArea(index), 300)}
          showsHorizontalScrollIndicator={false}
          slideStyle={styles.slideStyle}
        >
          { sliderItems }
        </Carousel>
      </View>
    );
  }
}

AreaCarousel.propTypes = {
  alertSelected: React.PropTypes.object,
  lastPosition: React.PropTypes.object,
  areas: React.PropTypes.array,
  navigator: React.PropTypes.object.isRequired,
  updateSelectedArea: React.PropTypes.func,
  selectedArea: React.PropTypes.number
};

export default AreaCarousel;
