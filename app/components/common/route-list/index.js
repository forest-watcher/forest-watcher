import React from 'react';
import PropTypes from 'prop-types';
import { Image, Text, TouchableHighlight, View } from 'react-native';

import Theme from 'config/theme';
import styles from '../area-list/styles';
import { formatDistance, getDistanceOfPolyline } from 'helpers/map';
import moment from 'moment';

const nextIcon = require('assets/next.png');

function RouteList(props) {
  const { routes, onRoutePress } = props;
  if (!routes) return null;

  return (
    <View>
      {routes.map(route => {
        const routeDistance = getDistanceOfPolyline(route.locations);
        const dateText = moment(route.endDate).format('ll');
        const distanceText = formatDistance(routeDistance, 1, false);
        return (
          <View key={`${route.id}-route-list`} style={[styles.container, { marginBottom: 4 }]}>
            <TouchableHighlight
              activeOpacity={0.5}
              underlayColor="transparent"
              onPress={() => onRoutePress(route.id, route.name)}
            >
              <View style={styles.item}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title} numberOfLines={1}>
                    {route.name}
                  </Text>
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {`${dateText} | ${distanceText}`}
                  </Text>
                </View>
                <Image style={Theme.icon} source={nextIcon} />
              </View>
            </TouchableHighlight>
          </View>
        );
      })}
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
