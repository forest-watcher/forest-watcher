import React, { Component } from 'react';
import PropTypes from 'prop-types';
import I18n from 'locales';
import {
  View,
  Text,
  TouchableHighlight,
  Image
} from 'react-native';
import moment from 'moment';
import Theme from 'config/theme';

import Carousel from 'react-native-snap-carousel';
import { enabledDatasetName, activeDataset } from 'helpers/area';
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
    const { selectedArea } = this.props;

    let datasetName = I18n.t('commonText.notAvailable');
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
      const dataset = activeDataset(area);
      const lastUpdatedText = dataset ? `${I18n.t('commonText.updated')} ${moment(dataset.lastUpdate).fromNow()}` : '';
      datasetName = enabledDatasetName(area) || NO_ALERT_SELECTED;
      return (
        <View key={`entry-${index}`} style={styles.slideInnerContainer}>
          <Text style={styles.textContainer}>{ area.name }</Text>
          <Text style={styles.smallCarouselText}>
            { datasetName } - {lastUpdatedText}
          </Text>
          {settingsButton(area)}
        </View>
      );
    });
    return (
      <View style={styles.container}>
        <View style={styles.footerZIndex}>
          <Carousel
            firstItem={selectedArea}
            sliderWidth={sliderWidth}
            itemWidth={itemWidth}
            onSnapToItem={this.props.updateSelectedArea}
            scrollEndDragDebounceValue={300}
            showsHorizontalScrollIndicator={false}
            slideStyle={styles.slideStyle}
          >
            { sliderItems }
          </Carousel>
        </View>
      </View>
    );
  }
}

AreaCarousel.propTypes = {
  areas: PropTypes.array,
  navigator: PropTypes.object.isRequired,
  updateSelectedArea: PropTypes.func,
  selectedArea: PropTypes.number
};

export default AreaCarousel;
