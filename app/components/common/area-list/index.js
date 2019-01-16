import React from 'react';
import PropTypes from 'prop-types';
import { Image, Text, TouchableHighlight, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import Theme from 'config/theme';

import AreaCache from 'containers/common/area-list/area-cache';
import styles from './styles';

const nextIcon = require('assets/next.png');

function AreaList(props) {
  const { areas, onAreaPress, showCache, pristine } = props;
  if (!areas) return null;

  return (
    <View>
      {areas.map((area, index) => (
        <View key={`${area.id}-area-list`} style={styles.container}>
          <TouchableHighlight
            activeOpacity={0.5}
            underlayColor="transparent"
            onPress={() => onAreaPress(area.id, area.name)}
          >
            <View style={styles.item}>
              <View style={styles.imageContainer}>
                {area.image ? <FastImage style={styles.image} source={{ uri: area.image }} /> : null}
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={2}>
                  {' '}
                  {area.name}{' '}
                </Text>
              </View>
              <Image style={Theme.icon} source={nextIcon} />
            </View>
          </TouchableHighlight>
          {showCache && <AreaCache areaId={area.id} showTooltip={index === 0 && pristine} />}
        </View>
      ))}
    </View>
  );
}

AreaList.propTypes = {
  areas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      image: PropTypes.string
    })
  ),
  onAreaPress: PropTypes.func,
  showCache: PropTypes.bool,
  pristine: PropTypes.bool
};

export default AreaList;
