import React from 'react';
import PropTypes from 'prop-types';
import {
  Image,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import Theme from 'config/theme';

import AreaCache from 'containers/dashboard/area-cache';
import styles from './styles';

const nextIcon = require('assets/next.png');
const downloadedIcon = require('assets/downloaded.png');

function AreaList(props) {
  const { areas, onAreaPress, showCache } = props;
  if (!areas) return null;

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
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={2}> {area.name} </Text>
                {showCache && area.cacheComplete &&
                  <Image style={[Theme.icon, styles.downloadedIcon]} source={downloadedIcon} />
                }
              </View>
              <TouchableHighlight
                activeOpacity={0.5}
                underlayColor="transparent"
                onPress={() => onAreaPress(area.id, area.name)}
              >
                <Image style={Theme.icon} source={nextIcon} />
              </TouchableHighlight>
            </View>
          </TouchableHighlight>
          {showCache && !area.cacheComplete &&
            <AreaCache areaId={area.id} />
          }
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
      image: PropTypes.string,
      cacheComplete: PropTypes.bool
    })
  ),
  onAreaPress: PropTypes.func,
  showCache: PropTypes.bool
};

AreaList.defaultProps = {
  showCache: false
};

export default AreaList;
