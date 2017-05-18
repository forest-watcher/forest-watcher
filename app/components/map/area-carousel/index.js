import React, { Component } from 'react';
import I18n from 'locales';
import {
  View,
  Text
} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { enabledDatasetName } from 'helpers/area';
import GeoPoint from 'geopoint';
import { sliderWidth, itemWidth, styles } from './styles';

const DEFAULT_DATASET_NAME = 'GLAD';

class AreaCarousel extends Component {
  handleUpdateSelectedArea(aId) {
    this.props.updateSelectedArea(aId);
  }

  render() {
    const { alertSelected, lastPosition } = this.props;
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

    const sliderItems = this.props.areas.map((area, index) => {
      datasetName = enabledDatasetName(area) || DEFAULT_DATASET_NAME;
      return (
        <View key={`entry-${index}`} style={styles.slideInnerContainer}>
          <Text style={containerTextSyle}>{ area.name }</Text>
          <Text style={styles.textContainerSmall}>{ datasetName }</Text>
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
        </View>
      );
    });

    return (
      <View style={{ position: 'absolute', bottom: 0, zIndex: 10 }}>
        <Carousel
          ref={(carousel) => { this.carousel = carousel; }}
          sliderWidth={sliderWidth}
          itemWidth={itemWidth}
          onSnapToItem={(index) => this.handleUpdateSelectedArea(index)}
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
  updateSelectedArea: React.PropTypes.func
};

export default AreaCarousel;
