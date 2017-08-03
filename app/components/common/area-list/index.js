import React from 'react';
import PropTypes from 'prop-types';
import {
  Image,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import Theme from 'config/theme';

import AreaCache from './area-cache';
import styles from './styles';

const nextIcon = require('assets/next.png');

function AreaList(props) {
  const { areas, onAreaPress, cacheProgress, downloadArea } = props;
  if (!areas) return null;

  const hasCache = id => (cacheProgress && cacheProgress[id] && !cacheProgress[id].complete);
  return (
    <View>
      {areas.map((area, index) => (
        <View key={`${area.id}-area-list`} style={styles.container}>
          <TouchableHighlight
            activeOpacity={0.5}
            underlayColor="transparent"
            onPress={() => onAreaPress(area.id, area.name, index)}
          >
            <View style={styles.item}>
              <View style={styles.imageContainer}>
                {area.image
                  ? <Image style={styles.image} source={{ uri: area.image }} />
                  : null
                }
              </View>
              <Text style={styles.title} numberOfLines={2}> {area.name} </Text>
              <TouchableHighlight
                activeOpacity={0.5}
                underlayColor="transparent"
                onPress={() => onAreaPress(area.id, area.name)}
              >
                <Image style={Theme.icon} source={nextIcon} />
              </TouchableHighlight>
            </View>
          </TouchableHighlight>
          {hasCache(area.id) &&
            <AreaCache
              areaId={area.id}
              areaCache={cacheProgress[area.id]}
              downloadArea={downloadArea}
            />
          }
        </View>
      ))}
    </View>
  );
}

AreaList.propTypes = {
  areas: PropTypes.array,
  onAreaPress: PropTypes.func,
  cacheProgress: PropTypes.object,
  downloadArea: PropTypes.func
};

export default AreaList;
