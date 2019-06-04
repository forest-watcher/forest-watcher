import React from 'react';
import PropTypes from 'prop-types';
import { Image, Text, TouchableHighlight, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import Theme from 'config/theme';
import styles from '../area-list/styles';

const nextIcon = require('assets/next.png');

function RouteList(props) {
  const { routes, onRoutePress } = props;
  if (!routes) return null;

  return (
    <View>
      {routes.map(route => (
        <View key={`${route.name}-route-list`} style={styles.container}>
          <TouchableHighlight activeOpacity={0.5} underlayColor="transparent" onPress={() => onRoutePress(route.name)}>
            <View style={styles.item}>
              <View style={styles.imageContainer}>
                {route.image ? <FastImage style={styles.image} source={{ uri: route.image }} /> : null}
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={2}>
                  {route.name}
                </Text>
              </View>
              <Image style={Theme.icon} source={nextIcon} />
            </View>
          </TouchableHighlight>
        </View>
      ))}
    </View>
  );
}

RouteList.propTypes = {
  onRoutePress: PropTypes.func,
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      timestamp: PropTypes.number,
      locations: PropTypes.arrayOf(
        PropTypes.shape({
          longitude: PropTypes.number.isRequired,
          latitude: PropTypes.number.isRequired,
          timestamp: PropTypes.number.isRequired
        })
      )
    })
  )
};

export default RouteList;
