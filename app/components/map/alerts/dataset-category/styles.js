// @flow
import Theme from 'config/theme';

export const mapboxStyles = {
  alert: {
    iconRotationAlignment: 'map',
    iconAllowOverlap: true,
    iconSize: ['interpolate', ['exponential', 2], ['zoom'], 16, ['get', 'minIconSize'], 19, ['get', 'maxIconSize']],
    iconImage: ['get', 'icon'],
    iconOpacity: 0.75,
    symbolSortKey: ['get', 'sortKey']
  },
  clusteredPoints: {
    circlePitchAlignment: 'map',
    circleRadius: 20
  },
  clusterCount: {
    textColor: Theme.colors.white,
    textField: '{point_count}',
    textAllowOverlap: true,
    textSize: 12,
    textPitchAlignment: 'map'
  },
  darkTextClusterCount: {
    textColor: Theme.colors.greyishBrown
  }
};
