import React from 'react';
import PropTypes from 'prop-types';
import {
  Image,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import Theme from 'config/theme';

import Row from 'components/common/row';
import styles from './styles';

const nextIcon = require('assets/next.png');
const downloadIcon = require('assets/upload.png');

function AreaList(props) {
  const { areas } = props;
  if (!areas) return null;

  const cacheAreaAction = {
    icon: downloadIcon,
    callback: () => console.warn('CACHING BABY')
  };

  return (
    <View>
      {areas.map((area, index) => (
        <View key={`${area.id}-area-list`} style={styles.container}>
          <TouchableHighlight
            activeOpacity={0.5}
            underlayColor="transparent"
            onPress={() => props.onAreaPress(area.id, area.name, index)}
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
                onPress={() => props.onAreaPress(area.id, area.name)}
              >
                <Image style={Theme.icon} source={nextIcon} />
              </TouchableHighlight>
            </View>
          </TouchableHighlight>
          <Row action={cacheAreaAction}>
            <Text style={styles.rowTitle}>Make this area offline</Text>
          </Row>
        </View>
      ))}
    </View>
  );
}

AreaList.propTypes = {
  areas: PropTypes.array
};

export default AreaList;
